const express = require('express');
const router = express.Router();
const envioController = require('../controllers/envioController');

// POST /envios/calcular
// Body: { codigoPostal, items: [{ nombre, categorias, cantidad }] }
router.post('/calcular', envioController.calcularEnvio);

module.exports = router;