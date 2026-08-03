// frontend/src/pages/Checkout.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const API = process.env.REACT_APP_API_URL || '/api';

const PROVINCIAS = [
  'Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes',
  'Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones',
  'Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe',
  'Santiago del Estero','Tierra del Fuego','Tucumán',
];

// ── Subcomponentes ────────────────────────────────────────────────────────────

function Spinner({ texto }) {
  return (
    <div className="checkout-page">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="detalle-spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--lila-dark)', fontFamily: 'Nunito', fontWeight: 800 }}>{texto}</p>
      </div>
    </div>
  );
}

function ProblemasStock({ problemas, navigate }) {
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-card" style={{ maxWidth: 540, margin: '60px auto', textAlign: 'center' }}>
          <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>😔</span>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 900, color: 'var(--lila-dark)', marginBottom: 12 }}>
            Hay cambios en tu carrito
          </h2>
          <p style={{ color: 'var(--gris)', marginBottom: 24 }}>
            Algunos productos cambiaron su disponibilidad mientras tenías el carrito abierto:
          </p>
          <div style={{ background: 'var(--pink-bg)', border: '2px solid var(--pink)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, textAlign: 'left' }}>
            {problemas.map((p, i) => (
              <div key={i} style={{ marginBottom: i < problemas.length - 1 ? 10 : 0, fontSize: '0.9rem', color: 'var(--pink-dark)' }}>
                <strong>{p.nombre}{p.variante ? ` (${p.variante})` : ''}</strong>
                {p.disponible === 0 ? ' — Sin stock'
                  : ` — Solo quedan ${p.disponible} unidad${p.disponible > 1 ? 'es' : ''} (tenías ${p.pedido})`}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-carrito-secondary" onClick={() => navigate('/carrito')}>Editar carrito</button>
            <button className="btn-checkout-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={() => navigate('/')}>Seguir comprando</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumenPedido({ carrito, total, paso, form }) {
  return (
    <div className="checkout-resumen-col">
      <div className="checkout-resumen">
        <h3 className="checkout-resumen-titulo">Resumen del pedido</h3>
        <div className="checkout-resumen-items">
          {carrito.map((item, i) => (
            <div key={i} className="checkout-resumen-item">
              <div className="checkout-resumen-item-info">
                <span className="checkout-resumen-item-nombre">{item.nombre}</span>
                {item.varianteSeleccionada && item.varianteSeleccionada !== 'Única' && (
                  <span className="checkout-resumen-variante">{item.varianteSeleccionada}</span>
                )}
                <span className="checkout-resumen-cant">x{item.cantidad}</span>
              </div>
              <span className="checkout-resumen-precio">${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
            </div>
          ))}
        </div>
        <div className="checkout-resumen-total">
          <span>Total</span>
          <span>${total.toLocaleString('es-AR')}</span>
        </div>
        <div className="checkout-resumen-envio">
          <span>Envío</span>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Se calcula por zona</span>
        </div>
      </div>

      {paso === 3 && (
        <div className="checkout-datos-resumen">
          <p className="checkout-datos-titulo">Envío a</p>
          <p>{form.nombre_comprador}</p>
          <p>{form.direccion}</p>
          <p>{form.ciudad}, {form.provincia} ({form.codigo_postal})</p>
          <p>{form.email_comprador}</p>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Checkout({ carrito, setCarrito }) {
  const navigate = useNavigate();
  const [paso, setPaso]       = useState(1); // 1: datos, 2: envío, 3: pago
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [verificandoStock, setVerificandoStock] = useState(true);
  const [problemasStock, setProblemasStock]     = useState([]);
  const [form, setForm] = useState({
    nombre_comprador: '', email_comprador: '', direccion: '',
    ciudad: '', provincia: '', codigo_postal: '', metodo_pago: '',
  });
  const [errores, setErrores] = useState({});

  // Envío
  const [envioOpciones, setEnvioOpciones] = useState(null);   // resultado de la API
  const [envioSeleccionado, setEnvioSeleccionado] = useState(null); // { transportista, nombre, precio }
  const [loadingEnvio, setLoadingEnvio] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const costoEnvio = envioSeleccionado ? envioSeleccionado.precio : 0;
  const total = subtotal + costoEnvio;

  // Verificar stock
  useEffect(() => {
    if (carrito.length === 0) { setVerificandoStock(false); return; }
    const verificar = async () => {
      try {
        const problemas = [];
        const idsUnicos = [...new Set(carrito.map(i => i.id))];
        await Promise.all(idsUnicos.map(async (idProd) => {
          const res = await fetch(`${API}/productos/${idProd}`);
          if (!res.ok) return;
          const prod = await res.json();
          carrito.filter(i => i.id === idProd).forEach(item => {
            const nombreVar = item.varianteSeleccionada || 'Única';
            const detalle = (prod.variantes_detalle || []).find(v => v.nombre === nombreVar);
            const stock = detalle ? Number(detalle.stock) : Number(prod.stock || 0);
            if (stock < item.cantidad) {
              problemas.push({ nombre: item.nombre, variante: nombreVar !== 'Única' ? nombreVar : null, pedido: item.cantidad, disponible: stock });
            }
          });
        }));
        setProblemasStock(problemas);
      } catch (e) { console.error('Error verificando stock:', e); }
      finally { setVerificandoStock(false); }
    };
    verificar();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: '' });
  };

  const calcularEnvio = async () => {
    setLoadingEnvio(true);
    setErrorEnvio('');
    setEnvioOpciones(null);
    setEnvioSeleccionado(null);
    try {
      const items = carrito.map(item => ({
        nombre: item.nombre,
        categorias: item.categorias || [],
        cantidad: item.cantidad,
      }));
      const res = await fetch(`${API}/envios/calcular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoPostal: form.codigo_postal, items }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorEnvio(data.error || 'Error calculando envío'); return; }
      setEnvioOpciones(data);
    } catch { setErrorEnvio('Error de conexión. Intentá de nuevo.'); }
    finally { setLoadingEnvio(false); }
  };

  const validarPaso1 = () => {
    const e = {};
    if (!form.nombre_comprador.trim()) e.nombre_comprador = 'Ingresá tu nombre';
    if (!form.email_comprador.trim() || !/\S+@\S+\.\S+/.test(form.email_comprador)) e.email_comprador = 'Email inválido';
    if (!form.direccion.trim()) e.direccion = 'Ingresá tu dirección';
    if (!form.ciudad.trim()) e.ciudad = 'Ingresá tu ciudad';
    if (!form.provincia) e.provincia = 'Seleccioná tu provincia';
    if (!form.codigo_postal.trim()) e.codigo_postal = 'Ingresá el código postal';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirmar = async () => {
    if (!form.metodo_pago) { setErrores({ metodo_pago: 'Seleccioná un método de pago' }); return; }
    setLoading(true); setError('');
    try {
      const items = carrito.map(item => ({
        id_variante: item.idVariante, cantidad: item.cantidad,
        precio_unitario: item.precio, nombre_producto: item.nombre,
        nombre_variante: item.varianteSeleccionada || 'Única',
      }));
      const res = await fetch(`${API}/checkout/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items,
          envio: envioSeleccionado ? {
            transportista: envioSeleccionado.transportista,
            modalidad: envioSeleccionado.nombre,
            costo: envioSeleccionado.precio,
          } : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Hubo un error al procesar tu pedido'); return; }
      setCarrito([]);
      if (form.metodo_pago === 'mercadopago') {
        window.location.href = data.mp_sandbox_init_point || data.mp_init_point;
      } else {
        navigate(`/compra-exitosa?id=${data.id_venta}&metodo=transferencia`);
      }
    } catch { setError('Error de conexión. Intentá de nuevo.'); }
    finally { setLoading(false); }
  };

  // Estados especiales
  if (carrito.length === 0) return (
    <div className="checkout-vacio">
      <div className="checkout-vacio-inner">
        <span className="checkout-vacio-emoji">🛍️</span>
        <h2>Tu carrito está vacío</h2>
        <p>Agregá productos antes de continuar</p>
        <button className="btn-checkout-volver" onClick={() => navigate('/')}>Ver productos</button>
      </div>
    </div>
  );
  if (verificandoStock) return <Spinner texto="Verificando disponibilidad..." />;
  if (problemasStock.length > 0) return <ProblemasStock problemas={problemasStock} navigate={navigate} />;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <div className="carrito-header" style={{ justifyContent: 'center' }}>
            <h1 className="carrito-titulo">Finaliza tu compra</h1>
          </div>
          <div className="checkout-steps">
            {[{ n: 1, label: 'Datos de envío' }, { n: 2, label: 'Envío' }, { n: 3, label: 'Pago' }].map((s, i) => (
              <React.Fragment key={s.n}>
                {i > 0 && <div className="step-line" />}
                <div className={`checkout-step ${paso >= s.n ? 'active' : ''}`}>
                  <span className="step-num">{s.n}</span>
                  <span className="step-label">{s.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="checkout-body">
          {/* Columna izquierda */}
          <div className="checkout-form-col">
            {paso === 1 && (
              <div className="checkout-card">
                <h2 className="checkout-card-titulo">Datos de envío</h2>
                {[
                  { name: 'nombre_comprador', label: 'Nombre completo *', placeholder: 'Ej: María García', type: 'text' },
                  { name: 'email_comprador',  label: 'Email *', placeholder: 'Ej: maria@gmail.com', type: 'email' },
                  { name: 'direccion',        label: 'Dirección *', placeholder: 'Ej: Av. Corrientes 1234, Piso 2 Dpto A', type: 'text' },
                ].map(f => (
                  <div key={f.name} className="form-group">
                    <label>{f.label}</label>
                    <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                      placeholder={f.placeholder} className={errores[f.name] ? 'input-error' : ''} />
                    {errores[f.name] && <span className="form-error">{errores[f.name]}</span>}
                  </div>
                ))}

                <div className="form-row">
                  {[
                    { name: 'ciudad', label: 'Ciudad *', placeholder: 'Ej: Buenos Aires' },
                    { name: 'codigo_postal', label: 'Código postal *', placeholder: 'Ej: 1043' },
                  ].map(f => (
                    <div key={f.name} className="form-group">
                      <label>{f.label}</label>
                      <input type="text" name={f.name} value={form[f.name]} onChange={handleChange}
                        placeholder={f.placeholder} className={errores[f.name] ? 'input-error' : ''} />
                      {errores[f.name] && <span className="form-error">{errores[f.name]}</span>}
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label>Provincia *</label>
                  <select name="provincia" value={form.provincia} onChange={handleChange}
                    className={errores.provincia ? 'input-error' : ''}>
                    <option value="">Seleccioná tu provincia</option>
                    {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errores.provincia && <span className="form-error">{errores.provincia}</span>}
                </div>

                <button className="btn-checkout-primary" onClick={async () => {
                  if (validarPaso1()) { setPaso(2); await calcularEnvio(); }
                }}>
                  Continuar →
                </button>
              </div>
            )}

            {paso === 2 && (
              <div className="checkout-card">
                <button className="btn-checkout-volver-paso" onClick={() => setPaso(1)}>← Volver</button>
                <h2 className="checkout-card-titulo">Elegí cómo recibís tu pedido</h2>

                {loadingEnvio && (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div className="detalle-spinner" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--gris)', fontSize: '0.9rem' }}>Calculando opciones de envío...</p>
                  </div>
                )}

                {errorEnvio && !loadingEnvio && (
                  <>
                    <div className="checkout-error" style={{ marginBottom: 16 }}>
                      {errorEnvio}
                      <button onClick={calcularEnvio} style={{ marginLeft: 12, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        Reintentar
                      </button>
                    </div>
                    <div style={{ background: 'var(--lila-bg)', border: '2px solid var(--lila)', borderRadius: 12, padding: 16, fontSize: '0.88rem', color: 'var(--lila-dark)' }}>
                      <strong>Sin conexión con los transportistas.</strong> Podés continuar igual — el costo de envío se coordinará con la compradora.
                      <button
                        className="btn-checkout-primary"
                        style={{ marginTop: 12, width: '100%' }}
                        onClick={() => { setEnvioSeleccionado({ id: 'manual', transportista: 'A coordinar', nombre: 'A coordinar', precio: 0 }); setPaso(3); }}
                      >
                        Continuar de todas formas →
                      </button>
                    </div>
                  </>
                )}

                {envioOpciones && !loadingEnvio && (
                  <>
                    {envioOpciones.transportistas.mercadoEnvios.disponible ? (
                      <div className="pago-opciones">
                        {envioOpciones.transportistas.mercadoEnvios.opciones.map((op, i) => (
                          <label key={i} className={`pago-opcion ${envioSeleccionado?.id === `me-${i}` ? 'selected' : ''}`}>
                            <input type="radio" name="envio" onChange={() => setEnvioSeleccionado({ id: `me-${i}`, transportista: 'Mercado Envíos', nombre: op.nombre, precio: op.precio })} />
                            <div className="pago-opcion-content">
                              <span className="pago-opcion-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                              </span>
                              <div>
                                <strong>{op.nombre}</strong>
                                <p>{op.dias ? `${op.dias} días hábiles` : 'Tiempo según destino'}</p>
                              </div>
                              <span style={{ marginLeft: 'auto', fontFamily: 'Nunito', fontWeight: 900, color: 'var(--lila-dark)' }}>
                                ${op.precio.toLocaleString('es-AR')}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="checkout-error" style={{ marginBottom: 16 }}>
                        {envioOpciones.transportistas.mercadoEnvios.error || 'No hay opciones de envío disponibles para ese código postal.'}
                      </div>
                    )}
                  </>
                )}

                {envioSeleccionado && (
                  <button className="btn-checkout-primary" onClick={() => setPaso(3)}>
                    Continuar →
                  </button>
                )}
              </div>
            )}

            {paso === 3 && (
              <div className="checkout-card">
                <button className="btn-checkout-volver-paso" onClick={() => setPaso(2)}>← Volver</button>
                <h2 className="checkout-card-titulo">Método de pago</h2>

                <div className="pago-opciones">
                  {[
                    { value: 'mercadopago', icon: 'mp', titulo: 'MercadoPago', desc: 'Tarjeta de crédito, débito o saldo MP' },
                    { value: 'transferencia', icon: 'bank', titulo: 'Transferencia bancaria', desc: 'Te enviamos los datos por email' },
                  ].map(op => (
                    <label key={op.value} className={`pago-opcion ${form.metodo_pago === op.value ? 'selected' : ''}`}>
                      <input type="radio" name="metodo_pago" value={op.value}
                        checked={form.metodo_pago === op.value} onChange={handleChange} />
                      <div className="pago-opcion-content">
                        <span className="pago-opcion-icon">
                          {op.icon === 'mp'
                            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                            : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                          }
                        </span>
                        <div><strong>{op.titulo}</strong><p>{op.desc}</p></div>
                      </div>
                    </label>
                  ))}
                </div>

                {errores.metodo_pago && <span className="form-error">{errores.metodo_pago}</span>}
                {form.metodo_pago === 'transferencia' && (
                  <div className="transferencia-aviso">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{marginRight:8,verticalAlign:'middle',flexShrink:0}}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Recibirás los datos bancarios en tu email. Confirmamos tu pedido cuando acreditemos el pago.
                  </div>
                )}
                {error && <div className="checkout-error">{error}</div>}

                <button className="btn-checkout-primary" onClick={handleConfirmar} disabled={loading}>
                  {loading ? 'Procesando...'
                    : form.metodo_pago === 'mercadopago' ? 'Pagar con MercadoPago'
                    : 'Confirmar pedido'}
                </button>
              </div>
            )}
          </div>

          {/* Columna derecha */}
          <ResumenPedido carrito={carrito} total={total} paso={paso} form={form} />
        </div>
      </div>
    </div>
  );
}