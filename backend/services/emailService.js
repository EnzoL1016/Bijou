// backend/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // App Password de Google, NO la contraseña normal
  },
});

// ── Estilos base compartidos ──────────────────────────────────────────────────
const baseStyle = `
  font-family: 'Nunito', 'Segoe UI', sans-serif;
  background: #f8f4ff;
  margin: 0; padding: 0;
`;

const containerStyle = `
  max-width: 600px; margin: 32px auto; background: #fff;
  border-radius: 16px; overflow: hidden;
  border: 2px solid #c084fc; box-shadow: 0 6px 0px #c084fc;
`;

const headerStyle = `
  background: linear-gradient(135deg, #a5f3fc, #c084fc, #f9a8d4);
  padding: 32px 24px; text-align: center;
`;

const bodyStyle = `padding: 32px 24px;`;

const footerStyle = `
  background: #faf5ff; padding: 20px 24px; text-align: center;
  font-size: 13px; color: #9ca3af; border-top: 1px solid #e9d5ff;
`;

const chipStyle = `
  display: inline-block; background: #f3e8ff; color: #7c3aed;
  border-radius: 999px; padding: 4px 14px; font-size: 13px;
  font-weight: 700; margin-bottom: 12px;
`;

const btnStyle = `
  display: inline-block; background: #c084fc; color: #fff;
  padding: 14px 32px; border-radius: 12px; text-decoration: none;
  font-weight: 800; font-size: 16px;
  box-shadow: 0 4px 0px #7c3aed; margin-top: 24px;
`;

// ── Helper: tabla de items ────────────────────────────────────────────────────
function tablaItems(items) {
  const filas = items.map(item => `
    <tr>
      <td style="padding:10px 8px; border-bottom:1px solid #f3e8ff;">
        <strong>${item.nombre_producto}</strong>
        ${item.nombre_variante && item.nombre_variante !== 'Única'
          ? `<span style="${chipStyle}">${item.nombre_variante}</span>`
          : ''}
      </td>
      <td style="padding:10px 8px; border-bottom:1px solid #f3e8ff; text-align:center;">
        x${item.cantidad}
      </td>
      <td style="padding:10px 8px; border-bottom:1px solid #f3e8ff; text-align:right; font-weight:700;">
        $${Number(item.precio_unitario).toLocaleString('es-AR')}
      </td>
    </tr>
  `).join('');

  return `
    <table style="width:100%; border-collapse:collapse; margin-top:16px;">
      <thead>
        <tr style="background:#faf5ff;">
          <th style="padding:10px 8px; text-align:left; color:#7c3aed; font-size:13px;">Producto</th>
          <th style="padding:10px 8px; text-align:center; color:#7c3aed; font-size:13px;">Cant.</th>
          <th style="padding:10px 8px; text-align:right; color:#7c3aed; font-size:13px;">Precio</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

// ── 1. Confirmación de compra al cliente ─────────────────────────────────────
async function enviarConfirmacionCliente({ venta, items }) {
  const esMP = venta.metodo_pago === 'mercadopago';
  const instrucciones = esMP
    ? `<p style="color:#6b7280;">Tu pago fue procesado a través de MercadoPago. Recibirás una confirmación adicional una vez acreditado.</p>`
    : `
      <div style="background:#faf5ff; border:2px solid #c084fc; border-radius:12px; padding:20px; margin-top:16px;">
        <p style="font-weight:800; color:#7c3aed; margin:0 0 8px;">📦 Datos para la transferencia</p>
        <p style="margin:4px 0;">Alias: <strong>${process.env.MP_ALIAS || 'lody.arte'}</strong></p>
        <p style="margin:4px 0;">CBU: <strong>${process.env.CBU || 'completar-en-env'}</strong></p>
        <p style="margin:4px 0;">Titular: <strong>${process.env.TITULAR_CUENTA || 'Lody Arte'}</strong></p>
        <p style="margin:12px 0 0; font-size:13px; color:#9ca3af;">
          Una vez realizada la transferencia, envianos el comprobante respondiendo este email.
        </p>
      </div>
    `;

  const html = `
    <div style="${baseStyle}">
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <h1 style="margin:0; color:#fff; font-size:28px; font-weight:900; text-shadow:0 2px 4px rgba(0,0,0,0.1);">
            ✨ Lody Arte
          </h1>
          <p style="color:#fff; margin:8px 0 0; font-size:16px;">¡Gracias por tu compra!</p>
        </div>
        <div style="${bodyStyle}">
          <span style="${chipStyle}">Pedido #${venta.id}</span>
          <h2 style="color:#1f2937; margin:0 0 8px;">Hola, ${venta.nombre_comprador} 💜</h2>
          <p style="color:#6b7280;">Recibimos tu pedido correctamente. A continuación el resumen:</p>

          ${tablaItems(items)}

          <div style="text-align:right; margin-top:16px; padding-top:12px; border-top:2px solid #f3e8ff;">
            <span style="font-size:18px; font-weight:900; color:#1f2937;">
              Total: $${Number(venta.total).toLocaleString('es-AR')}
            </span>
          </div>

          <div style="background:#f0fdf4; border:2px solid #86efac; border-radius:12px; padding:16px; margin-top:20px;">
            <p style="margin:0; font-weight:700; color:#15803d;">📍 Datos de envío</p>
            <p style="margin:6px 0 0; color:#374151;">
              ${venta.direccion}, ${venta.ciudad}, ${venta.provincia} (CP: ${venta.codigo_postal})
            </p>
          </div>

          ${instrucciones}
        </div>
        <div style="${footerStyle}">
          <p>¿Dudas? Escribinos a <a href="mailto:${process.env.GMAIL_USER}" style="color:#c084fc;">${process.env.GMAIL_USER}</a></p>
          <p style="margin:4px 0 0;">Lody Arte — Accesorios artesanales 🌸</p>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Lody Arte" <${process.env.GMAIL_USER}>`,
    to: venta.email_comprador,
    subject: `✨ Pedido #${venta.id} recibido — Lody Arte`,
    html,
  });
}

// ── 2. Aviso al admin de nueva venta ─────────────────────────────────────────
async function enviarAvisoAdmin({ venta, items }) {
  const html = `
    <div style="${baseStyle}">
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <h1 style="margin:0; color:#fff; font-size:24px; font-weight:900;">🛍️ Nueva venta en Lody Arte</h1>
        </div>
        <div style="${bodyStyle}">
          <span style="${chipStyle}">Pedido #${venta.id}</span>
          <h2 style="color:#1f2937; margin:0 0 16px;">Detalles del pedido</h2>

          <p style="margin:4px 0;"><strong>Cliente:</strong> ${venta.nombre_comprador}</p>
          <p style="margin:4px 0;"><strong>Email:</strong> ${venta.email_comprador}</p>
          <p style="margin:4px 0;"><strong>Dirección:</strong> ${venta.direccion}, ${venta.ciudad}, ${venta.provincia} (CP: ${venta.codigo_postal})</p>
          <p style="margin:4px 0;"><strong>Método de pago:</strong> ${venta.metodo_pago === 'mercadopago' ? '💳 MercadoPago' : '🏦 Transferencia'}</p>

          ${tablaItems(items)}

          <div style="text-align:right; margin-top:16px; padding-top:12px; border-top:2px solid #f3e8ff;">
            <span style="font-size:18px; font-weight:900; color:#1f2937;">
              Total: $${Number(venta.total).toLocaleString('es-AR')}
            </span>
          </div>
        </div>
        <div style="${footerStyle}">Panel de admin — Lody Arte</div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Lody Arte Sistema" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🛍️ Nueva venta #${venta.id} — $${Number(venta.total).toLocaleString('es-AR')}`,
    html,
  });
}

// ── 3. Email con número de seguimiento ───────────────────────────────────────
async function enviarSeguimiento({ venta, numeroSeguimiento, transportista }) {
  const html = `
    <div style="${baseStyle}">
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <h1 style="margin:0; color:#fff; font-size:28px; font-weight:900;">📦 Lody Arte</h1>
          <p style="color:#fff; margin:8px 0 0; font-size:16px;">¡Tu pedido está en camino!</p>
        </div>
        <div style="${bodyStyle}">
          <span style="${chipStyle}">Pedido #${venta.id}</span>
          <h2 style="color:#1f2937; margin:0 0 8px;">¡Buenas noticias, ${venta.nombre_comprador}! 🎉</h2>
          <p style="color:#6b7280;">Tu pedido fue despachado y ya está en camino hacia vos.</p>

          <div style="background:#faf5ff; border:2px solid #c084fc; border-radius:16px; padding:24px; margin-top:20px; text-align:center;">
            <p style="margin:0; color:#7c3aed; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
              Número de seguimiento
            </p>
            <p style="margin:12px 0; font-size:28px; font-weight:900; color:#1f2937; letter-spacing:2px;">
              ${numeroSeguimiento}
            </p>
            ${transportista
              ? `<p style="margin:0; color:#6b7280; font-size:14px;">Transportista: <strong>${transportista}</strong></p>`
              : ''}
          </div>

          <div style="background:#f0fdf4; border:2px solid #86efac; border-radius:12px; padding:16px; margin-top:20px;">
            <p style="margin:0; font-weight:700; color:#15803d;">📍 Dirección de entrega</p>
            <p style="margin:6px 0 0; color:#374151;">
              ${venta.direccion}, ${venta.ciudad}, ${venta.provincia} (CP: ${venta.codigo_postal})
            </p>
          </div>
        </div>
        <div style="${footerStyle}">
          <p>¿Preguntas? <a href="mailto:${process.env.GMAIL_USER}" style="color:#c084fc;">${process.env.GMAIL_USER}</a></p>
          <p style="margin:4px 0 0;">Lody Arte — Accesorios artesanales 🌸</p>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Lody Arte" <${process.env.GMAIL_USER}>`,
    to: venta.email_comprador,
    subject: `📦 Tu pedido #${venta.id} está en camino — Lody Arte`,
    html,
  });
}

module.exports = {
  enviarConfirmacionCliente,
  enviarAvisoAdmin,
  enviarSeguimiento,
};