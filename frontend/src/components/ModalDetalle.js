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

  const manejarAgregar = () => {
    if (tieneVariantes && !variante) return;
    agregarAlCarrito(prod, tieneVariantes ? variante : null, getIdVariante(tieneVariantes ? variante : null));
  };

  return (
    <div className="modal-fixed-overlay" onClick={cerrar}>
      <div className="modal-centered-card" onClick={e => e.stopPropagation()}>
        <button className="btn-cerrar-modal" onClick={cerrar}>&times;</button>

        <div className="modal-img-side">
          <img
            src={prod.imagenes?.length > 0 ? `/productos/${prod.imagenes[0]}` : '/placeholder.jpg'}
            alt={prod.nombre}
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
                {variantes.map(v => (
                  <button
                    key={v}
                    onClick={() => setVariante(v)}
                    className={`detalle-var-btn${variante === v ? ' activo' : ''}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <h3 className="precio-modal">${Number(prod.precio).toLocaleString()}</h3>

          <button
            className={`btn-grande${tieneVariantes && !variante ? ' btn-deshabilitado' : ''}`}
            disabled={tieneVariantes && !variante}
            onClick={manejarAgregar}
          >
            {tieneVariantes
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