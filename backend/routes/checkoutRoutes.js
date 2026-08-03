// backend/routes/checkoutRoutes.js
const express = require('express');
const router = express.Router();
const {
  iniciarCheckout,
  mpWebhook,
  confirmarTransferencia,
  cargarSeguimiento,
  getEstadoVenta,
} = require('../controllers/checkoutController');
const verifyToken = require('../middleware/authMiddleware');

// Públicas
router.post('/iniciar', iniciarCheckout);
router.post('/mp-webhook', mpWebhook);
router.get('/venta/:idVenta', getEstadoVenta);

// Admin
router.patch('/confirmar-transferencia/:idVenta', verifyToken, confirmarTransferencia);
router.patch('/ventas/:idVenta/seguimiento', verifyToken, cargarSeguimiento);

// Listar ventas (admin)
router.get('/ventas', verifyToken, async (req, res) => {
  try {
    const db = require('../config/db');
    const [ventas] = await db.query('SELECT * FROM ventas ORDER BY creado_en DESC');
    res.json(ventas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

module.exports = router;