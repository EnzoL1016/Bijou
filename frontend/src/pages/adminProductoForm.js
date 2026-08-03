import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000';

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

  // Cargar categorías disponibles
  useEffect(() => {
    axios.get(`${API}/productos/categorias`)
      .then(res => setCategoriasDisponibles(res.data))
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

      const detalle = productoEditar.variantes_detalle || [];
      const varsReales = detalle.filter(v => v.nombre !== 'Única');
      setVariantes(varsReales.length > 0
        ? varsReales.map(v => ({ nombre: v.nombre, stock: String(v.stock) }))
        : [{ nombre: '', stock: String(productoEditar.stock || '') }]
      );

      const imgs = Array.isArray(productoEditar.imagen_url)
        ? productoEditar.imagen_url : (productoEditar.imagenes || []);
      setImagenesExistentes(imgs);
      setPreviews(imgs.map(img => `/productos/${img}`));

      // Precargar categorías seleccionadas
      const cats = productoEditar.categorias || [];
      setCategoriasSeleccionadas(cats.map(c => c.id));
    } else {
      setVariantes([{ nombre: '', stock: '' }]);
    }
  }, [productoEditar]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Variantes ─────────────────────────────────────────────────────────────
  const agregarVariante = () => setVariantes([...variantes, { nombre: '', stock: '' }]);
  const actualizarVariante = (i, campo, valor) => {
    const nuevas = [...variantes];
    nuevas[i] = { ...nuevas[i], [campo]: valor };
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

  // ── Imágenes ──────────────────────────────────────────────────────────────
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

      const unaFilaSinNombre = variantes.length === 1 && variantes[0].nombre.trim() === '';
      const variantesPayload = unaFilaSinNombre
        ? []
        : variantes.filter(v => v.nombre.trim() !== '').map(v => ({ nombre: v.nombre.trim(), stock: Number(v.stock) || 0 }));
      const stockTotal = unaFilaSinNombre ? Number(variantes[0].stock) || 0 : undefined;

      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        material: form.material,
        precio: Number(form.precio),
        imagenes: todasLasImagenes,
        variantes: variantesPayload,
        categorias: categoriasSeleccionadas,
        ...(stockTotal !== undefined && { stock: stockTotal }),
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

  const tienNombresVariantes = variantes.some(v => v.nombre.trim() !== '');

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
              Categorías <span style={estilos.hint}>(podés seleccionar varias)</span>
            </label>
            <div style={estilos.categoriasWrap}>
              {categoriasDisponibles.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategoria(cat.id)}
                  style={{
                    ...estilos.catBtn,
                    background: categoriasSeleccionadas.includes(cat.id) ? '#333' : '#f0f0f0',
                    color: categoriasSeleccionadas.includes(cat.id) ? 'white' : '#444',
                  }}
                >
                  {cat.nombre}
                </button>
              ))}
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

          {/* Variantes */}
          <div style={estilos.campo}>
            <label style={estilos.label}>
              Variantes y stock
              <span style={estilos.hint}>
                {tienNombresVariantes ? ' — cada variante tiene su propio stock' : ' — dejá el nombre vacío si no tiene variantes'}
              </span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
              {variantes.map((v, i) => (
                <div key={i} style={estilos.varianteFila}>
                  <input
                    style={{ ...estilos.input, flex: 2, margin: 0 }}
                    placeholder={tienNombresVariantes || v.nombre ? 'Nombre (ej: Rojo)' : 'Sin variantes — dejá vacío'}
                    value={v.nombre}
                    onChange={e => actualizarVariante(i, 'nombre', e.target.value)}
                  />
                  <input
                    style={{ ...estilos.input, flex: 1, margin: 0 }}
                    type="number" placeholder="Stock" value={v.stock} min="0"
                    onChange={e => actualizarVariante(i, 'stock', e.target.value)}
                  />
                  <button type="button" onClick={() => eliminarVariante(i)}
                    style={estilos.btnEliminarVariante} disabled={variantes.length === 1}>×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={agregarVariante} style={estilos.btnAgregarVariante}>
              + Agregar variante
            </button>
          </div>

          {/* Imágenes */}
          <div style={estilos.campo}>
            <label style={estilos.label}>Imágenes</label>
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