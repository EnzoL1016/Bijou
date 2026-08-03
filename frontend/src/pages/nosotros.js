// frontend/src/pages/Nosotros.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Nosotros() {
  const navigate = useNavigate();

  return (
    <div className="estatica-page">

      {/* Hero */}
      <div className="estatica-hero">
        <div className="estatica-hero-deco-1" />
        <div className="estatica-hero-deco-2" />
        <div className="estatica-hero-deco-3" />
        <div className="estatica-hero-content">
          <p className="estatica-hero-tag">✨ Nuestra historia</p>
          <h1 className="estatica-hero-titulo">Hecho con amor,<br/>desde Villa Mercedes</h1>
          <p className="estatica-hero-sub">
            Cada accesorio que hacemos lleva un pedacito de historia familiar
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="estatica-container">

        {/* Historia */}
        <div className="nosotros-grid">
          <div className="nosotros-texto">
            <h2 className="nosotros-section-titulo">¿Cómo nació Lody Arte?</h2>
            <p>
              Todo empezó en una feria de artesanos local en Villa Mercedes, San Luis. Con una mesa,
              algunos materiales y muchísimas ganas, dimos los primeros pasos en el mundo de los accesorios artesanales.
            </p>
            <p>
              Lo que arrancó como un hobbie se fue convirtiendo en algo mucho más grande. Hoy Lody Arte
              es un pequeño emprendimiento familiar donde cada pieza se hace a mano, con tiempo y dedicación.
            </p>
          </div>
          <div className="nosotros-card nosotros-card-lila">
            <span className="nosotros-emoji">🧵</span>
            <h3>Hecho a mano</h3>
            <p>Cada pieza es única, creada con materiales cuidadosamente elegidos y mucha paciencia.</p>
          </div>
        </div>

        {/* Abuela */}
        <div className="nosotros-highlight">
          <div className="nosotros-highlight-inner">
            <h2 className="nosotros-section-titulo" style={{ textAlign: 'center' }}>
              La inspiración que lo inició todo
            </h2>
            <p style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
              El amor por los accesorios artesanales nació gracias a una abuela muy especial. Cada visita
              traía algo nuevo — materiales, técnicas, historias. Esa curiosidad y ese cariño son los que
              guían cada cosa que hacemos hoy.
            </p>
          </div>
        </div>

        {/* El equipo */}
        <div className="nosotros-equipo">
          <h2 className="nosotros-section-titulo" style={{ textAlign: 'center', marginBottom: 40 }}>
            ¿Quiénes somos?
          </h2>
          <div className="nosotros-equipo-grid">
            <div className="nosotros-card nosotros-card-pink">
              <h3>Cindy Lopez</h3>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--lila-dark)', marginBottom: 8 }}>
                Artesana · Emprendedora · Programadora
              </p>
              <p>Fundadora de Lody Arte. Arrancó sola haciendo cada pieza, aprendiendo, experimentando y llevando el emprendimiento a las ferias locales.</p>
            </div>
            <div className="nosotros-card nosotros-card-mint">
              <h3>La mamá</h3>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--lila-dark)', marginBottom: 8 }}>
                Artesana · Colaboradora
              </p>
              <p>Se sumó al taller con mucho entusiasmo. Aprendió las técnicas y hoy es parte fundamental del equipo.</p>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="nosotros-valores">
          <h2 className="nosotros-section-titulo" style={{ textAlign: 'center', marginBottom: 32 }}>
            Lo que nos define
          </h2>
          <div className="nosotros-valores-grid">
            {[
              { emoji: '🌿', titulo: 'Artesanal', texto: 'Sin producción en serie. Cada pieza lleva tiempo y atención.' },
              { emoji: '💜', titulo: 'Con historia', texto: 'Detrás de cada accesorio hay una familia y una pasión real.' },
              { emoji: '🌟', titulo: 'Único', texto: 'Las pequeñas imperfecciones son parte del encanto artesanal.' },
              { emoji: '📍', titulo: 'Local', texto: 'Orgullosamente de Villa Mercedes, San Luis, Argentina.' },
            ].map((v, i) => (
              <div key={i} className="nosotros-valor-item">
                <span style={{ fontSize: 32 }}>{v.emoji}</span>
                <h4>{v.titulo}</h4>
                <p>{v.texto}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '48px 0 24px' }}>
          <p style={{ color: 'var(--gris)', marginBottom: 20, fontSize: '1.05rem' }}>
            ¿Querés llevar un pedacito de nuestra historia?
          </p>
          <button className="btn-carrito-primary" onClick={() => navigate('/')}>
            Ver nuestros accesorios
          </button>
        </div>

      </div>
    </div>
  );
}