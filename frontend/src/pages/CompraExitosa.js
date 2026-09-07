// frontend/src/pages/CompraExitosa.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../App.css';

const API = process.env.REACT_APP_API_URL || '/api';

export default function CompraExitosa() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idVenta = searchParams.get('id');
  const metodo = searchParams.get('metodo');
  const pending = searchParams.get('pending');

  const [venta, setVenta] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idVenta) return;
    fetch(`${API}/checkout/venta/${idVenta}`)
      .then(r => r.json())
      .then(data => {
        setVenta(data.venta);
        setItems(data.items || []);
      })
      .finally(() => setLoading(false));
  }, [idVenta]);

  if (loading) {
    return (
      <div className="compra-exitosa-page">
        <div className="compra-exitosa-loader">⏳ Cargando...</div>
      </div>
    );
  }

  const esRetiroEnPersona = metodo === 'retiro_en_persona' || venta?.metodo_pago === 'retiro_en_persona';
  const esMercadoPago = metodo === 'mercadopago' || venta?.metodo_pago === 'mercadopago';
  const esPendiente = pending === 'true';

  return (
    <div className="compra-exitosa-page">
      {/* Formas decorativas */}
      <div className="checkout-deco-1" />
      <div className="checkout-deco-2" />

      <div className="compra-exitosa-container">
        {/* Ícono animado */}
        <div className="compra-exitosa-icon">
          {esPendiente ? '⏳' : '🎉'}
        </div>

        <h1 className="compra-exitosa-titulo">
          ¡Pedido recibido con éxito!
        </h1>

        <p className="compra-exitosa-subtitulo">
          {esRetiroEnPersona
            ? '¡Muchas gracias! Ya registramos tu pedido. A la brevedad nos comunicaremos por WhatsApp para coordinar el día, horario y punto de entrega en Villa Mercedes.'
            : esMercadoPago
              ? '¡Muchas gracias! Ya registramos tu pedido. Nos comunicaremos por WhatsApp o e-mail para confirmarte el stock y enviarte el link de pago de Mercado Pago.'
              : '¡Muchas gracias! Ya registramos tu pedido. Nos comunicaremos por WhatsApp o e-mail para confirmarte el stock y enviarte los datos de transferencia bancaria.'}
        </p>

        {idVenta && (
          <div className="compra-exitosa-numero">
            <span>Número de pedido</span>
            <strong>#{idVenta}</strong>
          </div>
        )}

        {/* Resumen de items */}
        {items.length > 0 && (
          <div className="compra-exitosa-items">
            <p className="compra-exitosa-items-titulo">Tu pedido incluye:</p>
            {items.map((item, i) => (
              <div key={i} className="compra-exitosa-item">
                <span>
                  {item.nombre_producto}
                  {item.nombre_variante && item.nombre_variante !== 'Única'
                    ? ` — ${item.nombre_variante}` : ''}
                  {' '}x{item.cantidad}
                </span>
                <span>${Number(item.subtotal).toLocaleString('es-AR')}</span>
              </div>
            ))}
            {venta && (
              <div className="compra-exitosa-total">
                <span>Total</span>
                <strong>${Number(venta.total).toLocaleString('es-AR')}</strong>
              </div>
            )}
          </div>
        )}

        <div style={{ background: '#fdf4ff', border: '2px dashed var(--lila)', borderRadius: 14, padding: '16px 20px', marginTop: 20 }}>
          <p style={{ margin: 0, color: 'var(--lila-dark)', fontSize: '0.92rem', fontWeight: 700 }}>
            💬 Tranquila, te contactaremos antes de despachar o entregar tu pedido para confirmar todos los detalles.
          </p>
        </div>

        <button
          className="btn-checkout-primary"
          style={{ marginTop: '24px' }}
          onClick={() => navigate('/')}
        >
          Volver a la tienda ✨
        </button>
      </div>
    </div>
  );
}