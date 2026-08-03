const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// TEST DE CONEXIÓN: Esto te dirá en la terminal si la DB está viva
db.getConnection()
  .then(() => console.log("✅ Conectado a la base de datos de Lody Arte"))
  .catch(err => console.error("❌ Error de conexión a la DB:", err.message));

module.exports = db;