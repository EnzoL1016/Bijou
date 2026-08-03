import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProductCard({ prod, manejarClickBoton, mostrarExito, tieneVariantes }) {
  const navigate = useNavigate();
  const imagenes = (
    Array.isArray(prod.imagen_url) ? prod.imagen_url :
      Array.isArray(prod.imagenes) ? prod.imagenes : []
  ).filter(img => img && typeof img === 'string' && img.trim() !== '');

  const sinStock = Number(prod.stock) === 0;

  return (
    <div className="producto-card">
      <div className="image-container">
        <img
          src={imagenes.length > 0 ? `/productos/${imagenes[0]}` : '/placeholder.jpg'}
          className="product-img"
          alt={prod.nombre}
          style={sinStock ? { filter: 'grayscale(0.4)', opacity: 0.85 } : {}}
        />
        {sinStock && (
          <div className="sin-stock-badge">Sin stock</div>
        )}
        {mostrarExito && !sinStock && (
          <div className="cartel-exito-overlay">
            <div className="contenido-exito">
              <span>✔</span>
              <p>¡Agregado!</p>
            </div>
          </div>
        )}
      </div>

      <div className="info-resumen">
        <h3>{prod.nombre}</h3>
        <p className="precio">${Number(prod.precio).toLocaleString()}</p>
        <div className="hover-actions">
          <button className="btn-chico" onClick={() => navigate(`/producto/${prod.id}`)}>
            Ver más
          </button>
          <button
            className={`btn-chico btn-oscuro ${sinStock ? 'btn-deshabilitado' : ''}`}
            disabled={sinStock}
            onClick={(e) => {
              e.stopPropagation();
              if (!sinStock) manejarClickBoton();
            }}
          >
            {sinStock ? 'Sin stock' : tieneVariantes ? 'Elegir' : 'Añadir al carrito'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;