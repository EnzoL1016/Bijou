// frontend/src/pages/comoComprar.js
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ComoComprar() {
  const navigate = useNavigate();

  return (
    <div className="estatica-page">

      {/* Hero */}
      <div className="estatica-hero" style={{ background: 'var(--yellow-bg)' }}>
        <div className="estatica-hero-deco-1" style={{ background: 'var(--yellow)' }} />
        <div className="estatica-hero-deco-2" style={{ background: 'var(--pink)' }} />
        <div className="estatica-hero-deco-3" style={{ background: 'var(--yellow)' }} />
        <div className="estatica-hero-content">
          <p className="estatica-hero-tag">🛍️ Guía de compra</p>
          <h1 className="estatica-hero-titulo">¿Cómo comprar?</h1>
          <p className="estatica-hero-sub">
            Te contamos el paso a paso para hacer tu pedido de forma fácil y segura
          </p>
        </div>
      </div>

      <div className="estatica-container">

        {/* Paso a paso principal */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
            <div className="nosotros-card nosotros-card-pink" style={{ padding: 28 }}>
              <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>🛒</span>
              <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, marginBottom: 12, fontSize: '1.2rem', color: 'var(--pink-dark)' }}>
                1. Elegí tus productos y completá tus datos
              </h3>
              <p style={{ color: 'var(--texto)', lineHeight: 1.65, fontSize: '0.94rem' }}>
                Elegí los accesorios que más te gusten y sumalos a tu carrito. Al momento de confirmar, completá tus datos de contacto y entrega (teléfono, e-mail y dirección). Es muy importante que estos datos sean correctos para que podamos comunicarnos con vos y coordinar el pago.
              </p>
            </div>

            <div className="nosotros-card nosotros-card-mint" style={{ padding: 28 }}>
              <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>💬</span>
              <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, marginBottom: 12, fontSize: '1.2rem', color: 'var(--mint-dark)' }}>
                2. Confirmación de stock y pago
              </h3>
              <p style={{ color: 'var(--texto)', lineHeight: 1.65, fontSize: '0.94rem' }}>
                Cuando confirmás la compra nos llega el pedido, una vez confirmado el stock te enviamos un mensaje por WhatsApp o mail con la confirmación y datos para abonar, según los datos que hayas elegido anteriormente.
              </p>
            </div>
          </div>
        </div>

        {/* Mínimo de compra y Tiempos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 56 }}>
          {/* Mínimo de compra */}
          <div className="nosotros-card nosotros-card-lila" style={{ padding: 28 }}>
            <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>✨</span>
            <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, marginBottom: 10, fontSize: '1.2rem', color: 'var(--lila-dark)' }}>
              ¿Hay mínimo de compra?
            </h3>
            <p style={{ color: 'var(--texto)', fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
              No hay mínimo de compra.
            </p>
            <p style={{ color: 'var(--gris)', fontSize: '0.9rem', marginTop: 8 }}>
              Podés llevar desde un solo accesorio hasta los packs que quieras.
            </p>
          </div>

          {/* Tiempo de armado y entrega */}
          <div className="nosotros-card nosotros-card-yellow" style={{ padding: 28, background: 'var(--yellow-bg)', borderColor: 'var(--yellow)' }}>
            <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>⏱️</span>
            <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, marginBottom: 12, fontSize: '1.2rem', color: 'var(--yellow-dark)' }}>
              Tiempo de armado y entrega
            </h3>
            <p style={{ color: 'var(--texto)', lineHeight: 1.6, fontSize: '0.92rem', marginBottom: 10 }}>
              • <strong>Artículos en stock:</strong> Se despachan una vez recibido el pago, pueden tener una demora de 48hs hábiles.
            </p>
            <p style={{ color: 'var(--texto)', lineHeight: 1.6, fontSize: '0.92rem', margin: 0 }}>
              • <strong>Pedidos personalizados:</strong> Van a depender de la cantidad y disponibilidad, siempre se avisará antes de confirmar el pedido.
            </p>
          </div>
        </div>

        {/* Consultas */}
        <div className="nosotros-highlight" style={{ marginBottom: 56 }}>
          <div className="nosotros-highlight-inner" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 44, display: 'block', marginBottom: 16 }}>💌</span>
            <h2 className="nosotros-section-titulo" style={{ textAlign: 'center', marginBottom: 12 }}>
              Consultas
            </h2>
            <p style={{ maxWidth: 620, margin: '0 auto 24px', lineHeight: 1.7, fontSize: '0.98rem' }}>
              Si tenés alguna duda sobre cómo comprar o querés saber sobre mercadería que no viste en la web, escribinos a <a href="mailto:lodyarte@gmail.com" style={{ color: 'var(--lila-dark)', fontWeight: 800, textDecoration: 'underline' }}>lodyarte@gmail.com</a> o por cualquier otro medio que se encuentra en la sección <Link to="/contacto" style={{ color: 'var(--pink-dark)', fontWeight: 800, textDecoration: 'underline' }}>contacto</Link>.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contacto" className="contacto-btn" style={{ display: 'inline-block' }}>
                Ir a Contacto →
              </Link>
              <button className="btn-carrito-primary" onClick={() => navigate('/')}>
                Ver Accesorios
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
