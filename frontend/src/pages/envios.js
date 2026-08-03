// frontend/src/pages/Envios.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const TRANSPORTISTAS = [
  {
    nombre: 'Correo Argentino',
    emoji: '📦',
    color: 'var(--lila-bg)',
    border: 'var(--lila)',
    descripcion: 'Envíos a todo el país. Podés hacer el seguimiento con el número de tracking que te enviamos por email.',
    tiempo: '3 a 7 días hábiles',
    info: 'El costo varía según destino y peso del paquete.',
  },
  {
    nombre: 'Andreani',
    emoji: '🚚',
    color: 'var(--mint-bg)',
    border: 'var(--mint)',
    descripcion: 'Cobertura nacional con seguimiento en tiempo real desde su app o web.',
    tiempo: '2 a 5 días hábiles',
    info: 'El costo varía según destino y peso del paquete.',
  },
];

const FAQS = [
  {
    q: '¿Cuándo se envía mi pedido?',
    a: 'Preparamos y despachamos los pedidos dentro de las 48 horas hábiles de confirmado el pago.',
  },
  {
    q: '¿Cómo sé que mi paquete está en camino?',
    a: 'Te enviamos un email con el número de seguimiento en cuanto despachamos tu pedido. Con ese número podés rastrear tu envío en el sitio del transportista.',
  },
  {
    q: '¿Hacen envíos a todo el país?',
    a: 'Sí, enviamos a todo Argentina por Correo Argentino o Andreani.',
  },
  {
    q: '¿Qué pasa si mi paquete llega dañado?',
    a: 'Escribinos por Instagram o email con fotos del paquete y el producto. Lo resolvemos juntas.',
  },
  {
    q: '¿Puedo retirar en persona?',
    a: 'Por el momento no contamos con local físico. Estamos disponibles en ferias locales de Villa Mercedes, San Luis — seguinos en Instagram para enterarte cuándo.',
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
          <p className="estatica-hero-sub">Enviamos a todo el país por Correo Argentino y Andreani</p>
        </div>
      </div>

      <div className="estatica-container">

        {/* Transportistas */}
        <div style={{ marginBottom: 56 }}>
          <h2 className="nosotros-section-titulo" style={{ textAlign: 'center', marginBottom: 32 }}>
            ¿Cómo enviamos?
          </h2>
          <div className="envios-transportistas">
            {TRANSPORTISTAS.map((t, i) => (
              <div key={i} className="envios-card" style={{ background: t.color, borderColor: t.border }}>
                <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>{t.emoji}</span>
                <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, marginBottom: 8 }}>{t.nombre}</h3>
                <p style={{ marginBottom: 12, color: 'var(--gris)' }}>{t.descripcion}</p>
                <div className="envios-badge">⏱ {t.tiempo}</div>
                <p style={{ fontSize: '0.82rem', color: 'var(--gris)', marginTop: 10 }}>{t.info}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pasos */}
        <div className="envios-pasos">
          <h2 className="nosotros-section-titulo" style={{ textAlign: 'center', marginBottom: 40 }}>
            ¿Cómo funciona?
          </h2>
          <div className="envios-pasos-grid">
            {[
              { num: '1', emoji: '🛒', titulo: 'Hacé tu pedido', texto: 'Elegí tus accesorios y completá los datos de envío en el checkout.' },
              { num: '2', emoji: '💳', titulo: 'Confirmá el pago', texto: 'Pagá con MercadoPago o transferencia bancaria.' },
              { num: '3', emoji: '📦', titulo: 'Preparamos tu paquete', texto: 'En menos de 48hs hábiles empacamos tu pedido con mucho cuidado.' },
              { num: '4', emoji: '✉️', titulo: 'Te avisamos', texto: 'Te enviamos un email con el número de seguimiento para que rastrees tu paquete.' },
            ].map((p, i) => (
              <div key={i} className="envios-paso">
                <div className="envios-paso-num">{p.num}</div>
                <span style={{ fontSize: 32, margin: '12px 0 8px', display: 'block' }}>{p.emoji}</span>
                <h4 style={{ fontFamily: 'Nunito', fontWeight: 900, marginBottom: 6 }}>{p.titulo}</h4>
                <p style={{ color: 'var(--gris)', fontSize: '0.9rem' }}>{p.texto}</p>
              </div>
            ))}
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