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

// Ensure column exists on db connect / start
async function asegurarColumnas() {
  try {
    await db.query(`ALTER TABLE ventas ADD COLUMN IF NOT EXISTS telefono_comprador VARCHAR(50)`);
  } catch (e) {
    // Catch if already exists or version doesn't support IF NOT EXISTS
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

    // Verificar stock disponible antes de crear la venta
    for (const item of items) {
      const [[variante]] = await conn.query(
        'SELECT stock, activo FROM variantes WHERE id = ?',
        [item.id_variante]
      );
      if (!variante || !variante.activo) {
        return res.status(400).json({ error: `Variante no disponible (id: ${item.id_variante})` });
      }
      if (variante.stock < item.cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para "${item.nombre_producto}"${item.nombre_variante && item.nombre_variante !== 'Única' ? ` (${item.nombre_variante})` : ''}. Stock disponible: ${variante.stock}`,
        });
      }
    }

    // Calcular total
    const total = items.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0);
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
    for (const item of items) {
      const subtotal = item.precio_unitario * item.cantidad;
      await conn.query(
        `INSERT INTO detalle_ventas
          (id_venta, id_variante, nombre_producto, nombre_variante, precio_unitario, cantidad, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [idVenta, item.id_variante, item.nombre_producto,
         item.nombre_variante || 'Única', item.precio_unitario, item.cantidad, subtotal]
      );
      await conn.query(
        'UPDATE variantes SET stock = GREATEST(0, stock - ?) WHERE id = ?',
        [item.cantidad, item.id_variante]
      );
    }

    await conn.commit();

    // Enviar email aviso admin (no bloqueante)
    const { venta, items: itemsDB } = await getVentaConItems(idVenta);
    enviarAvisoAdmin({ venta, items: itemsDB }).catch(e => console.error('Email admin error:', e));

    if (metodo_pago === 'transferencia') {
      enviarConfirmacionCliente({ venta, items: itemsDB }).catch(e => console.error('Email cliente error:', e));
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

module.exports = {
  iniciarCheckout,
  mpWebhook,
  confirmarTransferencia,
  cargarSeguimiento,
  getEstadoVenta,
};