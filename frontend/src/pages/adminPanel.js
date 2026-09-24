import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminProductoForm from './adminProductoForm';

const API = process.env.REACT_APP_API_URL || '/api';

const E = {
  pagina:   { minHeight: '100vh', background: '#f8fafc', padding: '30px', fontFamily: 'Segoe UI, sans-serif' },
  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  titulo:   { margin: '0 0 14px', fontSize: '1.6rem', color: '#1e293b', fontWeight: 800 },
  tabs:     { display: 'flex', gap: '8px' },
  tab:      { padding: '9px 22px', border: '1px solid #cbd5e1', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 700, color: '#64748b', transition: 'all 0.2s' },
  tabActivo:{ background: '#0284c7', color: 'white', border: '1px solid #0284c7', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)' },
  btnNuevo: { padding: '10px 20px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 700 },
  btnLogout:{ padding: '10px 18px', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 600 },
  wrapper:  { background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  tabla:    { width: '100%', borderCollapse: 'collapse' },
  trHead:   { background: '#f1f5f9' },
  tr:       { borderBottom: '1px solid #f1f5f9' },
  th:       { padding: '14px 18px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td:       { padding: '16px 18px', fontSize: '0.9rem', color: '#334155', verticalAlign: 'middle' },
  badge:    { display: 'inline-block', padding: '4px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '800' },
  overlay:  { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' },
  card:     { background: 'white', padding: '30px', borderRadius: '16px', maxWidth: '480px', width: '92%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
  input:    { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', boxSizing: 'border-box', outline: 'none' },
  label:    { display: 'block', fontWeight: '700', fontSize: '0.86rem', marginBottom: '6px', color: '#475569' },
  btnCancelar:        { padding: '9px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 },
  btnEliminarConfirm: { padding: '9px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 },
};

// Formateador de link de WhatsApp
function formatWhatsAppUrl(tel, nombre, idVenta) {
  if (!tel) return null;
  let clean = tel.replace(/\D/g, '');
  if (clean.startsWith('0')) clean = clean.substring(1);
  if (!clean.startsWith('54')) clean = '549' + clean;
  else if (clean.startsWith('54') && !clean.startsWith('549')) clean = '549' + clean.substring(2);
  const texto = encodeURIComponent(`¡Hola ${nombre}! Te escribimos de Lody Arte por tu pedido #${idVenta} 🌸`);
  return `https://wa.me/${clean}?text=${texto}`;
}

// ── Tab Productos ─────────────────────────────────────────────────────────────
function TabProductos({ productos, onEditar, onEliminar }) {
  if (productos.length === 0)
    return <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No hay productos cargados.</p>;

  return (
    <div style={E.wrapper}>
      <table style={E.tabla}>
        <thead>
          <tr style={E.trHead}>
            {['Imagen','Nombre','Precio','Stock','Variantes','Categorías','Acciones'].map(h => (
              <th key={h} style={E.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productos.map(prod => {
            const img = (Array.isArray(prod.imagen_url) ? prod.imagen_url : prod.imagenes || [])[0];
            const vars = (prod.variantes_detalle || []).filter(v => v.nombre !== 'Única');
            return (
              <tr key={prod.id} style={E.tr}>
                <td style={E.td}>
                  <img src={img ? `/productos/${img}` : '/placeholder.svg'} alt={prod.nombre}
                    onError={(event) => {
                      if (!event.currentTarget.src.endsWith('/placeholder.svg')) event.currentTarget.src = '/placeholder.svg';
                    }}
                    style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                </td>
                <td style={E.td}>
                  <strong>{prod.nombre}</strong><br/>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{prod.material || ''}</span>
                </td>
                <td style={E.td}>${Number(prod.precio).toLocaleString('es-AR')}</td>
                <td style={E.td}>
                  <span style={{ ...E.badge, background: prod.stock === 0 ? '#fee2e2' : '#dcfce7', color: prod.stock === 0 ? '#dc2626' : '#15803d' }}>
                    {prod.stock === 0 ? 'Sin stock' : prod.stock}
                  </span>
                </td>
                <td style={E.td}>
                  {vars.length > 0
                    ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {vars.map(v => (
                          <span key={v.id} style={{ ...E.badge, background: v.stock === 0 ? '#fee2e2' : '#f1f5f9', color: v.stock === 0 ? '#dc2626' : '#475569' }}>
                            {v.nombre}: {v.stock === 0 ? 'sin stock' : v.stock} {v.precio && Number(v.precio) !== Number(prod.precio) ? `($${Number(v.precio).toLocaleString('es-AR')})` : ''}
                          </span>
                        ))}
                      </div>
                    : '—'}
                </td>
                <td style={E.td}>
                  {prod.categorias?.length > 0
                    ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {prod.categorias.map(c => (
                          <span key={c.id} style={{ ...E.badge, background: '#ede9fe', color: '#6d28d9' }}>{c.nombre}</span>
                        ))}
                      </div>
                    : <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Sin categoría</span>}
                </td>
                <td style={E.td}>
                  <button onClick={() => onEditar(prod)} style={{ padding: '6px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer', marginRight: 6, fontSize: '0.82rem', fontWeight: 600 }}>Editar</button>
                  <button onClick={() => onEliminar(prod.id)} style={{ padding: '6px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab Pedidos (Pendientes de pago) ──────────────────────────────────────────
function TabPedidos({ pedidos, onSolicitarConfirmarPago, onSolicitarCancelar }) {
  if (pedidos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 14, border: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: 44, display: 'block', marginBottom: 12 }}>🎉</span>
        <h3 style={{ margin: '0 0 6px', color: '#1e293b' }}>¡No hay pedidos pendientes de pago!</h3>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Todos los pedidos recibidos ya han sido procesados o abonados.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {pedidos.map(p => {
        const waUrl = formatWhatsAppUrl(p.telefono_comprador, p.nombre_comprador, p.id);
        const metodoLabel =
          p.metodo_pago === 'retiro_en_persona' ? '📍 Retiro en persona' :
          p.metodo_pago === 'mercadopago' ? '💳 Mercado Pago' : '🏦 Transferencia bancaria';

        return (
          <div key={p.id} style={{ background: 'white', borderRadius: 14, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            {/* Cabecera del pedido */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0369a1' }}>Pedido #{p.id}</span>
                  <span style={{ ...E.badge, background: '#fef3c7', color: '#92400e' }}>⏳ Pendiente de Pago</span>
                  <span style={{ ...E.badge, background: '#f1f5f9', color: '#475569' }}>{metodoLabel}</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0' }}>
                  Fecha: {new Date(p.creado_en).toLocaleString('es-AR')}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => onSolicitarCancelar(p)}
                  style={{
                    padding: '9px 16px',
                    background: '#fff',
                    color: '#ef4444',
                    border: '1px solid #fca5a5',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  ✕ Cancelar pedido
                </button>
                <button
                  onClick={() => onSolicitarConfirmarPago(p)}
                  style={{
                    padding: '10px 18px',
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  ✓ Marcar como Abonado (Pasar a Ventas)
                </button>
              </div>
            </div>

            {/* Datos del cliente y entrega */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, margin: '18px 0' }}>
              {/* Cliente */}
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '16px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  👤 Datos del Comprador
                </h4>
                <p style={{ margin: '4px 0', fontSize: '0.95rem' }}><strong>{p.nombre_comprador}</strong></p>
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#475569' }}>✉️ {p.email_comprador}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: '0.9rem', color: '#475569' }}>📱 {p.telefono_comprador || 'Sin teléfono'}</span>
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: '#25D366',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      💬 Abrir WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Entrega */}
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '16px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🚚 Modalidad y Entrega
                </h4>
                <p style={{ margin: '4px 0', fontSize: '0.92rem', fontWeight: 700, color: '#0369a1' }}>
                  {p.transportista || 'Correo Argentino'}
                </p>
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}>
                  📍 {p.direccion}
                </p>
                <p style={{ margin: '4px 0', fontSize: '0.86rem', color: '#64748b' }}>
                  {p.ciudad}, {p.provincia} (CP: {p.codigo_postal})
                </p>
              </div>
            </div>

            {/* Productos del pedido */}
            <div>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🛍️ Productos solicitados
              </h4>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.78rem', color: '#64748b' }}>Producto</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.78rem', color: '#64748b' }}>Variante</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>Cant.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.78rem', color: '#64748b' }}>Precio unit.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.78rem', color: '#64748b' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(p.items || []).map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontSize: '0.88rem', fontWeight: 600 }}>{item.nombre_producto}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.84rem', color: '#64748b' }}>{item.nombre_variante || 'Única'}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.88rem', textAlign: 'center' }}>x{item.cantidad}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.88rem', textAlign: 'right' }}>${Number(item.precio_unitario).toLocaleString('es-AR')}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.88rem', textAlign: 'right', fontWeight: 700 }}>${Number(item.subtotal).toLocaleString('es-AR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1e293b' }}>
                  Total: ${Number(p.total).toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab Ventas (Pagadas / Enviadas) ───────────────────────────────────────────
function TabVentas({ ventas, onSeguimiento, onSolicitarCancelar }) {
  const estadoInfo = (v) => {
    if (v.estado === 'enviado') return { bg: '#dcfce7', color: '#15803d', label: 'Enviado' };
    return { bg: '#e0f7ff', color: '#0369a1', label: 'Pagado' };
  };

  if (ventas.length === 0)
    return <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No hay ventas abonadas todavía.</p>;

  return (
    <div style={E.wrapper}>
      <table style={E.tabla}>
        <thead>
          <tr style={E.trHead}>
            {['#','Cliente','Tel / WhatsApp','Total','Pago','Estado','Fecha','Envío / Seguimiento','Acciones'].map(h => (
              <th key={h} style={E.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ventas.map(v => {
            const { bg, color, label } = estadoInfo(v);
            const waUrl = formatWhatsAppUrl(v.telefono_comprador, v.nombre_comprador, v.id);
            return (
              <tr key={v.id} style={E.tr}>
                <td style={E.td}><strong>#{v.id}</strong></td>
                <td style={E.td}>
                  <strong>{v.nombre_comprador}</strong><br/>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{v.email_comprador}</span>
                </td>
                <td style={E.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.86rem' }}>{v.telefono_comprador || '—'}</span>
                    {waUrl && (
                      <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontSize: '1rem' }} title="Abrir WhatsApp">
                        💬
                      </a>
                    )}
                  </div>
                </td>
                <td style={E.td}><strong>${Number(v.total).toLocaleString('es-AR')}</strong></td>
                <td style={E.td}>
                  <span style={{ fontSize: '0.84rem' }}>
                    {v.metodo_pago === 'retiro_en_persona' ? '📍 En persona' : v.metodo_pago === 'mercadopago' ? '💳 MP' : '🏦 Transfer.'}
                  </span>
                </td>
                <td style={E.td}><span style={{ ...E.badge, background: bg, color }}>{label}</span></td>
                <td style={E.td}>{new Date(v.creado_en).toLocaleDateString('es-AR')}</td>
                <td style={E.td}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {v.estado === 'pagado' && !v.numero_seguimiento && (
                      <button
                        onClick={() => onSeguimiento(v)}
                        style={{ padding: '6px 12px', background: '#e0f7ff', color: '#0369a1', border: '1px solid #7dd3fc', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                      >
                        📦 Cargar seguimiento
                      </button>
                    )}
                    {v.numero_seguimiento && (
                      <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700 }}>
                        📦 {v.numero_seguimiento}
                      </span>
                    )}
                  </div>
                </td>
                <td style={E.td}>
                  <button
                    onClick={() => onSolicitarCancelar(v)}
                    title="Cancelar pedido"
                    style={{ padding: '5px 10px', background: '#fff', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    ✕ Cancelar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Panel principal ───────────────────────────────────────────────────────────
function AdminPanel() {
  const [tab, setTab] = useState('pedidos');
  const [productos, setProductos] = useState([]);
  const [ventasTodas, setVentasTodas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [modalSeguimiento, setModalSeguimiento] = useState(null);
  const [modalConfirmarPago, setModalConfirmarPago] = useState(null);
  const [modalCancelarPedido, setModalCancelarPedido] = useState(null);
  const [seguimientoForm, setSeguimientoForm] = useState({ numero: '', transportista: '' });
  const [loadingSeg, setLoadingSeg] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('admin_token');
  const headers = { Authorization: `Bearer ${token}` };

  const cargar = async () => {
    setCargando(true);
    try {
      if (tab === 'productos') {
        const r = await axios.get(`${API}/productos`);
        setProductos(r.data);
      } else {
        const r = await axios.get(`${API}/checkout/ventas`, { headers });
        setVentasTodas(r.data);
      }
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, [tab]);

  const handleEliminar = async (id) => {
    await axios.delete(`${API}/productos/${id}`, { headers });
    setConfirmEliminar(null);
    cargar();
  };

  const handleMarcarPagado = async (idVenta) => {
    try {
      await axios.patch(`${API}/checkout/confirmar-transferencia/${idVenta}`, {}, { headers });
      setModalConfirmarPago(null);
      cargar();
    } catch { alert('Error al actualizar el estado del pedido'); }
  };

  const handleCancelarPedido = async (idVenta) => {
    try {
      await axios.patch(`${API}/checkout/ventas/${idVenta}/cancelar`, {}, { headers });
      setModalCancelarPedido(null);
      cargar();
    } catch { alert('Error al cancelar el pedido'); }
  };

  const handleCargarSeguimiento = async () => {
    if (!seguimientoForm.numero.trim()) return;
    setLoadingSeg(true);
    try {
      await axios.patch(`${API}/checkout/ventas/${modalSeguimiento.id}/seguimiento`,
        { numero_seguimiento: seguimientoForm.numero, transportista: seguimientoForm.transportista },
        { headers }
      );
      setModalSeguimiento(null);
      setSeguimientoForm({ numero: '', transportista: '' });
      cargar();
    } catch { alert('Error al cargar el seguimiento'); }
    finally { setLoadingSeg(false); }
  };

  const pedidosPendientes = ventasTodas.filter(v => v.estado === 'pendiente');
  const ventasAbonadas   = ventasTodas.filter(v => v.estado === 'pagado' || v.estado === 'enviado');

  return (
    <div style={E.pagina}>
      {/* Header */}
      <div style={E.header}>
        <div>
          <h1 style={E.titulo}>Panel de Administración — Lody Arte</h1>
          <div style={E.tabs}>
            <button
              style={{ ...E.tab, ...(tab === 'pedidos' ? E.tabActivo : {}) }}
              onClick={() => setTab('pedidos')}
            >
              📥 Pedidos {pedidosPendientes.length > 0 ? `(${pedidosPendientes.length})` : ''}
            </button>
            <button
              style={{ ...E.tab, ...(tab === 'ventas' ? E.tabActivo : {}) }}
              onClick={() => setTab('ventas')}
            >
              💰 Ventas {ventasAbonadas.length > 0 ? `(${ventasAbonadas.length})` : ''}
            </button>
            <button
              style={{ ...E.tab, ...(tab === 'productos' ? E.tabActivo : {}) }}
              onClick={() => setTab('productos')}
            >
              💎 Productos ({productos.length})
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {tab === 'productos' && (
            <button onClick={() => { setProductoEditar(null); setMostrarForm(true); }} style={E.btnNuevo}>
              + Nuevo Producto
            </button>
          )}
          <button onClick={() => { localStorage.removeItem('admin_token'); navigate('/admin/login'); }} style={E.btnLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center', marginTop: 40, color: '#64748b' }}>Cargando datos...</p>
      ) : tab === 'pedidos' ? (
        <TabPedidos
          pedidos={pedidosPendientes}
          onSolicitarConfirmarPago={p => setModalConfirmarPago(p)}
          onSolicitarCancelar={p => setModalCancelarPedido(p)}
        />
      ) : tab === 'ventas' ? (
        <TabVentas
          ventas={ventasAbonadas}
          onSeguimiento={v => setModalSeguimiento(v)}
          onSolicitarCancelar={v => setModalCancelarPedido(v)}
        />
      ) : (
        <TabProductos
          productos={productos}
          onEditar={p => { setProductoEditar(p); setMostrarForm(true); }}
          onEliminar={id => setConfirmEliminar(id)}
        />
      )}

      {/* Modal formulario producto */}
      {mostrarForm && (
        <AdminProductoForm
          productoEditar={productoEditar}
          onGuardado={() => { setMostrarForm(false); setProductoEditar(null); cargar(); }}
          onCancelar={() => { setMostrarForm(false); setProductoEditar(null); }}
        />
      )}

      {/* Confirm eliminar producto */}
      {confirmEliminar && (
        <div style={E.overlay}>
          <div style={E.card}>
            <p style={{ marginBottom: 20, fontSize: '1rem', color: '#1e293b' }}>¿Seguro que querés eliminar este producto?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setConfirmEliminar(null)} style={E.btnCancelar}>Cancelar</button>
              <button onClick={() => handleEliminar(confirmEliminar)} style={E.btnEliminarConfirm}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar pago */}
      {modalConfirmarPago && (
        <div style={E.overlay}>
          <div style={E.card}>
            <h3 style={{ marginBottom: 14, color: '#16a34a', fontSize: '1.25rem', fontWeight: 900 }}>
              ✓ Confirmar Pago del Pedido #{modalConfirmarPago.id}
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, marginBottom: 16 }}>
              ¿Confirmás que el cliente <strong>{modalConfirmarPago.nombre_comprador}</strong> abonó el total de <strong>${Number(modalConfirmarPago.total).toLocaleString('es-AR')}</strong>?
            </p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              El pedido pasará a la sección de <strong>Ventas</strong> para que puedas despacharlo y cargar su número de seguimiento.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalConfirmarPago(null)} style={E.btnCancelar}>Cancelar</button>
              <button
                onClick={() => handleMarcarPagado(modalConfirmarPago.id)}
                style={{ ...E.btnNuevo, background: '#16a34a' }}
              >
                ✓ Sí, marcar como Abonado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cancelar pedido */}
      {modalCancelarPedido && (
        <div style={E.overlay}>
          <div style={E.card}>
            <h3 style={{ marginBottom: 14, color: '#dc2626', fontSize: '1.25rem', fontWeight: 900 }}>
              ⚠️ Cancelar Pedido #{modalCancelarPedido.id}
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, marginBottom: 16 }}>
              ¿Deseás cancelar el pedido de <strong>{modalCancelarPedido.nombre_comprador}</strong>?
            </p>
            <p style={{ fontSize: '0.85rem', color: '#dc2626', background: '#fef2f2', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecaca', marginBottom: 20 }}>
              Esta acción marcará el pedido como cancelado y devolverá automáticamente el stock de los productos a la tienda.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalCancelarPedido(null)} style={E.btnCancelar}>Volver</button>
              <button
                onClick={() => handleCancelarPedido(modalCancelarPedido.id)}
                style={E.btnEliminarConfirm}
              >
                ✕ Sí, cancelar pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal seguimiento */}
      {modalSeguimiento && (
        <div style={E.overlay}>
          <div style={E.card}>
            <h3 style={{ marginBottom: 16, color: '#1e293b', fontSize: '1.2rem' }}>📦 Cargar número de seguimiento</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 18 }}>
              Se enviará una notificación por email a {modalSeguimiento.email_comprador} con el código de seguimiento.
            </p>
            <div style={{ marginBottom: 14 }}>
              <label style={E.label}>Número de seguimiento *</label>
              <input style={E.input} value={seguimientoForm.numero} placeholder="Ej: CA123456789AR"
                onChange={e => setSeguimientoForm({ ...seguimientoForm, numero: e.target.value })} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={E.label}>Transportista (opcional)</label>
              <input style={E.input} value={seguimientoForm.transportista} placeholder="Ej: Correo Argentino"
                onChange={e => setSeguimientoForm({ ...seguimientoForm, transportista: e.target.value })} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalSeguimiento(null)} style={E.btnCancelar}>Cancelar</button>
              <button onClick={handleCargarSeguimiento} style={E.btnNuevo} disabled={loadingSeg}>
                {loadingSeg ? 'Enviando...' : 'Guardar y Notificar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
