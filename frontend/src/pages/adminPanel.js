import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminProductoForm from './adminProductoForm';

const API = process.env.REACT_APP_API_URL || '/api';
const E = { // estilos compartidos
  pagina:   { minHeight: '100vh', background: '#f5f5f5', padding: '30px', fontFamily: 'Segoe UI, sans-serif' },
  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  titulo:   { margin: '0 0 12px', fontSize: '1.5rem', color: '#333' },
  tabs:     { display: 'flex', gap: '4px' },
  tab:      { padding: '8px 20px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.9rem', color: '#666' },
  tabActivo:{ background: '#333', color: 'white', border: '1px solid #333' },
  btnNuevo: { padding: '10px 20px', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  btnLogout:{ padding: '10px 20px', background: 'transparent', color: '#999', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  wrapper:  { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  tabla:    { width: '100%', borderCollapse: 'collapse' },
  trHead:   { background: '#f9f9f9' },
  tr:       { borderBottom: '1px solid #f0f0f0' },
  th:       { padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td:       { padding: '14px 16px', fontSize: '0.9rem', color: '#444', verticalAlign: 'middle' },
  badge:    { display: 'inline-block', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700' },
  overlay:  { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  card:     { background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '440px', width: '90%' },
  input:    { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' },
  label:    { display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#555' },
  btnCancelar:      { padding: '8px 20px', background: 'white', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' },
  btnEliminarConfirm: { padding: '8px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
};

// ── Tab Productos ─────────────────────────────────────────────────────────────
function TabProductos({ productos, onEditar, onEliminar }) {
  if (productos.length === 0)
    return <p style={{ textAlign: 'center', padding: '30px', color: '#999' }}>No hay productos cargados.</p>;

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
                  <img src={img ? `/productos/${img}` : '/placeholder.jpg'} alt={prod.nombre}
                    style={{ width: 55, height: 55, objectFit: 'cover', borderRadius: 8 }} />
                </td>
                <td style={E.td}><strong>{prod.nombre}</strong><br/>
                  <span style={{ fontSize: '0.78rem', color: '#999' }}>{prod.material || ''}</span>
                </td>
                <td style={E.td}>${Number(prod.precio).toLocaleString()}</td>
                <td style={E.td}>
                  <span style={{ ...E.badge, background: prod.stock === 0 ? '#fee2e2' : '#d1fae5', color: prod.stock === 0 ? '#dc2626' : '#065f46' }}>
                    {prod.stock === 0 ? 'Sin stock' : prod.stock}
                  </span>
                </td>
                <td style={E.td}>
                  {vars.length > 0
                    ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {vars.map(v => (
                          <span key={v.id} style={{ ...E.badge, background: v.stock === 0 ? '#fee2e2' : '#f0f0f0', color: v.stock === 0 ? '#dc2626' : '#444' }}>
                            {v.nombre}: {v.stock === 0 ? 'sin stock' : v.stock}
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
                    : <span style={{ color: '#ccc', fontSize: '0.8rem' }}>Sin categoría</span>}
                </td>
                <td style={E.td}>
                  <button onClick={() => onEditar(prod)} style={{ padding: '6px 14px', background: '#f0f0f0', border: 'none', borderRadius: 6, cursor: 'pointer', marginRight: 6, fontSize: '0.82rem' }}>Editar</button>
                  <button onClick={() => onEliminar(prod.id)} style={{ padding: '6px 14px', background: '#fee2e2', color: '#e74c3c', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab Ventas ────────────────────────────────────────────────────────────────
function TabVentas({ ventas, onConfirmar, onSeguimiento }) {
  const estadoInfo = (v) => {
    if (v.estado_pago === 'rechazado') return { bg: '#fee2e2', color: '#dc2626', label: 'Rechazado' };
    if (v.estado === 'enviado')        return { bg: '#d1fae5', color: '#065f46', label: 'Enviado' };
    if (v.estado === 'pagado')         return { bg: '#e0f7ff', color: '#0369a1', label: 'Pagado' };
    return { bg: '#fef9c3', color: '#92400e', label: 'Pendiente' };
  };

  if (ventas.length === 0)
    return <p style={{ textAlign: 'center', padding: '30px', color: '#999' }}>No hay ventas registradas.</p>;

  return (
    <div style={E.wrapper}>
      <table style={E.tabla}>
        <thead>
          <tr style={E.trHead}>
            {['#','Cliente','Total','Pago','Estado','Fecha','Acciones'].map(h => (
              <th key={h} style={E.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ventas.map(v => {
            const { bg, color, label } = estadoInfo(v);
            return (
              <tr key={v.id} style={E.tr}>
                <td style={E.td}>#{v.id}</td>
                <td style={E.td}>
                  <strong>{v.nombre_comprador}</strong><br/>
                  <span style={{ fontSize: '0.8rem', color: '#999' }}>{v.email_comprador}</span>
                </td>
                <td style={E.td}>${Number(v.total).toLocaleString()}</td>
                <td style={E.td}>{v.metodo_pago === 'mercadopago' ? '💳 MP' : '🏦 Transfer.'}</td>
                <td style={E.td}><span style={{ ...E.badge, background: bg, color }}>{label}</span></td>
                <td style={E.td}>{new Date(v.creado_en).toLocaleDateString('es-AR')}</td>
                <td style={E.td}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {v.metodo_pago === 'transferencia' && v.estado === 'pendiente' && (
                      <button onClick={() => onConfirmar(v.id)} style={{ padding: '6px 12px', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                        ✓ Confirmar pago
                      </button>
                    )}
                    {v.estado === 'pagado' && !v.numero_seguimiento && (
                      <button onClick={() => onSeguimiento(v)} style={{ padding: '6px 12px', background: '#e0f7ff', color: '#0369a1', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                        📦 Cargar envío
                      </button>
                    )}
                    {v.numero_seguimiento && (
                      <span style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 700 }}>📦 {v.numero_seguimiento}</span>
                    )}
                  </div>
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
  const [tab, setTab] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [modalSeguimiento, setModalSeguimiento] = useState(null);
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
        setVentas(r.data);
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

  const handleConfirmarTransferencia = async (idVenta) => {
    try {
      await axios.patch(`${API}/checkout/confirmar-transferencia/${idVenta}`, {}, { headers });
      cargar();
    } catch { alert('Error al confirmar la transferencia'); }
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

  return (
    <div style={E.pagina}>
      {/* Header */}
      <div style={E.header}>
        <div>
          <h1 style={E.titulo}>Panel de Administración</h1>
          <div style={E.tabs}>
            {['productos', 'ventas'].map(t => (
              <button key={t} style={{ ...E.tab, ...(tab === t ? E.tabActivo : {}) }} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {tab === 'productos' && (
            <button onClick={() => { setProductoEditar(null); setMostrarForm(true); }} style={E.btnNuevo}>
              + Nuevo Producto
            </button>
          )}
          <button onClick={() => { localStorage.removeItem('admin_token'); navigate('/admin/login'); }} style={E.btnLogout}>
            Salir
          </button>
        </div>
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center', marginTop: 40 }}>Cargando...</p>
      ) : tab === 'productos' ? (
        <TabProductos
          productos={productos}
          onEditar={p => { setProductoEditar(p); setMostrarForm(true); }}
          onEliminar={id => setConfirmEliminar(id)}
        />
      ) : (
        <TabVentas
          ventas={ventas}
          onConfirmar={handleConfirmarTransferencia}
          onSeguimiento={v => setModalSeguimiento(v)}
        />
      )}

      {/* Modal formulario */}
      {mostrarForm && (
        <AdminProductoForm
          productoEditar={productoEditar}
          onGuardado={() => { setMostrarForm(false); setProductoEditar(null); cargar(); }}
          onCancelar={() => { setMostrarForm(false); setProductoEditar(null); }}
        />
      )}

      {/* Confirm eliminar */}
      {confirmEliminar && (
        <div style={E.overlay}>
          <div style={E.card}>
            <p style={{ marginBottom: 20 }}>¿Seguro que querés eliminar este producto?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setConfirmEliminar(null)} style={E.btnCancelar}>Cancelar</button>
              <button onClick={() => handleEliminar(confirmEliminar)} style={E.btnEliminarConfirm}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal seguimiento */}
      {modalSeguimiento && (
        <div style={E.overlay}>
          <div style={E.card}>
            <h3 style={{ marginBottom: 20, color: '#333' }}>📦 Cargar número de seguimiento</h3>
            <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: 16 }}>
              Se enviará un email a {modalSeguimiento.email_comprador}
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={E.label}>Número de seguimiento *</label>
              <input style={E.input} value={seguimientoForm.numero} placeholder="Ej: CA123456789AR"
                onChange={e => setSeguimientoForm({ ...seguimientoForm, numero: e.target.value })} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={E.label}>Transportista (opcional)</label>
              <input style={E.input} value={seguimientoForm.transportista} placeholder="Ej: Correo Argentino..."
                onChange={e => setSeguimientoForm({ ...seguimientoForm, transportista: e.target.value })} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalSeguimiento(null)} style={E.btnCancelar}>Cancelar</button>
              <button onClick={handleCargarSeguimiento} style={E.btnNuevo} disabled={loadingSeg}>
                {loadingSeg ? 'Enviando...' : 'Guardar y notificar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;