const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const verificarAdmin = require('../middleware/authMiddleware');

// ── Categorías (van ANTES de /:id para no ser interceptadas) ────
router.get('/categorias',        productoController.obtenerCategorias);
router.post('/categorias',       verificarAdmin, productoController.crearCategoria);
router.delete('/categorias/:id', verificarAdmin, productoController.eliminarCategoria);

// ── Rutas públicas ───────────────────────────────────────────────
router.get('/',    productoController.obtenerProductos);   // acepta ?categoria=pulseras
router.get('/:id', productoController.obtenerProductoPorId);

// ── Rutas protegidas (solo admin) ────────────────────────────────
router.post('/',                             verificarAdmin, productoController.crearProducto);
router.put('/:id',                           verificarAdmin, productoController.editarProducto);
router.delete('/:id',                        verificarAdmin, productoController.eliminarProducto);
router.patch('/variantes/:idVariante/stock', verificarAdmin, productoController.actualizarStockVariante);

// ── Ventas (legacy) ──────────────────────────────────────────────
router.post('/ventas/registrar', productoController.registrarVenta);

module.exports = router;