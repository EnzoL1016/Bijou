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

function ResumenPedido({ carrito, total, paso, form, envioSeleccionado, sucursalCorreo }) {
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
          <span>Subtotal</span>
          <span>${total.toLocaleString('es-AR')}</span>
        </div>
        <div className="checkout-resumen-envio">
          <span>Envío</span>
          <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 700 }}>
            {envioSeleccionado
              ? (envioSeleccionado.id === 'retiro_villa_mercedes' ? 'Sin costo (Villa Mercedes)' : envioSeleccionado.nombre)
              : 'Seleccionar en el paso 2'}
          </span>
        </div>
      </div>

      {(paso === 3 || envioSeleccionado?.id === 'retiro_villa_mercedes') && form.nombre_comprador && (
        <div className="checkout-datos-resumen">
          <p className="checkout-datos-titulo">Datos del comprador</p>
          <p><strong>{form.nombre_comprador}</strong></p>
          {form.telefono_comprador && <p>📱 {form.telefono_comprador}</p>}
          <p>✉️ {form.email_comprador}</p>
          
          {envioSeleccionado?.id === 'correo_domicilio' && (
            <>
              <p style={{ marginTop: 8 }}>📍 <strong>Entrega en domicilio:</strong></p>
              <p>{form.direccion}</p>
              <p>{form.ciudad}, {form.provincia} ({form.codigo_postal})</p>
            </>
          )}

          {envioSeleccionado?.id === 'correo_sucursal' && (
            <>
              <p style={{ marginTop: 8 }}>🏢 <strong>Retiro en sucursal:</strong></p>
              <p>{sucursalCorreo || 'A especificar'}</p>
              <p>{form.ciudad}, {form.provincia} ({form.codigo_postal})</p>
            </>
          )}

          {envioSeleccionado?.id === 'retiro_villa_mercedes' && (
            <p style={{ marginTop: 8, color: 'var(--lila-dark)', fontWeight: 700 }}>
              📍 Retiro en persona por Villa Mercedes, San Luis
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Opciones de Envío ─────────────────────────────────────────────────────────

const OPCIONES_ENVIO = [
  {
    id: 'correo_domicilio',
    transportista: 'Correo Argentino',
    nombre: 'Correo Argentino - Entrega a domicilio',
    desc: 'PAQ. AR Clásico / Expreso con entrega en tu domicilio.',
    emoji: '🏡',
  },
  {
    id: 'correo_sucursal',
    transportista: 'Correo Argentino',
    nombre: 'Correo Argentino - Retiro en sucursal',
    desc: 'Retiro por la sucursal de Correo Argentino que elijas en tu localidad.',
    emoji: '🏢',
  },
  {
    id: 'retiro_villa_mercedes',
    transportista: 'Retiro en persona',
    nombre: 'Retiro en persona (Villa Mercedes, SL)',
    desc: 'Sin costo de envío. Acordamos retiro por domicilio o punto de encuentro. Abonás al recibir.',
    emoji: '📍',
  },
];

export default function Checkout({ carrito, setCarrito }) {
  const navigate = useNavigate();
  const [paso, setPaso]       = useState(1); // 1: datos, 2: envío, 3: pago
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [verificandoStock, setVerificandoStock] = useState(true);
  const [problemasStock, setProblemasStock]     = useState([]);
  const [form, setForm] = useState({
    nombre_comprador: '', telefono_comprador: '', email_comprador: '', direccion: '',
    ciudad: '', provincia: '', codigo_postal: '', metodo_pago: '',
  });
  const [sucursalCorreo, setSucursalCorreo] = useState('');
  const [errores, setErrores] = useState({});

  // Envío seleccionado
  const [envioSeleccionado, setEnvioSeleccionado] = useState(null);

  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const total = subtotal;

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
  }, [carrito]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: '' });
  };

  const validarPaso1 = () => {
    const e = {};
    if (!form.nombre_comprador.trim()) e.nombre_comprador = 'Ingresá tu nombre';
    if (!form.telefono_comprador.trim()) e.telefono_comprador = 'Ingresá tu número de teléfono / WhatsApp';
    if (!form.email_comprador.trim() || !/\S+@\S+\.\S+/.test(form.email_comprador)) e.email_comprador = 'Email inválido';
    if (!form.direccion.trim()) e.direccion = 'Ingresá tu dirección';
    if (!form.ciudad.trim()) e.ciudad = 'Ingresá tu ciudad';
    if (!form.provincia) e.provincia = 'Seleccioná tu provincia';
    if (!form.codigo_postal.trim()) e.codigo_postal = 'Ingresá el código postal';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirmarPedido = async (metodoPagoOverride = null) => {
    const metodoElegido = metodoPagoOverride || form.metodo_pago;
    if (!metodoElegido) {
      setErrores({ metodo_pago: 'Seleccioná cómo preferís abonar' });
      return;
    }

    setLoading(true);
    setError('');
    try {
      const items = carrito.map(item => ({
        id_variante: item.idVariante,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        nombre_producto: item.nombre,
        nombre_variante: item.varianteSeleccionada || 'Única',
      }));

      // Determinar detalles del envío
      let transportistaFinal = 'Correo Argentino';
      let direccionFinal = form.direccion;

      if (envioSeleccionado?.id === 'retiro_villa_mercedes') {
        transportistaFinal = 'Retiro en persona (Villa Mercedes)';
      } else if (envioSeleccionado?.id === 'correo_sucursal') {
        transportistaFinal = 'Correo Argentino - Retiro en sucursal';
        direccionFinal = `Sucursal Correo: ${sucursalCorreo} | Domicilio legal: ${form.direccion}`;
      } else if (envioSeleccionado?.id === 'correo_domicilio') {
        transportistaFinal = 'Correo Argentino - Entrega a domicilio';
      }

      const res = await fetch(`${API}/checkout/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          direccion: direccionFinal,
          metodo_pago: metodoElegido,
          items,
          transportista: transportistaFinal,
          sucursal_correo: sucursalCorreo,
          envio: {
            transportista: envioSeleccionado?.transportista || 'Correo Argentino',
            modalidad: transportistaFinal,
            sucursal: sucursalCorreo,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Hubo un error al procesar tu pedido');
        return;
      }

      // Limpiar carrito y redirigir directamente a la página de éxito
      setCarrito([]);
      navigate(`/compra-exitosa?id=${data.id_venta}&metodo=${metodoElegido}`);
    } catch {
      setError('Error de conexión al enviar el pedido. Por favor, intentá nuevamente.');
    } finally {
      setLoading(false);
    }
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
            <h1 className="carrito-titulo">Finalizá tu compra</h1>
          </div>
          <div className="checkout-steps">
            {[
              { n: 1, label: 'Datos de contacto' },
              { n: 2, label: 'Envío' },
              ...(envioSeleccionado?.id === 'retiro_villa_mercedes' ? [] : [{ n: 3, label: 'Pago' }]),
            ].map((s, i) => (
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
                <h2 className="checkout-card-titulo">Datos de contacto y entrega</h2>
                <p style={{ color: 'var(--gris)', fontSize: '0.88rem', marginBottom: 20 }}>
                  Completá tus datos para que podamos coordinar la confirmación y entrega de tu pedido.
                </p>

                {[
                  { name: 'nombre_comprador',   label: 'Nombre completo *', placeholder: 'Ej: María García', type: 'text' },
                  { name: 'telefono_comprador', label: 'Número de teléfono / WhatsApp *', placeholder: 'Ej: 2657 123456', type: 'tel' },
                  { name: 'email_comprador',    label: 'Email *', placeholder: 'Ej: maria@gmail.com', type: 'email' },
                  { name: 'direccion',          label: 'Dirección *', placeholder: 'Ej: Av. Mitre 1234, Piso 2 Dpto A', type: 'text' },
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
                    { name: 'ciudad', label: 'Ciudad *', placeholder: 'Ej: Villa Mercedes' },
                    { name: 'codigo_postal', label: 'Código postal *', placeholder: 'Ej: 5730' },
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

                <button className="btn-checkout-primary" onClick={() => {
                  if (validarPaso1()) { setPaso(2); }
                }}>
                  Continuar a Envío →
                </button>
              </div>
            )}

            {paso === 2 && (
              <div className="checkout-card">
                <button className="btn-checkout-volver-paso" onClick={() => setPaso(1)}>← Volver</button>
                <h2 className="checkout-card-titulo">Elegí la opción de envío</h2>
                <p style={{ color: 'var(--gris)', fontSize: '0.88rem', marginBottom: 20 }}>
                  Elegí si preferís recibirlo por Correo Argentino o coordinar retiro en Villa Mercedes:
                </p>

                <div className="pago-opciones" style={{ marginBottom: 20 }}>
                  {OPCIONES_ENVIO.map((op) => (
                    <label key={op.id} className={`pago-opcion ${envioSeleccionado?.id === op.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="opcion_envio"
                        value={op.id}
                        checked={envioSeleccionado?.id === op.id}
                        onChange={() => {
                          setEnvioSeleccionado(op);
                          setErrores({});
                        }}
                      />
                      <div className="pago-opcion-content">
                        <span className="pago-opcion-icon" style={{ fontSize: 22, display: 'flex', alignItems: 'center' }}>
                          {op.emoji}
                        </span>
                        <div>
                          <strong>{op.nombre}</strong>
                          <p>{op.desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Confirmación de dirección para Entrega a Domicilio */}
                {envioSeleccionado?.id === 'correo_domicilio' && (
                  <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 18 }}>📍</span>
                      <strong style={{ color: '#15803d', fontSize: '0.95rem' }}>Confirmá tu dirección de entrega:</strong>
                    </div>
                    <p style={{ margin: 0, color: '#374151', fontSize: '0.92rem', lineHeight: 1.5 }}>
                      <strong>{form.direccion}</strong>, {form.ciudad}, {form.provincia} (CP: {form.codigo_postal})
                    </p>
                    <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#166534' }}>
                      ¿Necesitás cambiarla? Podés volver al paso anterior para editar tus datos.
                    </p>
                  </div>
                )}

                {/* Pedido de datos de sucursal para Retiro en Sucursal */}
                {envioSeleccionado?.id === 'correo_sucursal' && (
                  <div style={{ background: 'var(--lila-bg)', border: '2px solid var(--lila)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
                    <label style={{ display: 'block', fontWeight: 800, color: 'var(--lila-dark)', marginBottom: 8, fontSize: '0.95rem' }}>
                      🏢 ¿A qué sucursal de Correo Argentino querés que llegue tu pedido? *
                    </label>
                    <input
                      type="text"
                      value={sucursalCorreo}
                      onChange={(e) => {
                        setSucursalCorreo(e.target.value);
                        setErrores({ ...errores, sucursal: '' });
                      }}
                      placeholder="Ej: Sucursal Villa Mercedes Centro, Av. Mitre 500 (o indicar tu barrio/localidad)"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: errores.sucursal ? '2px solid #e74c3c' : '2px solid #ddd',
                        fontSize: '0.92rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: '#fff',
                      }}
                    />
                    {errores.sucursal && <span className="form-error" style={{ marginTop: 6 }}>{errores.sucursal}</span>}
                    <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--gris)' }}>
                      Localidad de referencia: {form.ciudad}, {form.provincia} (CP: {form.codigo_postal}).
                    </p>
                  </div>
                )}

                {/* Mensaje especial para Retiro en persona */}
                {envioSeleccionado?.id === 'retiro_villa_mercedes' && (
                  <div style={{ background: 'var(--yellow-bg)', border: '2px solid var(--yellow)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
                    <strong style={{ color: 'var(--yellow-dark)', display: 'block', marginBottom: 6, fontSize: '0.95rem' }}>
                      📍 Retiro en Villa Mercedes
                    </strong>
                    <p style={{ margin: 0, color: 'var(--texto)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      Al confirmar el pedido, nos comunicamos con vos por WhatsApp para coordinar el día, horario y punto de entrega. ¡No tenés que abonar nada ahora, pagás al momento de retirar!
                    </p>
                  </div>
                )}

                {errores.envio && <span className="form-error" style={{ display: 'block', marginBottom: 16 }}>{errores.envio}</span>}
                {error && <div className="checkout-error" style={{ marginBottom: 16 }}>{error}</div>}

                {/* Botón según la opción seleccionada */}
                {envioSeleccionado?.id === 'retiro_villa_mercedes' ? (
                  <button
                    className="btn-checkout-primary"
                    onClick={() => handleConfirmarPedido('retiro_en_persona')}
                    disabled={loading}
                  >
                    {loading ? 'Procesando pedido...' : 'Confirmar pedido'}
                  </button>
                ) : (
                  <button
                    className="btn-checkout-primary"
                    onClick={() => {
                      if (!envioSeleccionado) {
                        setErrores({ envio: 'Seleccioná una opción de envío para continuar' });
                        return;
                      }
                      if (envioSeleccionado.id === 'correo_sucursal' && !sucursalCorreo.trim()) {
                        setErrores({ sucursal: 'Por favor, ingresá la sucursal de Correo Argentino o tu localidad de preferencia' });
                        return;
                      }
                      setErrores({});
                      setPaso(3);
                    }}
                  >
                    Continuar
                  </button>
                )}
              </div>
            )}

            {paso === 3 && (
              <div className="checkout-card">
                <button className="btn-checkout-volver-paso" onClick={() => setPaso(2)}>← Volver</button>
                <h2 className="checkout-card-titulo">Método de pago</h2>
                <p style={{ color: 'var(--gris)', fontSize: '0.88rem', marginBottom: 20 }}>
                  Elegí cómo preferís abonar. Al confirmar el pedido nos contactaremos con vos para enviarte el link o datos correspondientes:
                </p>

                <div className="pago-opciones">
                  {[
                    {
                      value: 'mercadopago',
                      icon: 'mp',
                      titulo: 'Mercado Pago',
                      desc: 'Te enviaremos el link de pago por WhatsApp o email para que abones con tarjeta de crédito, débito o dinero en cuenta.',
                    },
                    {
                      value: 'transferencia',
                      icon: 'bank',
                      titulo: 'Transferencia bancaria',
                      desc: 'Te enviaremos los datos bancarios (CBU / Alias) por WhatsApp o email para realizar la transferencia.',
                    },
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

                <div className="transferencia-aviso" style={{ marginTop: 18 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{marginRight:8,verticalAlign:'middle',flexShrink:0}}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Al hacer clic en <strong>Confirmar pedido</strong>, recibiremos tu solicitud y nos pondremos en contacto por WhatsApp o email con la confirmación de stock y el link o datos para abonar.
                </div>

                {error && <div className="checkout-error">{error}</div>}

                <button
                  className="btn-checkout-primary"
                  onClick={() => handleConfirmarPedido()}
                  disabled={loading}
                  style={{ marginTop: 24 }}
                >
                  {loading ? 'Procesando pedido...' : 'Confirmar pedido'}
                </button>
              </div>
            )}
          </div>

          {/* Columna derecha */}
          <ResumenPedido
            carrito={carrito}
            total={total}
            paso={paso}
            form={form}
            envioSeleccionado={envioSeleccionado}
            sucursalCorreo={sucursalCorreo}
          />
        </div>
      </div>
    </div>
  );
}