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

  const [codigoPostal, setCodigoPostal] = useState('');
  const [loadingEnvio, setLoadingEnvio] = useState(false);
  const [resultadoCA, setResultadoCA] = useState(null);
  const [resultadoAndreani, setResultadoAndreani] = useState(null);
  const [errorEnvio, setErrorEnvio] = useState('');

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

  const handleAgregar = () => {
    if (tieneVariantes && !varianteSeleccionada) {
      setErrorVariante(true);
      setTimeout(() => setErrorVariante(false), 2000);
      return;
    }
    const variante = tieneVariantes ? varianteSeleccionada : null;
    const idVariante = getIdVariante(variante);
    for (let i = 0; i < cantidad; i++) {
      agregarAlCarrito(producto, variante, idVariante);
    }
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  const calcularEnvio = async () => {
    if (!codigoPostal || codigoPostal.length < 4) {
      setErrorEnvio('Ingresá un código postal válido.');
      return;
    }
    setErrorEnvio('');
    setLoadingEnvio(true);
    setResultadoCA(null);
    setResultadoAndreani(null);

    try {
      const res = await axios.get(
        `https://api.correoargentino.com.ar/micorreo/v1/tarifas?codigoPostalDestino=${codigoPostal}&peso=0.1&tipoPeso=KG`,
        { timeout: 5000 }
      );
      setResultadoCA(res.data);
    } catch { setResultadoCA({ error: true }); }

    try {
      const res = await axios.get(
        `https://apis.andreani.com/v1/tarifas?codigoPostal=${codigoPostal}&peso=100`,
        { timeout: 5000 }
      );
      setResultadoAndreani(res.data);
    } catch { setResultadoAndreani({ error: true }); }

    setLoadingEnvio(false);
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

  return (
    <div className="detalle-page">

      <div className="detalle-breadcrumb">
        <span className="detalle-breadcrumb-link" onClick={() => navigate('/')}>Inicio</span>
        <span className="detalle-breadcrumb-sep"> / </span>
        <span>{producto.nombre}</span>
      </div>

      <div className="detalle-grid">

        <div>
          <div className="detalle-slider-wrap">
            {imagenes.length === 0 ? (
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
                  src={`/productos/${imagenes[imagenActual]}`}
                  alt={producto.nombre}
                  className="detalle-img-principal"
                />
                {imagenes.length > 1 && (
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
          <p className="detalle-precio">${Number(producto.precio).toLocaleString('es-AR')}</p>

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
                {producto.variantes.filter(v => v !== 'Única').map(v => (
                  <button
                    key={v}
                    onClick={() => { setVarianteSeleccionada(v); setErrorVariante(false); }}
                    className={`detalle-var-btn${varianteSeleccionada === v ? ' activo' : ''}${errorVariante ? ' border-alerta' : ''}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="detalle-cantidad-wrap">
            <span className="detalle-label">Cantidad:</span>
            <div className="detalle-cantidad-control">
              <button className="detalle-cant-btn" onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
              <span className="detalle-cant-num">{cantidad}</span>
              <button className="detalle-cant-btn" onClick={() => setCantidad(c => c + 1)}>+</button>
            </div>
          </div>

          <button
            className={`detalle-btn-agregar${agregado ? ' agregado' : ''}`}
            onClick={handleAgregar}
          >
            {agregado ? '✔ ¡Agregado al carrito!' : 'Agregar al carrito'}
          </button>

          <div className="detalle-divisor" />

          <div className="detalle-envio-box">
            <h3 className="detalle-envio-titulo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" />
                <rect x="9" y="11" width="14" height="10" rx="1" />
                <circle cx="12" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              </svg>
              Calcular envío
            </h3>
            <div className="detalle-envio-input-wrap">
              <input
                type="text" inputMode="numeric" maxLength={8}
                placeholder="Ingresá tu código postal"
                value={codigoPostal}
                onChange={e => setCodigoPostal(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && calcularEnvio()}
                className="detalle-cp-input"
              />
              <button className="detalle-btn-calcular" onClick={calcularEnvio} disabled={loadingEnvio}>
                {loadingEnvio ? '...' : 'Calcular'}
              </button>
            </div>
            {errorEnvio && <p className="detalle-error-txt">{errorEnvio}</p>}
            {(resultadoCA || resultadoAndreani) && (
              <div className="detalle-resultados-wrap">
                <div className="detalle-resultado-card">
                  <span className="detalle-resultado-nombre">📦 Correo Argentino</span>
                  {resultadoCA?.error ? (
                    <p className="detalle-error-txt">No disponible en este momento.</p>
                  ) : resultadoCA ? (
                    <div className="detalle-tarifas-list">
                      {Array.isArray(resultadoCA) ? resultadoCA.map((t, i) => (
                        <div key={i} className="detalle-tarifa-item">
                          <span>{t.descripcion || t.modalidad || `Opción ${i + 1}`}</span>
                          <span className="detalle-tarifa-precio">
                            {t.precio != null ? `$${Number(t.precio).toLocaleString('es-AR')}` : 'Consultar'}
                          </span>
                        </div>
                      )) : <p style={{ color: 'var(--gris)', fontSize: 13 }}>{resultadoCA.mensaje || 'Ver opciones en Correo Argentino.'}</p>}
                    </div>
                  ) : null}
                </div>
                <div className="detalle-resultado-card">
                  <span className="detalle-resultado-nombre">🚚 Andreani</span>
                  {resultadoAndreani?.error ? (
                    <p className="detalle-error-txt">No disponible en este momento.</p>
                  ) : resultadoAndreani ? (
                    <div className="detalle-tarifas-list">
                      {Array.isArray(resultadoAndreani) ? resultadoAndreani.map((t, i) => (
                        <div key={i} className="detalle-tarifa-item">
                          <span>{t.descripcion || t.modalidad || `Opción ${i + 1}`}</span>
                          <span className="detalle-tarifa-precio">
                            {t.precio != null ? `$${Number(t.precio).toLocaleString('es-AR')}` : 'Consultar'}
                          </span>
                        </div>
                      )) : <p style={{ color: 'var(--gris)', fontSize: 13 }}>{resultadoAndreani.mensaje || 'Ver opciones en Andreani.'}</p>}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductoDetalle;