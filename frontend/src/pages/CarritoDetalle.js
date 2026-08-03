import React from 'react';
import { useNavigate } from 'react-router-dom';

function CarritoDetalle({ carrito, actualizarCantidad, eliminarDelCarrito }) {
  const navigate = useNavigate();

  const totalDinamico = carrito.reduce((acc, item) => {
    const p = Number(item.precio) || 0;
    const c = Number(item.cantidad) || 0;
    return acc + (p * c);
  }, 0);

  return (
    <div className="carrito-page">

      <div className="carrito-header">
        <h1 className="carrito-titulo">Tu Carrito</h1>
        <span className="carrito-count">{carrito.reduce((a, b) => a + b.cantidad, 0)} productos</span>
      </div>

      {carrito.length === 0 ? (
        <div className="carrito-vacio">
          <div className="carrito-vacio-icono">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <h2>Tu carrito está vacío</h2>
          <p>Explorá nuestra colección y encontrá algo que te encante.</p>
          <button className="btn-carrito-primary" onClick={() => navigate('/')}>
            Ver colección
          </button>
        </div>
      ) : (
        <div className="carrito-layout">

          {/* LISTA DE PRODUCTOS */}
          <div className="carrito-items">
            {carrito.map((item) => (
              <div key={`${item.id}-${item.varianteSeleccionada ?? 'sin-variante'}`} className="carrito-fila">
                <img
                  src={item.imagenes && item.imagenes.length > 0 ? `/productos/${item.imagenes[0]}` : '/placeholder.jpg'}
                  alt={item.nombre}
                  className="carrito-img"
                />

                <div className="carrito-info">
                  <h3 className="carrito-nombre">{item.nombre}</h3>
                  {item.varianteSeleccionada && item.varianteSeleccionada !== 'Única' && (
                    <span className="carrito-variante">{item.varianteSeleccionada}</span>
                  )}
                  <p className="carrito-precio-unit">${Number(item.precio).toLocaleString()} c/u</p>
                </div>

                <div className="carrito-controles">
                  <button
                    className="btn-cant"
                    onClick={() => actualizarCantidad(item.id, item.varianteSeleccionada, -1)}
                  >−</button>
                  <span className="carrito-cantidad">{item.cantidad}</span>
                  <button
                    className="btn-cant"
                    onClick={() => actualizarCantidad(item.id, item.varianteSeleccionada, 1)}
                  >+</button>
                </div>

                <div className="carrito-subtotal">
                  ${(Number(item.precio) * item.cantidad).toLocaleString()}
                </div>

                <button
                  className="btn-eliminar-item"
                  onClick={() => eliminarDelCarrito(item.id, item.varianteSeleccionada)}
                  title="Eliminar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* RESUMEN */}
          <div className="carrito-resumen">
            <h2 className="resumen-titulo">Resumen</h2>

            <div className="resumen-linea">
              <span>Subtotal</span>
              <span>${totalDinamico.toLocaleString()}</span>
            </div>
            <div className="resumen-linea">
              <span>Envío</span>
              <span className="resumen-envio">A calcular</span>
            </div>

            <div className="resumen-total">
              <span>Total</span>
              <span>${totalDinamico.toLocaleString()}</span>
            </div>

            <button
              className="btn-carrito-primary btn-full"
              onClick={() => navigate('/checkout')}
            >
              Finalizar Compra
            </button>

            <button className="btn-carrito-secondary btn-full" onClick={() => navigate('/')}>
              Seguir comprando
            </button>

            <div className="resumen-trust">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Pago 100% seguro
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default CarritoDetalle;