import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const CATEGORIAS = [
  { nombre: 'Novedades', path: '/novedades' },
  {
    nombre: 'Accesorios',
    sub: [
      {
        nombre: 'Pulseras', path: '/accesorios/pulseras',
        sub: [
          { nombre: 'De hilo encerado',   path: '/accesorios/pulseras/hilo-encerado' },
          { nombre: 'De perlas de vidrio',path: '/accesorios/pulseras/perlas-vidrio' },
          { nombre: 'De la amistad',      path: '/accesorios/pulseras/amistad' },
          { nombre: 'De parejas',         path: '/accesorios/pulseras/parejas' },
          { nombre: 'Con un significado', path: '/accesorios/pulseras/significado' },
          { nombre: 'Todo',               path: '/accesorios/pulseras' },
        ],
      },
      {
        nombre: 'Collares', path: '/accesorios/collares',
        sub: [
          { nombre: 'De piedras naturales', path: '/accesorios/collares/piedras-naturales' },
          { nombre: 'De perlas',            path: '/accesorios/collares/perlas' },
          { nombre: 'De canutillos',        path: '/accesorios/collares/canutillos' },
          { nombre: 'Todo',                 path: '/accesorios/collares' },
        ],
      },
      { nombre: 'Tobilleras',   path: '/accesorios/tobilleras' },
      { nombre: 'Aros',         path: '/accesorios/aros' },
      { nombre: 'Strap celular',path: '/accesorios/strap-celular' },
      { nombre: 'Llaveros',     path: '/accesorios/llaveros' },
    ],
  },
  { nombre: 'Colecciones',    path: '/colecciones' },
  { nombre: 'Packs por mayor',path: '/mayor' },
  { nombre: 'Promos',         path: '/promos' },
  { nombre: 'Personalizado', path: '/personalizado' },
  { nombre: 'Sobre Nosotros', path: '/nosotros' },
  { nombre: 'Envíos',         path: '/envios' },
  { nombre: 'Contacto',       path: '/contacto' },
];

const RUTAS_LIMPIAS = ['/carrito', '/checkout', '/compra-exitosa', '/compra-error'];

const ChevronIcon = ({ size = 14, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={style}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function NavBar({ carritoCount, busqueda, setBusqueda }) {
  const location = useLocation();
  const esRutaLimpia = RUTAS_LIMPIAS.includes(location.pathname) || location.pathname.startsWith('/producto/');
  const [menuAbierto, setMenuAbierto]         = useState(false);
  const [accesoriosAbierto, setAccesoriosAbierto] = useState(false);
  const [subAbierto, setSubAbierto]           = useState(null);

  const cerrarMenu = () => { setMenuAbierto(false); setAccesoriosAbierto(false); setSubAbierto(null); };
  const toggleSub  = (nombre) => setSubAbierto(prev => prev === nombre ? null : nombre);
  const rotar      = (abierto) => ({ transform: abierto ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' });

  return (
    <>
      {/* Announcement bar — oculto en carrito/checkout */}
      {!esRutaLimpia && (
        <div className="announcement-bar">
          Nueva colección 2026 &nbsp;·&nbsp; Envíos a todo el país &nbsp;·&nbsp; Pagá con todas las tarjetas
        </div>
      )}

      <nav className="navbar">
        <button className={`hamburger ${menuAbierto ? 'activo' : ''}`}
          onClick={() => setMenuAbierto(!menuAbierto)} aria-label="Menú">
          <span /><span /><span />
        </button>

        <Link to="/" className="navbar-logo" onClick={cerrarMenu}>
          <span className="logo-principal">LODY</span>
          <span className="logo-subtitulo">A C C E S O R I O S</span>
        </Link>

        <div className="search-container"
          style={esRutaLimpia ? { visibility: 'hidden', pointerEvents: 'none' } : {}}
          aria-hidden={esRutaLimpia}>
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Buscar accesorios..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>

        <Link to="/carrito" className="navbar-carrito">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          Carrito
          {carritoCount > 0 && <span className="carrito-badge">{carritoCount}</span>}
        </Link>
      </nav>

      {menuAbierto && <div className="menu-overlay" onClick={cerrarMenu} />}

      <div className={`menu-drawer ${menuAbierto ? 'abierto' : ''}`}>
        <div className="menu-drawer-header">
          <span className="menu-drawer-titulo">Menú</span>
          <button className="menu-cerrar" onClick={cerrarMenu}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <ul className="menu-lista">
          {CATEGORIAS.map(cat => (
            <li key={cat.nombre} className="menu-item">
              {cat.sub ? (
                <>
                  <button
                    className={`menu-link menu-link-sub ${accesoriosAbierto ? 'activo' : ''}`}
                    onClick={() => { setAccesoriosAbierto(!accesoriosAbierto); setSubAbierto(null); }}
                  >
                    {cat.nombre}
                    <ChevronIcon style={rotar(accesoriosAbierto)} />
                  </button>

                  {accesoriosAbierto && (
                    <ul className="submenu-lista">
                      {cat.sub.map(sub => (
                        <li key={sub.nombre}>
                          {sub.sub ? (
                            <>
                              <button
                                className={`submenu-link submenu-link-btn ${subAbierto === sub.nombre ? 'activo' : ''}`}
                                onClick={() => toggleSub(sub.nombre)}
                              >
                                {sub.nombre}
                                <ChevronIcon size={12} style={rotar(subAbierto === sub.nombre)} />
                              </button>
                              {subAbierto === sub.nombre && (
                                <ul className="subsubmenu-lista">
                                  {sub.sub.map(item => (
                                    <li key={item.nombre}>
                                      <Link to={item.path} className="subsubmenu-link" onClick={cerrarMenu}>
                                        {item.nombre}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          ) : (
                            <Link to={sub.path} className="submenu-link" onClick={cerrarMenu}>
                              {sub.nombre}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link to={cat.path} className="menu-link" onClick={cerrarMenu}>
                  {cat.nombre}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="menu-footer">
          <p>¿Consultas? Escribinos</p>
          <a href="https://wa.me/54XXXXXXXXXX" target="_blank" rel="noreferrer" className="menu-whatsapp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.137.565 4.147 1.55 5.887L.057 23.43a.75.75 0 00.918.919l5.655-1.48A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.168-1.446l-.369-.22-3.821 1.001 1.018-3.714-.24-.38A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}