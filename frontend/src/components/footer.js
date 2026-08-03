import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Logo y descripción */}
        <div className="footer-col footer-col-brand">
          <div className="footer-logo">
            <span className="logo-principal">LODY</span>
            <span className="logo-subtitulo">A C C E S O R I O S</span>
          </div>
          <p className="footer-desc">
            Accesorios artesanales hechos a mano con amor, desde Villa Mercedes, San Luis, Argentina.
          </p>
          <a
            href="https://instagram.com/lodyarte_"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-instagram"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            @lodyarte_
          </a>
        </div>

        {/* Links */}
        <div className="footer-col">
          <h4 className="footer-col-titulo">Categorías</h4>
          <ul className="footer-links">
            <li><Link to="/novedades">Novedades</Link></li>
            <li><Link to="/accesorios/pulseras">Pulseras</Link></li>
            <li><Link to="/accesorios/collares">Collares</Link></li>
            <li><Link to="/accesorios/tobilleras">Tobilleras</Link></li>
            <li><Link to="/accesorios/aros">Aros</Link></li>
            <li><Link to="/colecciones">Colecciones</Link></li>
            <li><Link to="/promos">Promos</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-titulo">Información</h4>
          <ul className="footer-links">
            <li><Link to="/nosotros">Sobre nosotros</Link></li>
            <li><Link to="/envios">Envíos</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
            <li><Link to="/mayor">Packs por mayor</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-titulo">Contacto</h4>
          <ul className="footer-links">
            <li>
              <a href="https://instagram.com/lodyarte_" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
            <li>
              {/* Reemplazar con número real */}
              <a href="https://wa.me/54XXXXXXXXXX" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li>
              {/* Reemplazar con email real */}
              <a href="mailto:contacto@lodyarte.com">
                Email
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Lody Arte · Hecho con 💜 en Villa Mercedes, San Luis</p>
      </div>
    </footer>
  );
}