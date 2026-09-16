// backend/controllers/checkoutController.js
const db = require('../config/db');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { enviarConfirmacionCliente, enviarAvisoAdmin, enviarSeguimiento } = require('../services/emailService');

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// ── Helper: obtener venta completa con items ──────────────────────────────────
async function getVentaConItems(idVenta, conn) {
  const c = conn || db;
  const [[venta]] = await c.query('SELECT * FROM ventas WHERE id = ?', [idVenta]);
  const [items] = await c.query('SELECT * FROM detalle_ventas WHERE id_venta = ?', [idVenta]);
  return { venta, items };
}

// Ensure column exists on db connect / start safely across all MySQL versions
async function asegurarColumnas() {
  try {
    const [cols] = await db.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ventas' AND COLUMN_NAME = 'telefono_comprador'
    `);
    if (cols.length === 0) {
      await db.query(`ALTER TABLE ventas ADD COLUMN telefono_comprador VARCHAR(50) AFTER nombre_comprador`);
      console.log("✅ Columna 'telefono_comprador' asegurada en la tabla ventas");
    }
  } catch (e) {
    console.warn("⚠️ Aviso al verificar columna telefono_comprador:", e.message);
  }
}
asegurarColumnas();

// ── 1. Iniciar checkout ───────────────────────────────────────────────────────
// POST /checkout/iniciar
const iniciarCheckout = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      nombre_comprador, telefono_comprador, email_comprador, codigo_postal,
      direccion, ciudad, provincia, metodo_pago, items,
    } = req.body;

    // Validaciones básicas
    if (!nombre_comprador || !email_comprador || !direccion || !ciudad || !provincia || !codigo_postal) {
      return res.status(400).json({ error: 'Faltan datos de envío' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }
    if (!['mercadopago', 'transferencia', 'retiro_en_persona'].includes(metodo_pago)) {
      return res.status(400).json({ error: 'Método de pago inválido' });
    }

    // Resolver y verificar stock de las variantes antes de crear la venta
    const itemsNormalizados = [];
    for (const item of items) {
      let idVariante = item.id_variante || null;

      // Si no viene id_variante, intentar encontrarlo por id_producto y nombre
      if (!idVariante && item.id) {
        const [vars] = await conn.query(
          `SELECT id, stock, activo FROM variantes 
           WHERE id_producto = ? AND (nombre = ? OR nombre = 'Única' OR activo = 1) 
           ORDER BY (nombre = ?) DESC LIMIT 1`,
          [item.id, item.nombre_variante || 'Única', item.nombre_variante || 'Única']
        );
        if (vars.length > 0) {
          idVariante = vars[0].id;
        }
      }

      if (idVariante) {
        const [[variante]] = await conn.query(
          'SELECT stock, activo FROM variantes WHERE id = ?',
          [idVariante]
        );
        if (variante && variante.activo && Number(variante.stock) < Number(item.cantidad)) {
          return res.status(400).json({
            error: `Stock insuficiente para "${item.nombre_producto}"${item.nombre_variante && item.nombre_variante !== 'Única' ? ` (${item.nombre_variante})` : ''}. Stock disponible: ${variante.stock}`,
          });
        }
      }

      itemsNormalizados.push({
        ...item,
        id_variante: idVariante,
      });
    }

    // Calcular total
    const total = itemsNormalizados.reduce((acc, item) => acc + Number(item.precio_unitario) * Number(item.cantidad), 0);
    const transportista = req.body.transportista || req.body.envio?.modalidad || req.body.envio?.transportista || 'Correo Argentino';

    // Crear venta
    const [result] = await conn.query(
      `INSERT INTO ventas 
        (total, estado, nombre_comprador, telefono_comprador, email_comprador, codigo_postal,
         direccion, ciudad, provincia, metodo_pago, estado_pago, transportista)
       VALUES (?, 'pendiente', ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?)`,
      [total, nombre_comprador, telefono_comprador || '', email_comprador, codigo_postal,
       direccion, ciudad, provincia, metodo_pago, transportista]
    );
    const idVenta = result.insertId;

    // Insertar detalle y descontar stock
    for (const item of itemsNormalizados) {
      const subtotal = Number(item.precio_unitario) * Number(item.cantidad);
      await conn.query(
        `INSERT INTO detalle_ventas
          (id_venta, id_variante, nombre_producto, nombre_variante, precio_unitario, cantidad, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [idVenta, item.id_variante || null, item.nombre_producto,
         item.nombre_variante || 'Única', item.precio_unitario, item.cantidad, subtotal]
      );
      if (item.id_variante) {
        await conn.query(
          'UPDATE variantes SET stock = GREATEST(0, stock - ?) WHERE id = ?',
          [item.cantidad, item.id_variante]
        );
      }
    }

    await conn.commit();

    // Enviar email aviso admin y cliente (no bloqueantes)
    try {
      const { venta, items: itemsDB } = await getVentaConItems(idVenta);
      enviarAvisoAdmin({ venta, items: itemsDB }).catch(e => console.error('Email admin error:', e.message || e));

      if (metodo_pago === 'transferencia') {
        enviarConfirmacionCliente({ venta, items: itemsDB }).catch(e => console.error('Email cliente error:', e.message || e));
      }
    } catch (eEmail) {
      console.error('Error preparando emails:', eEmail.message || eEmail);
    }

    return res.json({
      ok: true,
      metodo_pago,
      id_venta: idVenta,
      mensaje: 'Pedido registrado correctamente.',
    });

  } catch (err) {
    await conn.rollback();
    console.error('Error en iniciarCheckout:', err);
    res.status(500).json({ error: 'Error interno al procesar el pedido' });
  } finally {
    conn.release();
  }
};

// ── 2. Webhook de MercadoPago ─────────────────────────────────────────────────
// POST /checkout/mp-webhook
const mpWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;
    if (type !== 'payment') return res.sendStatus(200);

    const payment = new Payment(mpClient);
    const pagoData = await payment.get({ id: data.id });

    const idVenta = Number(pagoData.external_reference);
    const estado = pagoData.status; // approved | pending | rejected

    if (!idVenta) return res.sendStatus(200);

    if (estado === 'approved') {
      await db.query(
        `UPDATE ventas SET estado = 'pagado', estado_pago = 'aprobado', id_pago_mp = ? WHERE id = ?`,
        [String(pagoData.id), idVenta]
      );

      const { venta, items } = await getVentaConItems(idVenta);
      enviarConfirmacionCliente({ venta, items }).catch(e => console.error('Email webhook error:', e));
    } else if (estado === 'rejected') {
      await db.query(
        `UPDATE ventas SET estado_pago = 'rechazado' WHERE id = ?`,
        [idVenta]
      );
      // Devolver stock
      const [items] = await db.query('SELECT * FROM detalle_ventas WHERE id_venta = ?', [idVenta]);
      for (const item of items) {
        await db.query(
          'UPDATE variantes SET stock = stock + ? WHERE id = ?',
          [item.cantidad, item.id_variante]
        );
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Error en mpWebhook:', err);
    res.sendStatus(500);
  }
};

// ── 3. Confirmar transferencia (admin) ────────────────────────────────────────
// PATCH /checkout/confirmar-transferencia/:idVenta
const confirmarTransferencia = async (req, res) => {
  try {
    const { idVenta } = req.params;
    await db.query(
      `UPDATE ventas SET estado = 'pagado', estado_pago = 'aprobado' WHERE id = ?`,
      [idVenta]
    );

    const { venta, items } = await getVentaConItems(idVenta);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    // Si no se mandó el email de confirmación antes, mandarlo ahora
    enviarConfirmacionCliente({ venta, items }).catch(e => console.error('Email confirmación error:', e));

    res.json({ ok: true, mensaje: 'Pago confirmado' });
  } catch (err) {
    console.error('Error en confirmarTransferencia:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// ── 4. Cargar número de seguimiento (admin) ───────────────────────────────────
// PATCH /ventas/:idVenta/seguimiento
// Body: { numero_seguimiento, transportista (opcional) }
const cargarSeguimiento = async (req, res) => {
  try {
    const { idVenta } = req.params;
    const { numero_seguimiento, transportista } = req.body;

    if (!numero_seguimiento) {
      return res.status(400).json({ error: 'El número de seguimiento es requerido' });
    }

    await db.query(
      `UPDATE ventas SET numero_seguimiento = ?, estado = 'enviado' WHERE id = ?`,
      [numero_seguimiento, idVenta]
    );

    const { venta } = await getVentaConItems(idVenta);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    await enviarSeguimiento({ venta, numeroSeguimiento: numero_seguimiento, transportista });

    res.json({ ok: true, mensaje: 'Seguimiento guardado y email enviado' });
  } catch (err) {
    console.error('Error en cargarSeguimiento:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// ── 5. Estado de una venta (para página de éxito/error) ──────────────────────
// GET /checkout/venta/:idVenta
const getEstadoVenta = async (req, res) => {
  try {
    const { idVenta } = req.params;
    const { venta, items } = await getVentaConItems(idVenta);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json({ venta, items });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
};

// ── 6. Cancelar pedido / venta (admin) ───────────────────────────────────────
// PATCH /checkout/ventas/:idVenta/cancelar
const cancelarVenta = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { idVenta } = req.params;

    const [[venta]] = await conn.query('SELECT * FROM ventas WHERE id = ?', [idVenta]);
    if (!venta) {
      await conn.rollback();
      return res.status(404).json({ error: 'Pedido / venta no encontrado' });
    }

    if (venta.estado !== 'cancelado') {
      // Devolver stock
      const [items] = await conn.query('SELECT * FROM detalle_ventas WHERE id_venta = ?', [idVenta]);
      for (const item of items) {
        if (item.id_variante) {
          await conn.query(
            'UPDATE variantes SET stock = stock + ? WHERE id = ?',
            [item.cantidad, item.id_variante]
          );
        }
      }

      await conn.query(
        `UPDATE ventas SET estado = 'cancelado', estado_pago = 'cancelado' WHERE id = ?`,
        [idVenta]
      );
    }

    await conn.commit();
    res.json({ ok: true, mensaje: 'Pedido cancelado correctamente y stock restituido' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en cancelarVenta:', err);
    res.status(500).json({ error: 'Error interno al cancelar el pedido' });
  } finally {
    conn.release();
  }
};

module.exports = {
  iniciarCheckout,
  mpWebhook,
  confirmarTransferencia,
  cargarSeguimiento,
  getEstadoVenta,
  cancelarVenta,
};