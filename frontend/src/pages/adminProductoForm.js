import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

function AdminProductoForm({ productoEditar, onGuardado, onCancelar }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', material: '', precio: '' });
  const [variantes, setVariantes] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [archivosNuevos, setArchivosNuevos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Categorías
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]); // array de ids
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [modalEliminarCat, setModalEliminarCat] = useState(null);

  // Colecciones y Atributos Especiales
  const [coleccionesDisponibles, setColeccionesDisponibles] = useState([]);
  const [idColeccion, setIdColeccion] = useState('');
  const [nuevaColeccion, setNuevaColeccion] = useState('');
  const [mostrarNuevaCol, setMostrarNuevaCol] = useState(false);

  const [esPorMayor, setEsPorMayor] = useState(false);
  const [esNovedad, setEsNovedad] = useState(false);
  const [esPersonalizado, setEsPersonalizado] = useState(false);
  const [tipoBordado, setTipoBordado] = useState('');

  // Variantes vs Stock Simple
  const [tieneVariantes, setTieneVariantes] = useState(false);
  const [stockSimple, setStockSimple] = useState('0');

  // Cargar categorías y colecciones disponibles
  useEffect(() => {
    axios.get(`${API}/productos/categorias`)
      .then(res => setCategoriasDisponibles(res.data))
      .catch(() => {});
    axios.get(`${API}/productos/colecciones`)
      .then(res => setColeccionesDisponibles(res.data))
      .catch(() => {});
  }, []);

  // Precargar formulario si es edición
  useEffect(() => {
    if (productoEditar) {
      setForm({
        nombre: productoEditar.nombre || '',
        descripcion: productoEditar.descripcion || '',
        material: productoEditar.material || '',
        precio: productoEditar.precio || '',
      });

      setIdColeccion(productoEditar.id_coleccion ? String(productoEditar.id_coleccion) : '');
      setEsPorMayor(Boolean(productoEditar.es_por_mayor));
      setEsNovedad(Boolean(productoEditar.es_novedad));
      setEsPersonalizado(Boolean(productoEditar.es_personalizado));
      setTipoBordado(productoEditar.tipo_bordado ? productoEditar.tipo_bordado.toLowerCase() : '');

      const detalle = productoEditar.variantes_detalle || [];
      const varsReales = detalle.filter(v => v.nombre !== 'Única');
      if (varsReales.length > 0) {
        setTieneVariantes(true);
        setStockSimple('0');
        setVariantes(varsReales.map(v => ({
          nombre: v.nombre,
          stock: String(v.stock),
          precio: (v.precio !== null && v.precio !== undefined && v.precio !== '' && !isNaN(Number(v.precio))) ? String(Number(v.precio)) : '',
          imagen_url: v.imagen_url || null,
          archivoNuevo: null,
          previewLocal: null
        })));
      } else {
        setTieneVariantes(false);
        setStockSimple(String(productoEditar.stock ?? (detalle[0]?.stock ?? 0)));
        setVariantes([{ nombre: '', stock: '', precio: '', imagen_url: null, archivoNuevo: null, previewLocal: null }]);
      }

      const imgs = Array.isArray(productoEditar.imagen_url)
        ? productoEditar.imagen_url : (productoEditar.imagenes || []);
      setImagenesExistentes(imgs);
      setPreviews(imgs.map(img => `/productos/${img}`));

      // Precargar categorías seleccionadas
      const cats = productoEditar.categorias || [];
      setCategoriasSeleccionadas(cats.map(c => c.id));
    } else {
      setIdColeccion('');
      setEsPorMayor(false);
      setEsNovedad(false);
      setEsPersonalizado(false);
      setTipoBordado('');
      setTieneVariantes(false);
      setStockSimple('0');
      setVariantes([{ nombre: '', stock: '', precio: '', imagen_url: null, archivoNuevo: null, previewLocal: null }]);
    }
  }, [productoEditar]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Variantes ─────────────────────────────────────────────────────────────
  const agregarVariante = () => setVariantes([
    ...variantes,
    { nombre: '', stock: '', precio: '', imagen_url: null, archivoNuevo: null, previewLocal: null }
  ]);
  const actualizarVariante = (i, campo, valor) => {
    const nuevas = [...variantes];
    nuevas[i] = { ...nuevas[i], [campo]: valor };
    setVariantes(nuevas);
  };
  const handleFotoVariante = (i, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const nuevas = [...variantes];
    nuevas[i] = {
      ...nuevas[i],
      archivoNuevo: file,
      previewLocal: URL.createObjectURL(file),
      imagen_url: null,
    };
    setVariantes(nuevas);
  };
  const quitarFotoVariante = (i) => {
    const nuevas = [...variantes];
    nuevas[i] = {
      ...nuevas[i],
      archivoNuevo: null,
      previewLocal: null,
      imagen_url: null,
    };
    setVariantes(nuevas);
  };
  const eliminarVariante = (i) => {
    if (variantes.length === 1) return;
    setVariantes(variantes.filter((_, idx) => idx !== i));
  };

  // ── Categorías ────────────────────────────────────────────────────────────
  const toggleCategoria = (id) => {
    setCategoriasSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const crearYAgregarCategoria = async () => {
    if (!nuevaCategoria.trim()) return;
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.post(`${API}/productos/categorias`,
        { nombre: nuevaCategoria.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const nueva = res.data;
      setCategoriasDisponibles(prev => [...prev, nueva]);
      setCategoriasSeleccionadas(prev => [...prev, nueva.id]);
      setNuevaCategoria('');
    } catch (e) {
      console.error('Error creando categoría', e);
    }
  };

  const crearYAgregarColeccion = async () => {
    if (!nuevaColeccion.trim()) return;
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.post(`${API}/productos/colecciones`,
        { nombre: nuevaColeccion.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const nueva = res.data;
      setColeccionesDisponibles(prev => [...prev, nueva]);
      setIdColeccion(String(nueva.id));
      setNuevaColeccion('');
      setMostrarNuevaCol(false);
    } catch (e) {
      console.error('Error creando colección', e);
      alert(e.response?.data?.error || 'No se pudo crear la colección');
    }
  };

  const confirmarEliminarCategoria = async () => {
    if (!modalEliminarCat) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/productos/categorias/${modalEliminarCat.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategoriasDisponibles(prev => prev.filter(c => c.id !== modalEliminarCat.id));
      setCategoriasSeleccionadas(prev => prev.filter(id => id !== modalEliminarCat.id));
      setModalEliminarCat(null);
    } catch (err) {
      console.error('Error al eliminar categoría', err);
      alert('No se pudo eliminar la categoría.');
    }
  };

  // ── Imágenes Principales ──────────────────────────────────────────────────
  const handleImagenes = (e) => {
    const files = Array.from(e.target.files);
    setArchivosNuevos(files);
    setPreviews([
      ...imagenesExistentes.map(img => `/productos/${img}`),
      ...files.map(f => URL.createObjectURL(f)),
    ]);
  };

  const eliminarImagenExistente = (nombre) => {
    const actualizadas = imagenesExistentes.filter(img => img !== nombre);
    setImagenesExistentes(actualizadas);
    setPreviews([
      ...actualizadas.map(img => `/productos/${img}`),
      ...archivosNuevos.map(f => URL.createObjectURL(f)),
    ]);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Subir imágenes principales nuevas
      let nombresNuevos = [];
      if (archivosNuevos.length > 0) {
        const formData = new FormData();
        archivosNuevos.forEach(f => formData.append('imagenes', f));
        const uploadRes = await axios.post(`${API}/upload`, formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        });
        nombresNuevos = uploadRes.data.archivos;
      }

      const todasLasImagenes = [...imagenesExistentes, ...nombresNuevos];

      // 2. Subir imágenes individuales de variantes si tienen archivos nuevos
      const variantesProcesadas = await Promise.all(
        variantes.map(async (v) => {
          const precioVar = v.precio !== undefined && v.precio !== '' && v.precio !== null && !isNaN(Number(v.precio)) && Number(v.precio) > 0 ? Number(v.precio) : null;
          if (v.archivoNuevo) {
            const formDataVar = new FormData();
            formDataVar.append('imagenes', v.archivoNuevo);
            const uploadRes = await axios.post(`${API}/upload`, formDataVar, {
              headers: { ...headers, 'Content-Type': 'multipart/form-data' },
            });
            const archivoVar = uploadRes.data.archivos[0];
            return {
              nombre: v.nombre.trim(),
              stock: Number(v.stock) || 0,
              precio: precioVar,
              imagen_url: archivoVar,
            };
          }
          return {
            nombre: v.nombre.trim(),
            stock: Number(v.stock) || 0,
            precio: precioVar,
            imagen_url: v.imagen_url || null,
          };
        })
      );

      let variantesPayload = [];
      let stockTotal = 0;

      if (tieneVariantes) {
        variantesPayload = variantesProcesadas.filter(v => v.nombre.trim() !== '');
        stockTotal = variantesPayload.reduce((sum, v) => sum + v.stock, 0);
      } else {
        variantesPayload = [];
        stockTotal = Number(stockSimple) || 0;
      }

      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        material: form.material,
        precio: Number(form.precio),
        imagenes: todasLasImagenes,
        variantes: variantesPayload,
        categorias: categoriasSeleccionadas,
        stock: stockTotal,
        id_coleccion: idColeccion ? Number(idColeccion) : null,
        es_por_mayor: esPorMayor ? 1 : 0,
        es_novedad: esNovedad ? 1 : 0,
        es_personalizado: esPersonalizado ? 1 : 0,
        tipo_bordado: tipoBordado || null,
      };

      if (productoEditar) {
        await axios.put(`${API}/productos/${productoEditar.id}`, payload, { headers });
      } else {
        await axios.post(`${API}/productos`, payload, { headers });
      }

      onGuardado();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar el producto.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={estilos.overlay}>
      <div style={estilos.modal}>
        <h2 style={estilos.titulo}>{productoEditar ? 'Editar Producto' : 'Nuevo Producto'}</h2>

        <form onSubmit={handleSubmit}>
          {/* Datos básicos */}
          <div style={estilos.grid}>
            <div style={estilos.campo}>
              <label style={estilos.label}>Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} style={estilos.input} required />
            </div>
            <div style={estilos.campo}>
              <label style={estilos.label}>Material</label>
              <input name="material" value={form.material} onChange={handleChange} style={estilos.input} placeholder="Ej: Acero inoxidable" />
            </div>
            <div style={estilos.campo}>
              <label style={estilos.label}>Precio *</label>
              <input name="precio" type="number" value={form.precio} onChange={handleChange} style={estilos.input} required />
            </div>
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} style={estilos.textarea} />
          </div>

          {/* Categorías */}
          <div style={estilos.campo}>
            <label style={estilos.label}>
              Categorías <span style={estilos.hint}>(hacé clic para seleccionar; usá la cruz para borrar una categoría)</span>
            </label>
            <div style={estilos.categoriasWrap}>
              {categoriasDisponibles.map(cat => {
                const seleccionada = categoriasSeleccionadas.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: seleccionada ? '#0284c7' : '#f1f5f9',
                      border: seleccionada ? '1px solid #0284c7' : '1px solid #cbd5e1',
                      borderRadius: 999,
                      padding: '3px 8px 3px 14px',
                      gap: 6,
                    }}
                  >
                    <span
                      onClick={() => toggleCategoria(cat.id)}
                      style={{
                        cursor: 'pointer',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: seleccionada ? 'white' : '#334155',
                        userSelect: 'none',
                      }}
                    >
                      {cat.nombre}
                    </span>
                    <button
                      type="button"
                      title={`Eliminar categoría "${cat.nombre}"`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalEliminarCat(cat);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: seleccionada ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: 15,
                        fontWeight: 'bold',
                        padding: '0 4px',
                        lineHeight: 1,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = seleccionada ? 'rgba(255,255,255,0.7)' : '#94a3b8'}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
            {/* Crear nueva categoría inline */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input
                style={{ ...estilos.input, flex: 1, margin: 0 }}
                placeholder="Nueva categoría..."
                value={nuevaCategoria}
                onChange={e => setNuevaCategoria(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), crearYAgregarCategoria())}
              />
              <button type="button" onClick={crearYAgregarCategoria} style={estilos.btnAgregarVariante}>
                + Agregar
              </button>
            </div>
          </div>

          {/* Colección */}
          <div style={{ ...estilos.campo, background: '#f8fafc', padding: '16px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ ...estilos.label, margin: 0, color: '#1e293b' }}>
                📁 Colección <span style={estilos.hint}>(opcional)</span>
              </label>
              <button
                type="button"
                onClick={() => setMostrarNuevaCol(!mostrarNuevaCol)}
                style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700 }}
              >
                {mostrarNuevaCol ? '✕ Cancelar' : '+ Crear nueva colección'}
              </button>
            </div>

            {mostrarNuevaCol && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, marginTop: 6 }}>
                <input
                  style={{ ...estilos.input, flex: 1, margin: 0 }}
                  placeholder="Nombre de la nueva colección (ej: Verano 2026)..."
                  value={nuevaColeccion}
                  onChange={e => setNuevaColeccion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), crearYAgregarColeccion())}
                />
                <button type="button" onClick={crearYAgregarColeccion} style={estilos.btnAgregarVariante}>
                  + Guardar colección
                </button>
              </div>
            )}

            <select
              value={idColeccion}
              onChange={e => setIdColeccion(e.target.value)}
              style={estilos.input}
            >
              <option value="">Ninguna</option>
              {coleccionesDisponibles.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <span style={estilos.hint}>
              Si pertenece a una colección, se mostrará en el apartado Colecciones de la página.
            </span>
          </div>

          {/* Atributos Especiales de Navegación y Menú */}
          <div style={{ ...estilos.campo, background: '#f8fafc', padding: '16px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <label style={{ ...estilos.label, color: '#1e293b', marginBottom: 12 }}>
              🏷️ Atributos y Opciones de Menú
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {/* Packs por Mayor */}
              <div>
                <label style={estilos.label}>Packs por mayor</label>
                <select
                  value={esPorMayor ? 'si' : 'no'}
                  onChange={e => setEsPorMayor(e.target.value === 'si')}
                  style={estilos.input}
                >
                  <option value="no">Ninguna</option>
                  <option value="si">Packs por mayor (Sí)</option>
                </select>
                <span style={estilos.hint}>Aparece en "Packs por mayor".</span>
              </div>

              {/* Novedades */}
              <div>
                <label style={estilos.label}>Novedades</label>
                <select
                  value={esNovedad ? 'si' : 'no'}
                  onChange={e => setEsNovedad(e.target.value === 'si')}
                  style={estilos.input}
                >
                  <option value="no">Ninguna</option>
                  <option value="si">Novedades (Sí)</option>
                </select>
                <span style={estilos.hint}>Aparece en "Novedades".</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Bordado */}
              <div>
                <label style={estilos.label}>Bordado</label>
                <select
                  value={tipoBordado}
                  onChange={e => setTipoBordado(e.target.value)}
                  style={estilos.input}
                >
                  <option value="">Ninguno</option>
                  <option value="pins">Pins</option>
                  <option value="llaveros">Llaveros</option>
                  <option value="escarapelas">Escarapelas</option>
                  <option value="otro">Bordado general / Otro</option>
                </select>
                <span style={estilos.hint}>Aparece en "Bordados".</span>
              </div>

              {/* Personalizado */}
              <div>
                <label style={{ ...estilos.label, color: esPersonalizado ? '#dc2626' : '#555' }}>
                  Personalizado {esPersonalizado && '🔒'}
                </label>
                <select
                  value={esPersonalizado ? 'si' : 'no'}
                  onChange={e => setEsPersonalizado(e.target.value === 'si')}
                  style={{
                    ...estilos.input,
                    borderColor: esPersonalizado ? '#f87171' : '#ddd',
                    background: esPersonalizado ? '#fef2f2' : 'white',
                    color: esPersonalizado ? '#b91c1c' : '#333',
                    fontWeight: esPersonalizado ? 700 : 'normal'
                  }}
                >
                  <option value="no">Ninguna</option>
                  <option value="si">Personalizado (SOLO en Personalizado)</option>
                </select>
                <span style={{ ...estilos.hint, color: esPersonalizado ? '#dc2626' : '#999' }}>
                  {esPersonalizado ? '⚠️ Aparecerá SOLO en el apartado Personalizado.' : 'No es exclusivo de personalizado.'}
                </span>
              </div>
            </div>
          </div>

          {/* Selector de variantes o stock simple */}
          <div style={{ ...estilos.campo, background: '#f8fafc', padding: '14px 18px', borderRadius: 10, border: '1px solid #e2e8f0', marginTop: 14, marginBottom: 18 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 800, fontSize: '0.94rem', color: '#1e293b', margin: 0 }}>
              <input
                type="checkbox"
                checked={tieneVariantes}
                onChange={(e) => {
                  const check = e.target.checked;
                  setTieneVariantes(check);
                  if (check && variantes.every(v => !v.nombre.trim())) {
                    setVariantes([{ nombre: '', stock: stockSimple || '0', precio: '', imagen_url: null, archivoNuevo: null, previewLocal: null }]);
                  }
                }}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#0284c7' }}
              />
              <span>
                ¿Este producto tiene múltiples variantes?{' '}
                <span style={{ fontWeight: 'normal', color: '#64748b', fontSize: '0.84rem' }}>
                  (colores, talles, modelos con stock o precio propio)
                </span>
              </span>
            </label>
          </div>

          {!tieneVariantes ? (
            /* Stock para producto sin variantes */
            <div style={estilos.campo}>
              <label style={estilos.label}>
                Stock disponible *
                <span style={estilos.hint}> (unidades totales disponibles para la venta)</span>
              </label>
              <input
                type="number"
                min="0"
                value={stockSimple}
                onChange={e => setStockSimple(e.target.value)}
                style={{ ...estilos.input, maxWidth: 220 }}
                placeholder="Ej: 10"
                required={!tieneVariantes}
              />
            </div>
          ) : (
            /* Variantes con stock, precio diferenciado y fotos */
            <div style={estilos.campo}>
              <label style={estilos.label}>
                Variantes del producto
                <span style={estilos.hint}>
                  {` — precio por variante es opcional: si lo dejás vacío, usará el precio base ($${form.precio || 0})`}
                </span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                {variantes.map((v, i) => (
                  <div key={i} style={estilos.varianteFila}>
                    <input
                      style={{ ...estilos.input, flex: 2, margin: 0 }}
                      placeholder="Nombre variante (ej: Dorado, Talle M)"
                      value={v.nombre}
                      onChange={e => actualizarVariante(i, 'nombre', e.target.value)}
                      required={tieneVariantes}
                    />
                    <input
                      style={{ ...estilos.input, width: 85, flexShrink: 0, margin: 0 }}
                      type="number"
                      placeholder="Stock"
                      value={v.stock}
                      min="0"
                      onChange={e => actualizarVariante(i, 'stock', e.target.value)}
                      required={tieneVariantes}
                    />
                    <input
                      style={{ ...estilos.input, width: 140, flexShrink: 0, margin: 0 }}
                      type="number"
                      step="any"
                      placeholder={`$ (${form.precio || 'Base'})`}
                      title="Precio específico de esta variante (opcional)"
                      value={v.precio ?? ''}
                      min="0"
                      onChange={e => actualizarVariante(i, 'precio', e.target.value)}
                    />

                    {/* Foto de la variante */}
                    <div style={estilos.varianteFotoWrap}>
                      {v.previewLocal || v.imagen_url ? (
                        <div style={estilos.varianteThumbWrap}>
                          <img
                            src={v.previewLocal || `/productos/${v.imagen_url}`}
                            alt={v.nombre || 'Variante'}
                            style={estilos.varianteThumb}
                          />
                          <button
                            type="button"
                            title="Quitar foto de variante"
                            onClick={() => quitarFotoVariante(i)}
                            style={estilos.btnQuitarFotoVar}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label style={estilos.btnSubirFotoVar} title="Asignar foto a esta variante">
                          <span style={{ fontSize: 13, marginRight: 4 }}>📷</span>
                          <span style={{ fontSize: 11, fontWeight: 600 }}>Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => handleFotoVariante(i, e)}
                          />
                        </label>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => eliminarVariante(i)}
                      style={estilos.btnEliminarVariante}
                      disabled={variantes.length === 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={agregarVariante} style={estilos.btnAgregarVariante}>
                + Agregar variante
              </button>
            </div>
          )}

          {/* Imágenes Principales */}
          <div style={estilos.campo}>
            <label style={estilos.label}>Imágenes principales del producto</label>
            <input type="file" accept="image/*" multiple onChange={handleImagenes} style={{ marginBottom: 10 }} />
            {previews.length > 0 && (
              <div style={estilos.previews}>
                {imagenesExistentes.map((nombre) => (
                  <div key={nombre} style={estilos.previewItem}>
                    <img src={`/productos/${nombre}`} alt={nombre} style={estilos.previewImg} />
                    <button type="button" onClick={() => eliminarImagenExistente(nombre)} style={estilos.btnEliminarImg}>×</button>
                  </div>
                ))}
                {archivosNuevos.map((f, i) => (
                  <div key={i} style={estilos.previewItem}>
                    <img src={URL.createObjectURL(f)} alt={f.name} style={estilos.previewImg} />
                    <span style={estilos.tagNueva}>nueva</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p style={estilos.error}>{error}</p>}

          <div style={estilos.botones}>
            <button type="button" onClick={onCancelar} style={estilos.btnCancelar}>Cancelar</button>
            <button type="submit" style={estilos.btnGuardar} disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar producto'}
            </button>
          </div>
        </form>
      </div>

      {/* Popup de confirmación para eliminar categoría */}
      {modalEliminarCat && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000, backdropFilter: 'blur(3px)' }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: 14, maxWidth: 440, width: '92%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 10px', color: '#dc2626', fontSize: '1.2rem', fontWeight: 800 }}>
              ⚠️ ¿Eliminar categoría?
            </h3>
            <p style={{ margin: '0 0 14px', color: '#334155', fontSize: '0.94rem', lineHeight: 1.5 }}>
              ¿Estás seguro de que querés borrar la categoría <strong>"{modalEliminarCat.nombre}"</strong>?
            </p>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '0.84rem', background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              Esta acción eliminará la categoría de la base de datos y la desvinculará de todos los productos que la tengan asignada.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setModalEliminarCat(null)}
                style={{ padding: '9px 18px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminarCategoria}
                style={{ padding: '9px 18px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const estilos = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: 20, boxSizing: 'border-box' },
  modal: { background: 'white', borderRadius: 12, padding: 40, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' },
  titulo: { marginBottom: 25, color: '#333', fontSize: '1.4rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 },
  campo: { marginBottom: 18 },
  label: { display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: '0.9rem', color: '#555' },
  hint: { fontWeight: 'normal', color: '#999', fontSize: '0.8rem' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.92rem', boxSizing: 'border-box', outline: 'none' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.92rem', boxSizing: 'border-box', minHeight: 90, resize: 'vertical', outline: 'none' },
  categoriasWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  catBtn: { padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.15s' },
  varianteFila: { display: 'flex', gap: 8, alignItems: 'center' },
  varianteFotoWrap: { width: 68, flexShrink: 0, display: 'flex', justifyContent: 'center' },
  varianteThumbWrap: { position: 'relative', width: 38, height: 38 },
  varianteThumb: { width: 38, height: 38, objectFit: 'cover', borderRadius: 6, border: '1px solid #ccc' },
  btnQuitarFotoVar: { position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 },
  btnSubirFotoVar: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 36, padding: '0 8px', background: '#f8fafc', border: '1px dashed #94a3b8', borderRadius: 6, cursor: 'pointer', color: '#475569' },
  btnEliminarVariante: { width: 32, height: 32, flexShrink: 0, background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 16 },
  btnAgregarVariante: { padding: '7px 16px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  previews: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 },
  previewItem: { position: 'relative' },
  previewImg: { width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' },
  btnEliminarImg: { position: 'absolute', top: -8, right: -8, background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontWeight: 'bold', fontSize: 14, lineHeight: 1 },
  tagNueva: { position: 'absolute', bottom: 4, left: 4, background: '#27ae60', color: 'white', fontSize: '0.65rem', padding: '2px 5px', borderRadius: 4 },
  botones: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  btnCancelar: { padding: '10px 25px', borderRadius: 8, border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontSize: '0.95rem' },
  btnGuardar: { padding: '10px 25px', borderRadius: 8, border: 'none', background: '#333', color: 'white', cursor: 'pointer', fontSize: '0.95rem' },
  error: { color: '#e74c3c', fontSize: '0.85rem', marginBottom: 10 },
};

export default AdminProductoForm;