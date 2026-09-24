import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ModalDetalle from '../components/ModalDetalle';

const API = process.env.REACT_APP_API_URL || '/api';

const slides = [
  {
    id: 1,
    titulo: 'Nueva Colección 2026',
    subtitulo: 'Accesorios únicos hechos a mano',
    cta: 'Ver colección',
    path: '/colecciones',
    bg: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 60%, #0d9488 100%)',
    imagen: null,
  },
  {
    id: 2,
    titulo: 'Packs por Mayor',
    subtitulo: 'Precios especiales para revendedoras',
    cta: 'Ver packs',
    path: '/mayor',
    bg: 'linear-gradient(135deg, #0d9488 0%, #0ea5e9 100%)',
    imagen: null,
  },
  {
    id: 3,
    titulo: '¡Promos de la semana!',
    subtitulo: 'Descuentos exclusivos por tiempo limitado',
    cta: 'Ver promos',
    path: '/promos',
    bg: 'linear-gradient(135deg, #06b6d4 0%, #7dd3fc 100%)',
    imagen: null,
  },
];

function SeccionCarrusel({ titulo, sub, path, productos, slide, setSlide, manejarAccionProducto, idProductoExito, tieneVariantesReales, tono }) {
  const [visibleItems, setVisibleItems] = useState(() => window.innerWidth <= 480 ? 1 : window.innerWidth <= 768 ? 2 : 4);
  useEffect(() => {
    const actualizarVisible = () => setVisibleItems(window.innerWidth <= 480 ? 1 : window.innerWidth <= 768 ? 2 : 4);
    window.addEventListener('resize', actualizarVisible);
    return () => window.removeEventListener('resize', actualizarVisible);
  }, []);

  const maxSlide = Math.max(0, productos.length - visibleItems);
  const espacioPorPaso = visibleItems === 4 ? 4 : visibleItems === 2 ? 8 : 16;
  const prev = () => setSlide(s => Math.max(0, s - 1));
  const next = () => setSlide(s => Math.min(maxSlide, s + 1));

  useEffect(() => {
    setSlide(s => Math.min(s, maxSlide));
  }, [maxSlide, setSlide]);

  return (
    <div className={`container-tienda container-tienda--${tono}`} style={{ paddingTop: '10px' }}>
      <div className="seccion-titulo">
        <div className="seccion-titulo-texto">
          <h2>{titulo}</h2>
          <p>{sub}</p>
        </div>
        <div className="seccion-linea"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="sec-carrusel-btn" onClick={prev} disabled={slide === 0}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="sec-carrusel-btn" onClick={next} disabled={slide >= maxSlide}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <Link to={path} className="seccion-ver-mas">Ver todo →</Link>
        </div>
      </div>

      <div className="sec-carrusel-viewport">
        <div className="sec-carrusel-track" style={{ transform: `translateX(calc(-${slide * (100 / visibleItems)}% - ${slide * espacioPorPaso}px))` }}>
          {productos.map((p, i) => (
            <div key={p.id ?? i} className="sec-carrusel-item">
              <ProductCard prod={p}
                manejarClickBoton={() => manejarAccionProducto(p)}
                mostrarExito={idProductoExito === p.id}
                tieneVariantes={tieneVariantesReales(p)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Home({ agregarAlCarrito, busqueda }) {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [idProductoExito, setIdProductoExito] = useState(null);
  const [slideActual, setSlideActual] = useState(0);
  const intervalRef = useRef(null);
  const [slideNovedades, setSlideNovedades] = useState(0);
  const [slideColecciones, setSlideColecciones] = useState(0);

  useEffect(() => {
    axios.get(`${API}/productos`)
      .then(res => setProductos(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSlideActual(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const irSlide = (i) => {
    setSlideActual(i);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSlideActual(prev => (prev + 1) % slides.length);
    }, 4000);
  };

  const tieneVariantesReales = (prod) =>
    (prod.variantes || []).filter(v => v !== 'Única').length > 0;

  const getIdVarianteUnica = (prod) => {
    const unica = (prod.variantes_detalle || []).find(v => v.nombre === 'Única');
    return unica ? unica.id : null;
  };

  const manejarAccionProducto = (prod) => {
    if (tieneVariantesReales(prod)) {
      setProductoSeleccionado(prod);
    } else {
      agregarAlCarrito(prod, null, getIdVarianteUnica(prod));
      mostrarCartelExito(prod.id);
    }
  };

  const mostrarCartelExito = (id) => {
    setIdProductoExito(id);
    setTimeout(() => setIdProductoExito(null), 2000);
  };

  const productosFiltrados = productos.filter(p =>
    (p.nombre || '').toLowerCase().includes((busqueda || '').toLowerCase())
  );

  // Filtrar productos para cada sección
  const tieneCategoria = (prod, nombre) =>
    (prod.categorias || []).some(c => c.nombre?.toLowerCase() === nombre.toLowerCase());

  const prodNovedades   = productos.filter(p => Boolean(p.es_novedad) || tieneCategoria(p, 'Novedades'));
  const prodColecciones = productos.filter(p => (p.id_coleccion !== null && p.id_coleccion !== undefined) || tieneCategoria(p, 'Colecciones'));
  const prodTodo        = productos.slice(0, 8); // muestra los primeros de todo el catálogo

  return (
    <>
      {busqueda ? (
        <div className="container-tienda container-tienda--sky">
          <div className="seccion-titulo">
            <div className="seccion-titulo-texto">
              <h2>Resultados para "{busqueda}"</h2>
            </div>
            <div className="seccion-linea"></div>
            <div className="seccion-count">{productosFiltrados.length} productos</div>
          </div>
          <main className="productos-grid">
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((p, i) => (
                <ProductCard key={p.id ?? `filtrados-${i}`} prod={p}
                  manejarClickBoton={() => manejarAccionProducto(p)}
                  mostrarExito={idProductoExito === p.id}
                  tieneVariantes={tieneVariantesReales(p)}
                />
              ))
            ) : (
              <p style={{ color: '#4b6478', gridColumn: '1/-1', padding: '40px 0' }}>
                No se encontraron productos para "{busqueda}".
              </p>
            )}
          </main>
        </div>
      ) : (
        <>
          {/* CARRUSEL */}
          <div className="carrusel">
            <div className="carrusel-track" style={{ transform: `translateX(-${slideActual * 100}%)` }}>
              {slides.map((slide) => (
                <div key={slide.id} className="carrusel-slide"
                  style={{ background: slide.imagen ? `url(${slide.imagen}) center/cover` : slide.bg }}>
                  <div className="carrusel-contenido">
                    <div className="carrusel-tag">Lody Arte</div>
                    <h2 className="carrusel-titulo">{slide.titulo}</h2>
                    <p className="carrusel-subtitulo">{slide.subtitulo}</p>
                    <Link className="carrusel-cta" to={slide.path}>{slide.cta} →</Link>
                  </div>
                  <div className="carrusel-shapes">
                    <div className="cs cs-1"></div>
                    <div className="cs cs-2"></div>
                    <div className="cs cs-3"></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="carrusel-btn carrusel-prev" onClick={() => irSlide((slideActual - 1 + slides.length) % slides.length)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button className="carrusel-btn carrusel-next" onClick={() => irSlide((slideActual + 1) % slides.length)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
            <div className="carrusel-dots">
              {slides.map((_, i) => (
                <button key={i} className={`carrusel-dot ${i === slideActual ? 'activo' : ''}`} onClick={() => irSlide(i)} />
              ))}
            </div>
          </div>

          {/* TRUST BAR */}
          <div className="trust-bar">
            <div className="trust-item">
              <div className="trust-icon-wrap">
                <svg viewBox="0 0 24 24"><path d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
              </div>
              <div className="trust-texto"><strong>Envío a todo el país</strong><span>Rápido y seguro</span></div>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrap">
                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
              </div>
              <div className="trust-texto"><strong>Hecho con amor</strong><span>Piezas artesanales únicas</span></div>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrap">
                <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              </div>
              <div className="trust-texto"><strong>Sin mínimo de compra</strong><span>Llevá lo que quieras</span></div>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrap">
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              </div>
              <div className="trust-texto"><strong>Atención personalizada</strong><span>Respondemos al instante</span></div>
            </div>
          </div>

          {/* NOVEDADES — carrusel */}
          {prodNovedades.length > 0 && (
            <SeccionCarrusel
              titulo="Novedades" sub="Lo último que llegó" path="/novedades" tono="lila"
              productos={prodNovedades} slide={slideNovedades} setSlide={setSlideNovedades}
              manejarAccionProducto={manejarAccionProducto} idProductoExito={idProductoExito}
              tieneVariantesReales={tieneVariantesReales}
            />
          )}

          {/* COLECCIONES — carrusel */}
          {prodColecciones.length > 0 && (
            <SeccionCarrusel
              titulo="Colecciones" sub="Nuestras piezas favoritas" path="/colecciones" tono="mint"
              productos={prodColecciones} slide={slideColecciones} setSlide={setSlideColecciones}
              manejarAccionProducto={manejarAccionProducto} idProductoExito={idProductoExito}
              tieneVariantesReales={tieneVariantesReales}
            />
          )}

          {/* TODO — grid normal */}
          {prodTodo.length > 0 && (
            <div className="container-tienda container-tienda--sky" style={{ paddingTop: '10px' }}>
              <div className="seccion-titulo">
                <div className="seccion-titulo-texto">
                  <h2>Todo</h2>
                  <p>Explorá todo el catálogo</p>
                </div>
                <div className="seccion-linea"></div>
                <Link to="/todo" className="seccion-ver-mas">Ver todo →</Link>
              </div>
              <div className="productos-grid">
                {prodTodo.map((p, i) => (
                  <ProductCard key={p.id ?? `todo-${i}`} prod={p}
                    manejarClickBoton={() => manejarAccionProducto(p)}
                    mostrarExito={idProductoExito === p.id}
                    tieneVariantes={tieneVariantesReales(p)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL */}
      {productoSeleccionado && (
        <ModalDetalle
          prod={productoSeleccionado}
          cerrar={() => setProductoSeleccionado(null)}
          agregarAlCarrito={(prod, variante, idVariante) => {
            agregarAlCarrito(prod, variante, idVariante);
            setProductoSeleccionado(null);
            mostrarCartelExito(prod.id);
          }}
        />
      )}
    </>
  );
}

export default Home;
