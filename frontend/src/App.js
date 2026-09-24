import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Footer from './components/footer';
import Home from './pages/Home';
import CarritoDetalle from './pages/CarritoDetalle';
import ProductoDetalle from './pages/productoDetalle';
import AdminLogin from './pages/adminLogin';
import AdminPanel from './pages/adminPanel';
import PrivateRoute from './components/privateRoute';
import Checkout from './pages/Checkout';
import CompraExitosa from './pages/CompraExitosa';
import CompraError from './pages/CompraError';
import Categoria from './pages/categoria';
import Nosotros from './pages/nosotros';
import Envios from './pages/envios';
import Contacto from './pages/contacto';
import Personalizado from './pages/personalizado';
import ComoComprar from './pages/comoComprar';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppContent({ carrito, setCarrito, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, busqueda, setBusqueda }) {
  const location = useLocation();
  const esAdmin = location.pathname.startsWith("/admin");
  const sinFooter = ["/carrito","/checkout","/compra-exitosa","/compra-error"].includes(location.pathname);

  return (
    <div className="App">
      {!esAdmin && (
        <NavBar
          carritoCount={carrito.reduce((a, b) => a + (b.cantidad || 1), 0)}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
        />
      )}
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home agregarAlCarrito={agregarAlCarrito} busqueda={busqueda} />} />
        <Route
          path="/carrito"
          element={
            <CarritoDetalle
              key={JSON.stringify(carrito)}
              carrito={carrito}
              actualizarCantidad={actualizarCantidad}
              eliminarDelCarrito={eliminarDelCarrito}
            />
          }
        />
        <Route path="/producto/:id" element={<ProductoDetalle agregarAlCarrito={agregarAlCarrito} />} />
        <Route path="/checkout" element={<Checkout carrito={carrito} setCarrito={setCarrito} />} />
        <Route path="/compra-exitosa" element={<CompraExitosa />} />
        <Route path="/compra-error" element={<CompraError />} />

        {/* Categorías */}
        <Route path="/todo" element={<Categoria agregarAlCarrito={agregarAlCarrito} busqueda={busqueda} />} />
        <Route path="/novedades" element={<Categoria agregarAlCarrito={agregarAlCarrito} busqueda={busqueda} />} />
        <Route path="/promos" element={<Categoria agregarAlCarrito={agregarAlCarrito} busqueda={busqueda} />} />
        <Route path="/colecciones" element={<Categoria agregarAlCarrito={agregarAlCarrito} busqueda={busqueda} />} />
        <Route path="/colecciones/:subcategoria" element={<Categoria agregarAlCarrito={agregarAlCarrito} busqueda={busqueda} />} />
        <Route path="/mayor" element={<Categoria agregarAlCarrito={agregarAlCarrito} busqueda={busqueda} />} />
        <Route path="/bordados" element={<Categoria agregarAlCarrito={agregarAlCarrito} busqueda={busqueda} />} />
        <Route path="/bordados/:subcategoria" element={<Categoria agregarAlCarrito={agregarAlCarrito} busqueda={busqueda} />} />
        <Route path="/accesorios/:subcategoria" element={<Categoria agregarAlCarrito={agregarAlCarrito} busqueda={busqueda} />} />
        <Route path="/accesorios/:subcategoria/:subsubcategoria" element={<Categoria agregarAlCarrito={agregarAlCarrito} busqueda={busqueda} />} />

        {/* Páginas estáticas */}
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/como-comprar" element={<ComoComprar />} />
        <Route path="/envios" element={<Envios />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/personalizado" element={<Personalizado agregarAlCarrito={agregarAlCarrito} />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
        <Route path="*" element={<main className="pagina-no-encontrada"><h1>No encontramos esta página</h1><p>El enlace puede haber cambiado o estar escrito incorrectamente.</p><Link className="btn-carrito-primary" to="/">Volver al inicio</Link></main>} />
      </Routes>
      {!esAdmin && !sinFooter && <Footer />}
    </div>
  );
}

function App() {
  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem('carrito_lody');
      const carritoGuardado = guardado ? JSON.parse(guardado) : [];
      return Array.isArray(carritoGuardado) ? carritoGuardado : [];
    } catch {
      return [];
    }
  });
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    localStorage.setItem('carrito_lody', JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto, variante = null, idVariante = null) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.id && i.varianteSeleccionada === variante);
      if (existe) {
        return prev.map(i =>
          i.id === producto.id && i.varianteSeleccionada === variante
            ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...producto, cantidad: 1, varianteSeleccionada: variante, idVariante }];
    });
  };

  const actualizarCantidad = (id, variante, delta) => {
    setCarrito(prev =>
      prev.map(item => {
        if (item.id === id && item.varianteSeleccionada === variante) {
          const n = item.cantidad + delta;
          return { ...item, cantidad: n > 0 ? n : 1 };
        }
        return item;
      })
    );
  };

  const eliminarDelCarrito = (id, variante) => {
    setCarrito(prev => prev.filter(i => !(i.id === id && i.varianteSeleccionada === variante)));
  };

  return (
    <Router>
      <ScrollToTop />
      <AppContent
        carrito={carrito}
        setCarrito={setCarrito}
        agregarAlCarrito={agregarAlCarrito}
        actualizarCantidad={actualizarCantidad}
        eliminarDelCarrito={eliminarDelCarrito}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
      />
    </Router>
  );
}

export default App;
