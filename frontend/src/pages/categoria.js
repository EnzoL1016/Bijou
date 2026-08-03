// frontend/src/pages/Categoria.js
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ModalDetalle from '../components/ModalDetalle';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const CATEGORIAS_MAP = {
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
  'colecciones':            { query: 'Colecciones',      titulo: 'Colecciones',         subtitulo: '' },
  'mayor':                  { query: 'Mayor',            titulo: 'Packs por mayor',     subtitulo: 'Comprá en cantidad' },
  'promos':                 { query: 'Promos',           titulo: 'Promociones',         subtitulo: '¡Aprovechá!' },
};

export default function Categoria({ agregarAlCarrito }) {
  const { subcategoria, subsubcategoria } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Para rutas sin params (/novedades, /colecciones, etc.) leemos el pathname directamente
  const pathKey = subcategoria
    ? [subcategoria, subsubcategoria].filter(Boolean).join('/')
    : location.pathname.replace('/', '');

  const info = CATEGORIAS_MAP[pathKey] || { query: pathKey, titulo: pathKey, subtitulo: '' };

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalProd, setModalProd] = useState(null);
  const [exitoId, setExitoId] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/productos?categoria=${encodeURIComponent(info.query)}`)
      .then(r => r.json())
      .then(data => { setProductos(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [location.pathname]);

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
      <div style={{ background: '#e0f7ff', padding: '28px 52px 24px', borderBottom: '2px solid #7dd3fc', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: '#7dd3fc', opacity: 0.15, top: -50, right: -30 }} />
        <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: '#38bdf8', opacity: 0.15, bottom: -20, right: 180 }} />

        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#0369a1', fontFamily: 'Nunito', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', marginBottom: 10, padding: 0 }}
        >
          ← Volver
        </button>

        <h1 style={{ fontFamily: 'Nunito', fontWeight: 900, fontStyle: 'italic', fontSize: '2rem', color: '#0369a1', margin: 0, position: 'relative', zIndex: 1 }}>
          {info.titulo}
        </h1>
        {info.subtitulo && (
          <p style={{ color: '#0ea5e9', marginTop: 6, fontSize: '0.9rem', position: 'relative', zIndex: 1 }}>
            {info.subtitulo}
          </p>
        )}
      </div>

      {/* Grilla de productos */}
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '48px 52px 80px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="detalle-spinner" />
          </div>
        ) : productos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <span style={{ fontSize: 56 }}>🔍</span>
            <h2 style={{ fontFamily: 'Nunito', fontWeight: 900, color: 'var(--lila-dark)', margin: '16px 0 8px' }}>
              No hay productos en esta categoría todavía
            </h2>
            <p style={{ color: 'var(--gris)', marginBottom: 24 }}>Pronto habrá novedades</p>
            <button className="btn-carrito-primary" onClick={() => navigate('/')}>
              Ver todos los productos
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--gris)', fontSize: '0.88rem', marginBottom: 24 }}>
              {productos.length} producto{productos.length !== 1 ? 's' : ''}
            </p>
            <div className="productos-grid">
              {productos.map(prod => (
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