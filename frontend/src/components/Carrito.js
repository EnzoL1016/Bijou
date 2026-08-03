import React from 'react';

function Carrito({ carrito, setCarrito, finalizarCompra }) {
  const totalCompra = carrito.reduce((acc, prod) => acc + Number(prod.precio), 0);

  return (
    <div className="carrito-container">
      <h3>🛒 Mi Carrito ({carrito.length})</h3>
      <h2>Total: ${totalCompra.toLocaleString()}</h2>
      
      {carrito.length > 0 ? (
        <div className="carrito-info">
          <button className="btn-pagar" onClick={finalizarCompra}>Confirmar y Pagar</button>
          <button className="btn-vaciar" onClick={() => setCarrito([])}>Vaciar</button>
        </div>
      ) : (
        <p>El carrito está vacío</p>
      )}
    </div>
  );
}

export default Carrito;