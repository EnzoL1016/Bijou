// frontend/src/pages/envios.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const FAQS = [
  {
    q: '¿Cuándo se envía mi pedido?',
    a: 'Preparamos y despachamos los artículos en stock dentro de las 48 horas hábiles una vez confirmado el pago.',
  },
  {
    q: '¿Cómo sé que mi paquete está en camino?',
    a: 'Te enviamos un mensaje y/o email con el número de seguimiento en cuanto despachamos tu pedido para que puedas rastrearlo en la web de Correo Argentino.',
  },
  {
    q: '¿Hacen envíos a todo el país?',
    a: 'Sí, enviamos a todo el territorio nacional a través de Correo Argentino (PAQ. AR).',
  },
  {
    q: '¿Qué pasa si mi paquete llega dañado?',
    a: 'Escribinos por WhatsApp, Instagram o email con fotos del paquete y el producto para ayudarte de inmediato.',
  },
  {
    q: '¿Puedo retirar en persona?',
    a: 'Si sos de Villa Mercedes sí podés acordar retiro por domicilio o punto de encuentro.',
  },
];

export default function Envios() {
  const navigate = useNavigate();

  return (
    <div className="estatica-page">

      {/* Hero */}
      <div className="estatica-hero" style={{ background: 'var(--mint-bg)' }}>
        <div className="estatica-hero-deco-1" style={{ background: 'var(--mint)' }} />
        <div className="estatica-hero-deco-2" style={{ background: 'var(--sky)' }} />
        <div className="estatica-hero-deco-3" style={{ background: 'var(--mint)' }} />
        <div className="estatica-hero-content">
          <p className="estatica-hero-tag">🚚 Envíos</p>
          <h1 className="estatica-hero-titulo">Tu pedido llega<br/>a donde estés</h1>
          <p className="estatica-hero-sub">Enviamos a todo el país por Correo Argentino</p>
        </div>
      </div>

      <div className="estatica-container">

        {/* Banner tranquilidad */}
        <div style={{ maxWidth: 760, margin: '0 auto 36px', background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', border: '2px dashed var(--lila)', borderRadius: 16, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 14px rgba(192, 132, 252, 0.12)' }}>
          <span style={{ fontSize: 32 }}>✨</span>
          <div>
            <h4 style={{ fontFamily: 'Nunito', fontWeight: 900, color: 'var(--lila-dark)', margin: 0, fontSize: '1.08rem' }}>
              Tranquila, vas a saber el costo de envío antes de abonar
            </h4>
            <p style={{ margin: '4px 0 0', color: 'var(--texto)', fontSize: '0.88rem' }}>
              Al armar tu pedido coordinamos el método de envío más conveniente y te informamos el total exacto antes de que realices el pago.
            </p>
          </div>
        </div>

        {/* Info Correo Argentino */}
        <div style={{ marginBottom: 56 }}>
          <h2 className="nosotros-section-titulo" style={{ textAlign: 'center', marginBottom: 32 }}>
            Información de Envío
          </h2>
          
          <div className="nosotros-card" style={{ maxWidth: 760, margin: '0 auto', background: 'var(--lila-bg)', borderColor: 'var(--lila)', padding: '36px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <span style={{ fontSize: 38 }}>📦</span>
              <div>
                <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: '1.4rem', color: 'var(--lila-dark)', margin: 0 }}>
                  Correo Argentino (PAQ. AR)
                </h3>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gris)' }}>
                  Cobertura nacional segura y confiable
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--texto)', lineHeight: 1.7, fontSize: '0.96rem', marginBottom: 20 }}>
              Tiene alcance en todo el territorio nacional con un plazo de entrega desde el despacho de <strong>4 a 7 días hábiles Clásico</strong>, y de <strong>1 a 4 días Expreso</strong>.
            </p>

            <div style={{ background: 'var(--blanco)', borderRadius: 16, padding: '20px 24px', border: '2px solid var(--lila)', marginBottom: 20 }}>
              <h4 style={{ fontFamily: 'Nunito', fontWeight: 900, color: 'var(--negro)', marginBottom: 12, fontSize: '1.05rem' }}>
                Hay dos tipos de envíos, según tu comodidad:
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--lila-dark)', fontWeight: 900 }}>🏡</span>
                  <strong>Entrega en domicilio</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--lila-dark)', fontWeight: 900 }}>🏢</span>
                  <strong>Retiro por sucursal del Correo Argentino en tu localidad</strong>
                </li>
              </ul>
            </div>

            <div style={{ background: 'var(--mint-bg)', border: '2px solid var(--mint)', borderRadius: 14, padding: '16px 20px' }}>
              <h4 style={{ fontFamily: 'Nunito', fontWeight: 900, color: 'var(--mint-dark)', marginBottom: 4, fontSize: '0.98rem' }}>
                Costos:
              </h4>
              <p style={{ margin: 0, color: 'var(--texto)', fontSize: '0.9rem' }}>
                El costo se calcula según la modalidad elegida (sucursal o domicilio) y el destino de entrega al momento de confirmar tu pedido.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div style={{ marginBottom: 56 }}>
          <h2 className="nosotros-section-titulo" style={{ textAlign: 'center', marginBottom: 32 }}>
            Preguntas frecuentes
          </h2>
          <div className="envios-faqs">
            {FAQS.map((faq, i) => (
              <div key={i} className="envios-faq-item">
                <h4>❓ {faq.q}</h4>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '24px 0 40px' }}>
          <p style={{ color: 'var(--gris)', marginBottom: 20 }}>¿Tenés alguna duda sobre tu envío?</p>
          <button className="btn-carrito-primary" onClick={() => navigate('/contacto')}>
            Contactanos
          </button>
        </div>

      </div>
    </div>
  );
}