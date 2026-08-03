// frontend/src/pages/CompraExitosa.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../App.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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

  const esTransferencia = metodo === 'transferencia' || venta?.metodo_pago === 'transferencia';
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
          {esPendiente
            ? '¡Pago en proceso!'
            : esTransferencia
              ? '¡Pedido recibido!'
              : '¡Gracias por tu compra!'}
        </h1>

        <p className="compra-exitosa-subtitulo">
          {esPendiente
            ? 'Tu pago está siendo procesado por MercadoPago. Te avisaremos por email cuando se confirme.'
            : esTransferencia
              ? 'Te enviamos los datos para realizar la transferencia a tu email. Confirmamos el pedido al acreditar el pago.'
              : 'Recibiste un email de confirmación con los detalles de tu compra. ¡Muy pronto llega a tu puerta! 🚚'}
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

        {/* Info de transferencia */}
        {esTransferencia && !esPendiente && (
          <div className="compra-exitosa-transferencia">
            <p>📧 Revisá tu casilla de email para ver los datos de transferencia.</p>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
              Una vez que realices el pago, el pedido se activa automáticamente.
            </p>
          </div>
        )}

        <button
          className="btn-checkout-primary"
          style={{ marginTop: '24px' }}
          onClick={() => navigate('/')}
        >
          Seguir comprando ✨
        </button>
      </div>
    </div>
  );
}