// frontend/src/pages/CompraError.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function CompraError() {
  const navigate = useNavigate();

  return (
    <div className="compra-exitosa-page">
      <div className="checkout-deco-1" />
      <div className="checkout-deco-2" />

      <div className="compra-exitosa-container">
        <div className="compra-exitosa-icon" style={{ filter: 'grayscale(0.3)' }}>😔</div>

        <h1 className="compra-exitosa-titulo" style={{ color: '#dc2626' }}>
          Hubo un problema con el pago
        </h1>

        <p className="compra-exitosa-subtitulo">
          Tu pago no pudo procesarse. No se realizó ningún cargo.
          Podés intentarlo nuevamente o elegir otro método de pago.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn-checkout-primary" onClick={() => navigate(-1)}>
            ← Volver e intentar de nuevo
          </button>
          <button
            className="btn-checkout-volver"
            onClick={() => navigate('/')}
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}