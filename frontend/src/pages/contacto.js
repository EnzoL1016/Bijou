// frontend/src/pages/Contacto.js
import React from 'react';

const CANALES = [
  {
    emoji: '📸',
    titulo: 'Instagram',
    descripcion: 'El lugar donde más estamos. Seguinos para ver novedades, ferias y el detrás de escena.',
    accion: 'Ir a Instagram',
    link: 'https://instagram.com/lodyarte_',
    color: 'var(--pink-bg)',
    border: 'var(--pink)',
  },
  {
    emoji: '💬',
    titulo: 'WhatsApp',
    descripcion: 'Para consultas rápidas sobre pedidos, envíos o productos. Te respondemos a la brevedad.',
    accion: 'Escribirnos',
    // Reemplazar con número real: https://wa.me/54XXXXXXXXXX
    link: 'https://wa.me/54XXXXXXXXXX?text=Hola!%20Tengo%20una%20consulta%20sobre%20Lody%20Arte%20🌸',
    color: 'var(--mint-bg)',
    border: 'var(--mint)',
  },
  {
    emoji: '📧',
    titulo: 'Email',
    descripcion: 'Para consultas más detalladas o temas de pedidos. Respondemos en menos de 24hs.',
    accion: 'Mandarnos un mail',
    // Reemplazar con email real
    link: 'mailto:contacto@lodyarte.com',
    color: 'var(--lila-bg)',
    border: 'var(--lila)',
  },
];

export default function Contacto() {
  return (
    <div className="estatica-page">

      {/* Hero */}
      <div className="estatica-hero" style={{ background: 'var(--pink-bg)' }}>
        <div className="estatica-hero-deco-1" style={{ background: 'var(--pink)' }} />
        <div className="estatica-hero-deco-2" style={{ background: 'var(--lila)' }} />
        <div className="estatica-hero-deco-3" style={{ background: 'var(--pink)' }} />
        <div className="estatica-hero-content">
          <p className="estatica-hero-tag">💌 Contacto</p>
          <h1 className="estatica-hero-titulo">¡Hablemos!</h1>
          <p className="estatica-hero-sub">
            Estamos para ayudarte con lo que necesites
          </p>
        </div>
      </div>

      <div className="estatica-container">

        {/* Canales */}
        <div style={{ marginBottom: 56 }}>
          <h2 className="nosotros-section-titulo" style={{ textAlign: 'center', marginBottom: 12 }}>
            ¿Cómo contactarnos?
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--gris)', marginBottom: 40 }}>
            Elegí el canal que más te sea cómodo
          </p>
          <div className="contacto-grid">
            {CANALES.map((c, i) => (
              <div key={i} className="contacto-card" style={{ background: c.color, borderColor: c.border }}>
                <span style={{ fontSize: 44, display: 'block', marginBottom: 16 }}>{c.emoji}</span>
                <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, marginBottom: 8 }}>{c.titulo}</h3>
                <p style={{ color: 'var(--gris)', marginBottom: 20, fontSize: '0.92rem' }}>{c.descripcion}</p>
                <a href={c.link} target="_blank" rel="noopener noreferrer" className="contacto-btn">
                  {c.accion} →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Ferias */}
        <div className="nosotros-highlight" style={{ marginBottom: 56 }}>
          <div className="nosotros-highlight-inner">
            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🎪</span>
            <h2 className="nosotros-section-titulo" style={{ textAlign: 'center' }}>
              También nos encontrás en ferias
            </h2>
            <p style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
              Participamos en ferias de artesanos locales en Villa Mercedes, San Luis.
              Seguinos en Instagram <strong>@lodyarte_</strong> para saber cuándo y dónde estaremos.
            </p>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <a
                href="https://instagram.com/lodyarte_"
                target="_blank"
                rel="noopener noreferrer"
                className="contacto-btn"
                style={{ display: 'inline-block' }}
              >
                Seguirnos en Instagram →
              </a>
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div style={{ textAlign: 'center', padding: '0 0 48px' }}>
          <div className="nosotros-card" style={{ maxWidth: 480, margin: '0 auto', background: 'var(--lila-bg)', borderColor: 'var(--lila)' }}>
            <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>⏰</span>
            <h3 style={{ fontFamily: 'Nunito', fontWeight: 900, marginBottom: 8 }}>Horario de atención</h3>
            <p style={{ color: 'var(--gris)' }}>
              Lunes a viernes de 10 a 20hs<br />
              Sábados de 10 a 15hs<br />
              <span style={{ fontSize: '0.85rem' }}>Respondemos lo antes posible 💜</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}