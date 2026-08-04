const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Carpeta destino de las imágenes
const UPLOADS_DIR = process.env.UPLOADS_DIR || '/app/uploads_publicos';

// Si la carpeta no existe, la crea automáticamente
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Nombre: timestamp + nombre original limpio (sin espacios)
    const nombreLimpio = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${nombreLimpio}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // máximo 5MB por imagen
});

// POST /upload — sube hasta 5 imágenes a la vez
router.post('/', upload.array('imagenes', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No se recibieron imágenes' });
  }
  const nombres = req.files.map(f => f.filename);
  res.json({ message: 'Imágenes subidas correctamente', archivos: nombres });
});

module.exports = router;