const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// TEST DE CONEXIÓN Y MIGRACIONES
async function inicializarDB() {
  try {
    const conn = await db.getConnection();
    console.log("✅ Conectado a la base de datos de Lody Arte");

    // Verificar si la columna imagen_url existe en variantes
    const [cols] = await conn.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'variantes' 
        AND COLUMN_NAME = 'imagen_url'
    `);
    if (cols[0].count === 0) {
      await conn.query(`ALTER TABLE variantes ADD COLUMN imagen_url VARCHAR(255) DEFAULT NULL`);
      console.log("✅ Columna 'imagen_url' agregada a tabla 'variantes'");
    }

    // Verificar si la columna precio existe en variantes
    const [colsPrecio] = await conn.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'variantes' 
        AND COLUMN_NAME = 'precio'
    `);
    if (colsPrecio[0].count === 0) {
      await conn.query(`ALTER TABLE variantes ADD COLUMN precio DECIMAL(10,2) DEFAULT NULL`);
      console.log("✅ Columna 'precio' agregada a tabla 'variantes'");
    }

    conn.release();
  } catch (err) {
    console.error("❌ Error de conexión/migración a la DB:", err.message);
  }
}

inicializarDB();

module.exports = db;