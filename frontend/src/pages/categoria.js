// frontend/src/pages/categoria.js
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ModalDetalle from '../components/ModalDetalle';

const API = process.env.REACT_APP_API_URL || '/api';

const CATEGORIAS_MAP = {
  'todo':                   { query: '',                 titulo: 'Catálogo Completo',  subtitulo: 'Todos nuestros accesorios artesanales' },
  'novedades':              { query: 'Novedades',        titulo: 'Novedades',          subtitulo: 'Lo último que llegó' },
  'pulseras':               { query: 'Pulseras',         titulo: 'Pulseras',            subtitulo: 'Todas nuestras pulseras' },
  'pulseras/hilo-encerado': { query: 'Hilo encerado',    titulo: 'Pulseras de hilo',    subtitulo: 'Hilo encerado artesanal' },
  'pulseras/perlas-vidrio': { query: 'Perlas de vidrio', titulo: 'Perlas de vidrio',    subtitulo: 'Delicadas y brillantes' },
  'pulseras/amistad':       { query: 'Amistad',          titulo: 'De la amistad',       subtitulo: 'Para compartir' },
  'pulseras/parejas':       { query: 'Parejas',          titulo: 'De parejas',          subtitulo: 'Para los dos' },
  'pulseras/significado':   { query: 'Con significado',  titulo: 'Con un significado',  subtitulo: 'Cada una cuenta algo' },
  'collares':               { query: 'Collares',         titulo: 'Collares',            subtitulo: 'Para cada estilo' },
  'collares/piedras-naturales': { query: 'Piedras naturales', titulo: 'Piedras naturales', subtitulo: '' },
  'collares/perlas':        { query: 'Perlas',           titulo: 'Collares de perlas',  subtitulo: '' },
  'collares/canutillos':    { query: 'Canutillos',       titulo: 'Canutillos',          subtitulo: '' },
  'tobilleras':             { query: 'Tobilleras',       titulo: 'Tobilleras',          subtitulo: '' },
  'aros':                   { query: 'Aros',             titulo: 'Aros',                subtitulo: '' },
  'strap-celular':          { query: 'Strap celular',    titulo: 'Strap celular',       subtitulo: '' },
  'llaveros':               { query: 'Llaveros',         titulo: 'Llaveros',            subtitulo: '' },
  'colecciones':            { query: 'Colecciones',      titulo: 'Colecciones',         subtitulo: 'Nuestras piezas favoritas' },
  'mayor':                  { query: 'Mayor',            titulo: 'Packs por mayor',     subtitulo: 'Comprá en cantidad' },
  'promos':                 { query: 'Promos',           titulo: 'Promociones',         subtitulo: '¡Aprovechá!' },
  'bordados':               { query: 'Bordados',         titulo: 'Bordados',            subtitulo: 'Piezas bordadas a mano' },
  'bordados/pins':          { query: 'Pins',             titulo: 'Pins bordados',       subtitulo: 'Bordados a mano' },
  'bordados/llaveros':       { query: 'Llaveros',         titulo: 'Llaveros bordados',   subtitulo: 'Bordados a mano' },
  'bordados/escarapelas':    { query: 'Escarapelas',      titulo: 'Escarapelas',         subtitulo: 'Bordadas a mano' },
};

export default function Categoria({ agregarAlCarrito, busqueda = '' }) {
  const { subcategoria, subsubcategoria } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const coleccionParam = queryParams.get('coleccion');

  const esColecciones = location.pathname.startsWith('/colecciones');
  const esBordados = location.pathname.startsWith('/bordados');

  // Si estamos en /colecciones, la colección puede venir por query (?coleccion=...) o por ruta (/colecciones/:subcategoria)
  const coleccionActual = esColecciones ? (subcategoria || coleccionParam || '') : '';

  // Clave del mapa para rutas estándar
  const pathKey = subcategoria
    ? [subcategoria, subsubcategoria].filter(Boolean).join('/')
    : location.pathname.replace('/', '');

  const info = CATEGORIAS_MAP[pathKey] || { query: pathKey, titulo: pathKey, subtitulo: '' };

  let titulo = info.titulo;
  let subtitulo = info.subtitulo;
  let fetchUrl = '';

  if (esColecciones) {
    if (coleccionActual) {
      titulo = `Colección: ${coleccionActual}`;
      subtitulo = `Piezas exclusivas de la colección ${coleccionActual}`;
      fetchUrl = `${API}/productos?categoria=Colecciones&coleccion=${encodeURIComponent(coleccionActual)}`;
    } else {
      titulo = 'Colecciones';
      subtitulo = 'Nuestras piezas y colecciones especiales';
      fetchUrl = `${API}/productos?categoria=Colecciones`;
    }
  } else if (esBordados) {
    if (subcategoria) {
      const nom = subcategoria.charAt(0).toUpperCase() + subcategoria.slice(1);
      titulo = `${nom} Bordados`;
      subtitulo = 'Piezas bordadas a mano';
      fetchUrl = `${API}/productos?categoria=bordados&subcategoria=${encodeURIComponent(subcategoria)}`;
    } else {
      titulo = 'Bordados';
      subtitulo = 'Piezas bordadas a mano';
      fetchUrl = `${API}/productos?categoria=bordados`;
    }
  } else {
    fetchUrl = info.query ? `${API}/productos?categoria=${encodeURIComponent(info.query)}` : `${API}/productos`;
  }

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalProd, setModalProd] = useState(null);
  const [exitoId, setExitoId] = useState(null);
  const [coleccionesLista, setColeccionesLista] = useState([]);
  const productosFiltrados = productos.filter(producto =>
    (producto.nombre || '').toLocaleLowerCase().includes(busqueda.trim().toLocaleLowerCase())
  );

  // Cargar lista de colecciones para los botones de filtrado en /colecciones
  useEffect(() => {
    if (esColecciones) {
      fetch(`${API}/productos/colecciones`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setColeccionesLista(data);
        })
        .catch(() => {});
    }
  }, [esColecciones]);

  // Carga de productos desde el backend
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setProductos([]);
    fetch(fetchUrl, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        setProductos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(error => {
        if (error.name !== 'AbortError') setLoading(false);
      });
    return () => controller.abort();
  }, [fetchUrl]);

  const manejarAgregar = (prod) => {
    const tieneVariantes = prod.variantes?.filter(v => v !== 'Única').length > 0;
    if (tieneVariantes) {
      setModalProd(prod);
    } else {
      const idVariante = prod.variantes_detalle?.[0]?.id || null;
      agregarAlCarrito(prod, null, idVariante);
      setExitoId(prod.id);
      setTimeout(() => setExitoId(null), 1500);
    }
  };

  return (
    <div>
      {/* Header de sección */}
      <div className="categoria-hero">
        <div className="categoria-hero-deco-1" />
        <div className="categoria-hero-deco-2" />

        <button
          onClick={() => navigate(-1)}
          className="categoria-hero-volver"
        >
          ← Volver
        </button>

        <h1 className="categoria-hero-titulo">
          {titulo}
        </h1>
        {subtitulo && (
          <p className="categoria-hero-sub">
            {subtitulo}
          </p>
        )}
      </div>

      {/* Grilla y Filtros */}
      <div className="categoria-container">
        {/* Filtros exclusivos por Colección */}
        {esColecciones && coleccionesLista.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
            <button
              onClick={() => navigate('/colecciones')}
              style={{
                padding: '7px 18px',
                borderRadius: '24px',
                border: !coleccionActual ? '2px solid #0369a1' : '1.5px solid #dcd7cc',
                background: !coleccionActual ? '#0284c7' : '#ffffff',
                color: !coleccionActual ? '#ffffff' : '#0369a1',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Todas las colecciones
            </button>
            {coleccionesLista.map(col => {
              const esActiva = coleccionActual?.toLowerCase() === col.nombre?.toLowerCase();
              return (
                <button
                  key={col.id}
                  onClick={() => navigate(`/colecciones?coleccion=${encodeURIComponent(col.nombre)}`)}
                  style={{
                    padding: '7px 18px',
                    borderRadius: '24px',
                    border: esActiva ? '2px solid #0369a1' : '1.5px solid #dcd7cc',
                    background: esActiva ? '#0284c7' : '#ffffff',
                    color: esActiva ? '#ffffff' : '#0369a1',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {col.nombre}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="detalle-spinner" />
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <span style={{ fontSize: 56 }}>🔍</span>
            <h2 style={{ fontFamily: 'Nunito', fontWeight: 900, color: 'var(--lila-dark)', margin: '16px 0 8px' }}>
              {busqueda.trim() ? `No encontramos productos para “${busqueda.trim()}”` : 'No hay productos en esta categoría todavía'}
            </h2>
            <p style={{ color: 'var(--gris)', marginBottom: 24 }}>{busqueda.trim() ? 'Probá con otro nombre o palabra.' : 'Pronto habrá novedades'}</p>
            <button className="btn-carrito-primary" onClick={() => navigate('/')}>
              Ver todos los productos
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--gris)', fontSize: '0.88rem', marginBottom: 24 }}>
              {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
            </p>
            <div className="productos-grid">
              {productosFiltrados.map(prod => (
                <ProductCard
                  key={prod.id}
                  prod={prod}
                  tieneVariantes={prod.variantes?.filter(v => v !== 'Única').length > 0}
                  mostrarExito={exitoId === prod.id}
                  manejarClickBoton={() => manejarAgregar(prod)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modalProd && (
        <ModalDetalle
          prod={modalProd}
          cerrar={() => setModalProd(null)}
          agregarAlCarrito={(prod, variante, idVariante) => {
            agregarAlCarrito(prod, variante, idVariante);
            setModalProd(null);
            setExitoId(prod.id);
            setTimeout(() => setExitoId(null), 1500);
          }}
        />
      )}
    </div>
  );
}
