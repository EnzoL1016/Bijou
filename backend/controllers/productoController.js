const db = require('../config/db');

// Helper: parsear imágenes
function parsearImagenes(imagen_url) {
  try {
    return typeof imagen_url === 'string' ? JSON.parse(imagen_url) : (imagen_url || []);
  } catch (e) { return []; }
}

// Helper: armar variantes normalizadas
function normalizarVariantes(variantes, stock) {
  if (Array.isArray(variantes) && variantes.length > 0) {
    if (typeof variantes[0] === 'object') return variantes;
    const stockPorVariante = Math.floor((stock || 0) / variantes.length);
    return variantes.map(nombre => ({ nombre, stock: stockPorVariante }));
  }
  return [{ nombre: 'Única', stock: stock || 0 }];
}

// Helper: adjuntar categorías a productos
async function adjuntarCategorias(productos, conn) {
  const c = conn || db;
  if (productos.length === 0) return productos;
  const ids = productos.map(p => p.id);
  const [cats] = await c.query(`
    SELECT pc.id_producto, c.id, c.nombre
    FROM producto_categorias pc
    JOIN categorias c ON c.id = pc.id_categoria
    WHERE pc.id_producto IN (?)
  `, [ids]);
  return productos.map(p => ({
    ...p,
    categorias: cats.filter(c => c.id_producto === p.id).map(c => ({ id: c.id, nombre: c.nombre })),
  }));
}

// ─────────────────────────────────────────────
// 1. OBTENER TODOS LOS PRODUCTOS
// ─────────────────────────────────────────────
exports.obtenerProductos = async (req, res) => {
  try {
    const { categoria } = req.query; // /productos?categoria=pulseras

    let query = `
      SELECT DISTINCT p.id, p.nombre, p.descripcion, p.material, p.precio, p.imagen_url
      FROM productos p
    `;
    const params = [];

    if (categoria) {
      query += `
        JOIN producto_categorias pc ON pc.id_producto = p.id
        JOIN categorias c ON c.id = pc.id_categoria
        WHERE p.activo = 1 AND LOWER(c.nombre) = LOWER(?)
        ORDER BY p.id DESC
      `;
      params.push(categoria);
    } else {
      query += `WHERE p.activo = 1 ORDER BY p.id DESC`;
    }

    const [productos] = await db.query(query, params);
    if (productos.length === 0) return res.json([]);

    const ids = productos.map(p => p.id);
    const [variantes] = await db.query(`
      SELECT id, id_producto, nombre, stock
      FROM variantes
      WHERE id_producto IN (?) AND activo = 1
      ORDER BY id
    `, [ids]);

    let resultado = productos.map(p => {
      const varsDelProducto = variantes.filter(v => v.id_producto === p.id);
      const imagenes = parsearImagenes(p.imagen_url);
      return {
        id: p.id, nombre: p.nombre, descripcion: p.descripcion,
        material: p.material, precio: p.precio,
        imagen_url: imagenes,
        imagenes: Array.isArray(imagenes) ? imagenes : [imagenes],
        stock: varsDelProducto.reduce((sum, v) => sum + v.stock, 0),
        variantes: varsDelProducto.map(v => v.nombre),
        variantes_detalle: varsDelProducto,
        categorias: [],
      };
    });

    resultado = await adjuntarCategorias(resultado);
    res.json(resultado);
  } catch (error) {
    console.error('❌ Error en obtenerProductos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// ─────────────────────────────────────────────
// 2. OBTENER UN PRODUCTO POR ID
// ─────────────────────────────────────────────
exports.obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT id, nombre, descripcion, material, precio, imagen_url
      FROM productos WHERE id = ? AND activo = 1
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    const p = rows[0];
    const [variantes] = await db.query(`
      SELECT id, nombre, stock FROM variantes
      WHERE id_producto = ? AND activo = 1 ORDER BY id
    `, [id]);

    const imagenes = parsearImagenes(p.imagen_url);

    const [cats] = await db.query(`
      SELECT c.id, c.nombre FROM producto_categorias pc
      JOIN categorias c ON c.id = pc.id_categoria
      WHERE pc.id_producto = ?
    `, [id]);

    res.json({
      id: p.id, nombre: p.nombre, descripcion: p.descripcion,
      material: p.material, precio: p.precio,
      imagen_url: imagenes,
      imagenes: Array.isArray(imagenes) ? imagenes : [imagenes],
      stock: variantes.reduce((sum, v) => sum + v.stock, 0),
      variantes: variantes.map(v => v.nombre),
      variantes_detalle: variantes,
      categorias: cats,
    });
  } catch (error) {
    console.error('❌ Error en obtenerProductoPorId:', error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

// ─────────────────────────────────────────────
// 3. CREAR PRODUCTO
// ─────────────────────────────────────────────
exports.crearProducto = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { nombre, descripcion, material, precio, imagenes, variantes, stock, categorias } = req.body;

    let arrayImagenes = Array.isArray(imagenes) ? imagenes
      : (typeof imagenes === 'string' && imagenes.trim() ? imagenes.split(',').map(i => i.trim()) : []);

    const [result] = await conn.query(`
      INSERT INTO productos (nombre, descripcion, material, precio, imagen_url)
      VALUES (?, ?, ?, ?, ?)
    `, [nombre, descripcion, material || null, precio, JSON.stringify(arrayImagenes)]);

    const idProducto = result.insertId;

    const arrayVariantes = normalizarVariantes(variantes, stock);
    for (const v of arrayVariantes) {
      await conn.query(`INSERT INTO variantes (id_producto, nombre, stock) VALUES (?, ?, ?)`,
        [idProducto, v.nombre, v.stock || 0]);
    }

    // Asignar categorías
    if (Array.isArray(categorias) && categorias.length > 0) {
      for (const idCat of categorias) {
        await conn.query(`INSERT IGNORE INTO producto_categorias (id_producto, id_categoria) VALUES (?, ?)`,
          [idProducto, idCat]);
      }
    }

    await conn.commit();
    res.status(201).json({ message: '¡Producto creado exitosamente!', id: idProducto });
  } catch (error) {
    await conn.rollback();
    console.error('❌ Error en crearProducto:', error);
    res.status(500).json({ error: 'No se pudo guardar el producto' });
  } finally {
    conn.release();
  }
};

// ─────────────────────────────────────────────
// 4. EDITAR PRODUCTO
// ─────────────────────────────────────────────
exports.editarProducto = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { id } = req.params;
    const { nombre, descripcion, material, precio, imagenes, variantes, stock, categorias } = req.body;

    let arrayImagenes = Array.isArray(imagenes) ? imagenes
      : (typeof imagenes === 'string' && imagenes.trim() ? imagenes.split(',').map(i => i.trim()) : []);

    const [result] = await conn.query(`
      UPDATE productos SET nombre=?, descripcion=?, material=?, precio=?, imagen_url=? WHERE id=?
    `, [nombre, descripcion, material || null, precio, JSON.stringify(arrayImagenes), id]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (variantes !== undefined) {
      await conn.query(`UPDATE variantes SET activo = 0 WHERE id_producto = ?`, [id]);
      const arrayVariantes = normalizarVariantes(variantes, stock);
      for (const v of arrayVariantes) {
        await conn.query(`INSERT INTO variantes (id_producto, nombre, stock) VALUES (?, ?, ?)`,
          [id, v.nombre, v.stock || 0]);
      }
    }

    // Actualizar categorías
    if (Array.isArray(categorias)) {
      await conn.query(`DELETE FROM producto_categorias WHERE id_producto = ?`, [id]);
      for (const idCat of categorias) {
        await conn.query(`INSERT IGNORE INTO producto_categorias (id_producto, id_categoria) VALUES (?, ?)`,
          [id, idCat]);
      }
    }

    await conn.commit();
    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    await conn.rollback();
    console.error('❌ Error en editarProducto:', error);
    res.status(500).json({ error: 'No se pudo actualizar el producto' });
  } finally {
    conn.release();
  }
};

// ─────────────────────────────────────────────
// 5. ELIMINAR PRODUCTO (soft delete)
// ─────────────────────────────────────────────
exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(`UPDATE productos SET activo = 0 WHERE id = ?`, [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error en eliminarProducto:', error);
    res.status(500).json({ error: 'No se pudo eliminar el producto' });
  }
};

// ─────────────────────────────────────────────
// 6. ACTUALIZAR STOCK DE UNA VARIANTE
// ─────────────────────────────────────────────
exports.actualizarStockVariante = async (req, res) => {
  try {
    const { idVariante } = req.params;
    const { stock } = req.body;
    if (stock === undefined || stock < 0) return res.status(400).json({ error: 'Stock inválido' });
    const [result] = await db.query(`UPDATE variantes SET stock = ? WHERE id = ?`, [stock, idVariante]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Variante no encontrada' });
    res.json({ message: 'Stock actualizado', stock });
  } catch (error) {
    console.error('❌ Error en actualizarStockVariante:', error);
    res.status(500).json({ error: 'No se pudo actualizar el stock' });
  }
};

// ─────────────────────────────────────────────
// 7. OBTENER TODAS LAS CATEGORÍAS
//    GET /productos/categorias
// ─────────────────────────────────────────────
exports.obtenerCategorias = async (req, res) => {
  try {
    const [cats] = await db.query(`SELECT id, nombre FROM categorias ORDER BY nombre ASC`);
    res.json(cats);
  } catch (error) {
    console.error('❌ Error en obtenerCategorias:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// ─────────────────────────────────────────────
// 8. CREAR CATEGORÍA
//    POST /productos/categorias
//    Body: { nombre }
// ─────────────────────────────────────────────
exports.crearCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido' });
    const [result] = await db.query(`INSERT IGNORE INTO categorias (nombre) VALUES (?)`, [nombre.trim()]);
    res.status(201).json({ id: result.insertId, nombre: nombre.trim() });
  } catch (error) {
    console.error('❌ Error en crearCategoria:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

// ─────────────────────────────────────────────
// 9. ELIMINAR CATEGORÍA
//    DELETE /productos/categorias/:id
// ─────────────────────────────────────────────
exports.eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM categorias WHERE id = ?`, [id]);
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('❌ Error en eliminarCategoria:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};

// ─────────────────────────────────────────────
// 10. REGISTRAR VENTA (legacy)
// ─────────────────────────────────────────────
exports.registrarVenta = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { nombre_comprador, email_comprador, codigo_postal, items } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: 'El carrito está vacío' });
    const total = items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
    const [ventaResult] = await conn.query(`
      INSERT INTO ventas (total, nombre_comprador, email_comprador, codigo_postal)
      VALUES (?, ?, ?, ?)
    `, [total, nombre_comprador || null, email_comprador || null, codigo_postal || null]);
    const idVenta = ventaResult.insertId;
    for (const item of items) {
      const subtotal = item.precio_unitario * item.cantidad;
      await conn.query(`
        INSERT INTO detalle_ventas (id_venta, id_variante, nombre_producto, nombre_variante, precio_unitario, cantidad, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [idVenta, item.id_variante, item.nombre_producto, item.nombre_variante, item.precio_unitario, item.cantidad, subtotal]);
      await conn.query(`UPDATE variantes SET stock = GREATEST(0, stock - ?) WHERE id = ?`, [item.cantidad, item.id_variante]);
    }
    await conn.commit();
    res.status(201).json({ message: 'Venta registrada', id_venta: idVenta, total });
  } catch (error) {
    await conn.rollback();
    console.error('❌ Error en registrarVenta:', error);
    res.status(500).json({ error: 'No se pudo registrar la venta' });
  } finally {
    conn.release();
  }
};