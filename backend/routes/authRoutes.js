const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// POST /auth/login
router.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (usuario !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign({ rol: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

module.exports = router;