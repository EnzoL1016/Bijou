import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

function ProductoDetalle({ agregarAlCarrito }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagenActual, setImagenActual] = useState(0);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [errorVariante, setErrorVariante] = useState(false);

  const tieneVariantes = producto?.variantes &&
    producto.variantes.filter(v => v !== 'Única').length > 0;

  useEffect(() => {
    axios.get(`${API}/productos/${id}`)
      .then(res => {
        setProducto(res.data);
        const varsReales = (res.data.variantes || []).filter(v => v !== 'Única');
        if (varsReales.length > 0) setVarianteSeleccionada(varsReales[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const imagenes = producto?.imagen_url
    ? Array.isArray(producto.imagen_url) ? producto.imagen_url : JSON.parse(producto.imagen_url)
    : [];

  const prevImg = () => setImagenActual(prev => prev === 0 ? imagenes.length - 1 : prev - 1);
  const nextImg = () => setImagenActual(prev => prev === imagenes.length - 1 ? 0 : prev + 1);

  const getImagenVariante = (nombreVariante) => {
    if (!nombreVariante) return null;
    const detalle = producto?.variantes_detalle || [];
    const encontrada = detalle.find(v => v.nombre === nombreVariante);
    return (encontrada && encontrada.imagen_url) ? encontrada.imagen_url : null;
  };

  const handleSeleccionarVariante = (v) => {
    setVarianteSeleccionada(v);
    setErrorVariante(false);
    const detalle = producto?.variantes_detalle || [];
    const encontrada = detalle.find(item => item.nombre === v);
    if (encontrada && encontrada.imagen_url) {
      const idx = imagenes.indexOf(encontrada.imagen_url);
      if (idx !== -1) {
        setImagenActual(idx);
      }
    }
  };

  // Busca el id de la variante en variantes_detalle
  const getIdVariante = (nombreVariante) => {
    const detalle = producto?.variantes_detalle || [];
    if (!nombreVariante) {
      const unica = detalle.find(v => v.nombre === 'Única');
      return unica ? unica.id : null;
    }
    const encontrada = detalle.find(v => v.nombre === nombreVariante);
    return encontrada ? encontrada.id : null;
  };

  const getStockVariante = (nombreVariante) => {
    const detalle = producto?.variantes_detalle || [];
    if (!nombreVariante) {
      const unica = detalle.find(v => v.nombre === 'Única');
      return unica ? Number(unica.stock) : Number(producto?.stock || 0);
    }
    const encontrada = detalle.find(v => v.nombre === nombreVariante);
    return encontrada ? Number(encontrada.stock) : 0;
  };

  const getPrecioVariante = (nombreVariante) => {
    const detalle = producto?.variantes_detalle || [];
    if (!nombreVariante) return Number(producto?.precio || 0);
    const encontrada = detalle.find(v => v.nombre === nombreVariante);
    return (encontrada && encontrada.precio !== null && encontrada.precio !== undefined && encontrada.precio !== '')
      ? Number(encontrada.precio)
      : Number(producto?.precio || 0);
  };

  const precioActual = tieneVariantes && varianteSeleccionada
    ? getPrecioVariante(varianteSeleccionada)
    : Number(producto?.precio || 0);

  const stockDisponible = tieneVariantes
    ? (varianteSeleccionada ? getStockVariante(varianteSeleccionada) : 0)
    : Number(producto?.stock || 0);

  const sinStock = tieneVariantes
    ? (varianteSeleccionada ? stockDisponible <= 0 : Number(producto?.stock || 0) <= 0)
    : stockDisponible <= 0;

  const handleAgregar = () => {
    if (sinStock) return;
    if (tieneVariantes && !varianteSeleccionada) {
      setErrorVariante(true);
      setTimeout(() => setErrorVariante(false), 2000);
      return;
    }
    const variante = tieneVariantes ? varianteSeleccionada : null;
    const idVariante = getIdVariante(variante);
    const prodParaCarrito = {
      ...producto,
      precio: precioActual,
    };
    for (let i = 0; i < cantidad; i++) {
      agregarAlCarrito(prodParaCarrito, variante, idVariante);
    }
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  if (loading) return (
    <div className="detalle-centered">
      <div className="detalle-spinner" />
      <p>Cargando producto...</p>
    </div>
  );

  if (!producto) return (
    <div className="detalle-centered">
      <p>Producto no encontrado.</p>
      <button className="detalle-btn-volver" onClick={() => navigate('/')}>← Volver al inicio</button>
    </div>
  );

  const imgVariante = tieneVariantes && varianteSeleccionada ? getImagenVariante(varianteSeleccionada) : null;
  const imagenPrincipalSrc = imgVariante
    ? `/productos/${imgVariante}`
    : (imagenes.length > 0 ? `/productos/${imagenes[imagenActual]}` : null);

  return (
    <div className="detalle-wrapper">
      {/* Header Pastel de Detalle */}
      <div className="detalle-header-banner">
        <div className="detalle-banner-deco-1" />
        <div className="detalle-banner-deco-2" />
        <div className="detalle-banner-inner">
          <button
            onClick={() => navigate(-1)}
            className="detalle-btn-regresar"
          >
            ← Volver
          </button>
          <div className="detalle-breadcrumb">
            <span className="detalle-breadcrumb-link" onClick={() => navigate('/')}>Inicio</span>
            <span className="detalle-breadcrumb-sep"> / </span>
            {producto.categorias?.[0] && (
              <>
                <span
                  className="detalle-breadcrumb-link"
                  onClick={() => navigate(`/accesorios/${producto.categorias[0].nombre.toLowerCase()}`)}
                >
                  {producto.categorias[0].nombre}
                </span>
                <span className="detalle-breadcrumb-sep"> / </span>
              </>
            )}
            <span className="detalle-breadcrumb-actual">{producto.nombre}</span>
          </div>
        </div>
      </div>

      <div className="detalle-page">
        <div className="detalle-grid">

        <div>
          <div className="detalle-slider-wrap">
            {!imagenPrincipalSrc ? (
              <div className="detalle-img-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--lila)" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            ) : (
              <>
                <img
                  src={imagenPrincipalSrc}
                  alt={producto.nombre}
                  className="detalle-img-principal"
                  style={sinStock ? { filter: 'grayscale(0.35)', opacity: 0.88 } : {}}
                />
                {Number(producto.stock) === 0 && (
                  <div className="sin-stock-badge" style={{ position: 'absolute', top: 14, left: 14 }}>
                    Sin stock
                  </div>
                )}
                {!imgVariante && imagenes.length > 1 && (
                  <>
                    <button className="detalle-arrow detalle-arrow-prev" onClick={prevImg}>‹</button>
                    <button className="detalle-arrow detalle-arrow-next" onClick={nextImg}>›</button>
                    <div className="detalle-dots">
                      {imagenes.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImagenActual(i)}
                          className={`detalle-dot${i === imagenActual ? ' activo' : ''}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="detalle-col-info">

          <h1 className="detalle-nombre">{producto.nombre}</h1>
          <p className="detalle-precio">${Number(precioActual).toLocaleString('es-AR')}</p>

          {producto.material && (
            <p className="detalle-material">
              <span className="detalle-label">Material:</span> {producto.material}
            </p>
          )}

          {producto.descripcion && (
            <p className="detalle-descripcion">{producto.descripcion}</p>
          )}

          {tieneVariantes && (
            <div className="detalle-variantes-wrap">
              <span className="detalle-label" style={{ color: errorVariante ? '#e05252' : undefined }}>
                {errorVariante ? '⚠ Elegí una variante para continuar' : 'Variante:'}
              </span>
              <div className="detalle-variantes-btns">
                {producto.variantes.filter(v => v !== 'Única').map(v => {
                  const varStock = getStockVariante(v);
                  const varAgotada = varStock <= 0;
                  const varPrecio = getPrecioVariante(v);
                  return (
                    <button
                      key={v}
                      onClick={() => handleSeleccionarVariante(v)}
                      className={`detalle-var-btn${varianteSeleccionada === v ? ' activo' : ''}${errorVariante ? ' border-alerta' : ''}${varAgotada ? ' sin-stock-opt' : ''}`}
                    >
                      {v} {varPrecio !== Number(producto.precio) ? `($${Number(varPrecio).toLocaleString('es-AR')})` : ''} {varAgotada ? '(Sin stock)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="detalle-cantidad-wrap">
            <span className="detalle-label">Cantidad:</span>
            <div className="detalle-cantidad-control">
              <button
                className="detalle-cant-btn"
                disabled={sinStock}
                onClick={() => setCantidad(c => Math.max(1, c - 1))}
              >−</button>
              <span className="detalle-cant-num">{sinStock ? 0 : cantidad}</span>
              <button
                className="detalle-cant-btn"
                disabled={sinStock || (stockDisponible > 0 && cantidad >= stockDisponible)}
                onClick={() => setCantidad(c => c + 1)}
              >+</button>
            </div>
          </div>

          <button
            className={`detalle-btn-agregar${agregado ? ' agregado' : ''}${sinStock ? ' btn-deshabilitado' : ''}`}
            disabled={sinStock || (tieneVariantes && !varianteSeleccionada)}
            onClick={handleAgregar}
          >
            {sinStock ? 'Sin stock' : agregado ? '✔ ¡Agregado al carrito!' : 'Agregar al carrito'}
          </button>

        </div>
      </div>
    </div>
    </div>
  );
}

export default ProductoDetalle;