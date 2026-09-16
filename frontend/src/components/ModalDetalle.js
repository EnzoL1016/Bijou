import React, { useState } from 'react';

function ModalDetalle({ prod, cerrar, agregarAlCarrito }) {
  const [variante, setVariante] = useState('');

  if (!prod) return null;

  const variantes = (prod.variantes || []).filter(v => v !== 'Única');
  const tieneVariantes = variantes.length > 0;

  const getIdVariante = (nombreVariante) => {
    const detalle = prod.variantes_detalle || [];
    if (!nombreVariante) {
      const unica = detalle.find(v => v.nombre === 'Única');
      return unica ? unica.id : null;
    }
    return detalle.find(v => v.nombre === nombreVariante)?.id ?? null;
  };

  const getStockVariante = (nombreVariante) => {
    const detalle = prod.variantes_detalle || [];
    if (!nombreVariante) {
      const unica = detalle.find(v => v.nombre === 'Única');
      return unica ? Number(unica.stock) : Number(prod.stock || 0);
    }
    return Number(detalle.find(v => v.nombre === nombreVariante)?.stock ?? 0);
  };

  const sinStock = tieneVariantes
    ? (variante ? getStockVariante(variante) <= 0 : Number(prod.stock || 0) <= 0)
    : Number(prod.stock || 0) <= 0;

  const getImagenVariante = (nombreVariante) => {
    if (!nombreVariante) return null;
    const detalle = prod.variantes_detalle || [];
    const encontrada = detalle.find(v => v.nombre === nombreVariante);
    return (encontrada && encontrada.imagen_url) ? encontrada.imagen_url : null;
  };

  const getPrecioVariante = (nombreVariante) => {
    const detalle = prod.variantes_detalle || [];
    if (!nombreVariante) return Number(prod.precio || 0);
    const encontrada = detalle.find(v => v.nombre === nombreVariante);
    return (encontrada && encontrada.precio !== null && encontrada.precio !== undefined && encontrada.precio !== '')
      ? Number(encontrada.precio)
      : Number(prod.precio || 0);
  };

  const precioActual = tieneVariantes && variante
    ? getPrecioVariante(variante)
    : Number(prod.precio || 0);

  const imgVariante = tieneVariantes && variante ? getImagenVariante(variante) : null;
  const imagenSrc = imgVariante
    ? `/productos/${imgVariante}`
    : (prod.imagenes?.length > 0 ? `/productos/${prod.imagenes[0]}` : '/placeholder.jpg');

  const manejarAgregar = () => {
    if (sinStock) return;
    if (tieneVariantes && !variante) return;
    const prodParaCarrito = { ...prod, precio: precioActual };
    agregarAlCarrito(prodParaCarrito, tieneVariantes ? variante : null, getIdVariante(tieneVariantes ? variante : null));
  };

  return (
    <div className="modal-fixed-overlay" onClick={cerrar}>
      <div className="modal-centered-card" onClick={e => e.stopPropagation()}>
        <button className="btn-cerrar-modal" onClick={cerrar}>&times;</button>

        <div className="modal-img-side">
          <img
            src={imagenSrc}
            alt={prod.nombre}
            style={sinStock ? { filter: 'grayscale(0.35)', opacity: 0.88 } : {}}
          />
        </div>

        <div className="modal-info-side">
          <h2>{prod.nombre}</h2>

          {prod.descripcion && (
            <p className="descripcion-modal">{prod.descripcion}</p>
          )}
          {prod.material && (
            <p className="material-modal"><span style={{ fontWeight: 'bold' }}>Material:</span> {prod.material}</p>
          )}

          {tieneVariantes && (
            <div className="modal-variantes-wrap">
              <span className="detalle-label" style={{ color: !variante ? 'var(--gris)' : 'var(--texto)' }}>
                Seleccioná una opción:
              </span>
              <div className="detalle-variantes-btns">
                {variantes.map(v => {
                  const varAgotada = getStockVariante(v) <= 0;
                  const varPrecio = getPrecioVariante(v);
                  return (
                    <button
                      key={v}
                      onClick={() => setVariante(v)}
                      className={`detalle-var-btn${variante === v ? ' activo' : ''}${varAgotada ? ' sin-stock-opt' : ''}`}
                    >
                      {v} {varPrecio !== Number(prod.precio) ? `($${Number(varPrecio).toLocaleString('es-AR')})` : ''} {varAgotada ? '(Sin stock)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <h3 className="precio-modal">${Number(precioActual).toLocaleString('es-AR')}</h3>

          <button
            className={`btn-grande${(tieneVariantes && !variante) || sinStock ? ' btn-deshabilitado' : ''}`}
            disabled={(tieneVariantes && !variante) || sinStock}
            onClick={manejarAgregar}
          >
            {sinStock
              ? 'Sin stock'
              : tieneVariantes
                ? (variante ? `Añadir — ${variante}` : 'Elegí una variante')
                : 'Añadir al carrito'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalDetalle;