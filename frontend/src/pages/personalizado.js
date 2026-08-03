import React from 'react';
import { Link } from 'react-router-dom';

const PASOS = [
  {
    num: '01',
    titulo: 'Contame tu idea',
    texto: 'Me podes mandar referencias de algo que hayas visto o simplemente contarme tu idea.',
    color: 'var(--lila-bg)',
    borde: 'var(--lila)',
    numColor: 'var(--lila-dark)',
  },
  {
    num: '02',
    titulo: 'Te cotizo',
    texto: 'Según lo que me pedís te doy un precio. Sin compromisos.',
    color: 'var(--pink-bg)',
    borde: 'var(--pink)',
    numColor: 'var(--pink-dark)',
  },
  {
    num: '03',
    titulo: 'Lo hacemos',
    texto: 'Una vez que acordamos todo, me pongo a trabajar. Te mando fotos del proceso para que puedas ver cómo va quedando.',
    color: 'var(--mint-bg)',
    borde: 'var(--mint)',
    numColor: 'var(--mint-dark)',
  },
  {
    num: '04',
    titulo: 'Te lo mando',
    texto: 'Cuando esté listo lo empaquetamos con cuidado y te lo enviamos a donde estés. O si sos de Villa Mercedes podemos coordinar una entrega en persona.',
    color: 'var(--yellow-bg)',
    borde: 'var(--yellow)',
    numColor: 'var(--yellow-dark)',
  },
];

export default function Personalizado() {
  return (
    <div className="estatica-page">

      {/* Hero */}
      <div className="estatica-hero">
        <div className="estatica-hero-deco-1" />
        <div className="estatica-hero-deco-2" />
        <div className="estatica-hero-deco-3" />
        <div className="estatica-hero-content">
          <span className="estatica-hero-tag">Lody Arte</span>
          <h1 className="estatica-hero-titulo">Hecho especialmente para vos</h1>
          <p className="estatica-hero-sub">
            ¿Tenés algo en mente que no encontrás en ningún lado? Lo hacemos juntas.
          </p>
        </div>
      </div>

      <div className="estatica-container">

        {/* Intro */}
        <div className="personalizado-intro">
          <p>
            Me encanta cuando alguien llega con una idea propia. Puede ser un regalo para alguien especial,
            algo que combine con un outfit, o simplemente algo que viste en Pinterest y querés en tu versión.
          </p>
          <p>
            El proceso es simple: me escribís, me contás qué tenés en mente, y lo resolvemos juntas.
          </p>
        </div>

        {/* CTA */}
        <div className="personalizado-cta" style={{ marginBottom: 56 }}>
          <h2 className="nosotros-section-titulo" style={{ textAlign: 'center', marginBottom: 12 }}>
            ¿Tenés algo en mente?
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--gris)', marginBottom: 32 }}>
            Escribime y lo charlamos.
          </p>
          <div className="personalizado-cta-btns">
            <a
              href="https://wa.me/54XXXXXXXXXX"
              target="_blank" rel="noopener noreferrer"
              className="personalizado-btn personalizado-btn-whatsapp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.137.565 4.147 1.55 5.887L.057 23.43a.75.75 0 00.918.919l5.655-1.48A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.168-1.446l-.369-.22-3.821 1.001 1.018-3.714-.24-.38A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Escribime por WhatsApp
            </a>
            <a
              href="https://instagram.com/lodyarte_"
              target="_blank" rel="noopener noreferrer"
              className="personalizado-btn personalizado-btn-instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              Escribime por Instagram
            </a>
          </div>
        </div>

        {/* Pasos */}
        <h2 className="nosotros-section-titulo" style={{ marginBottom: 32 }}>¿Cómo funciona?</h2>
        <div className="personalizado-pasos">
          {PASOS.map(p => (
            <div key={p.num} className="personalizado-paso"
              style={{ background: p.color, border: `2.5px solid ${p.borde}` }}>
              <span className="personalizado-paso-num" style={{ color: p.numColor }}>{p.num}</span>
              <h3 className="personalizado-paso-titulo" style={{ color: p.numColor }}>{p.titulo}</h3>
              <p className="personalizado-paso-texto">{p.texto}</p>
            </div>
          ))}
        </div>

        {/* Qué puedo pedir */}
        <div className="personalizado-ejemplos">
          <h2 className="nosotros-section-titulo">¿Qué puedo pedir?</h2>
          <div className="personalizado-ejemplos-grid">
            {[
              { titulo: 'Pulseras con nombre o inicial', desc: 'En el material que prefieras, con tu color favorito o el de la persona que lo recibe.' },
              { titulo: 'Conjuntos a combinar', desc: 'Pulsera + tobillera + collar que vayan todos juntos. Elegís los materiales.' },
              { titulo: 'Regalos para fechas especiales', desc: 'Cumpleaños, 15 años, casamientos, aniversarios. Lo hacemos único.' },
              { titulo: 'Souvenir', desc: 'Si querés algo para recordar un día especial, nosotras lo hacemos: bautismo, 15 años, egreso, cumpleaños y más.' },
            ].map((e, i) => (
              <div key={i} className="personalizado-ejemplo-card">
                <h4>{e.titulo}</h4>
                <p>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}