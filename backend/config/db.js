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

    // Crear tabla colecciones si no existe
    await conn.query(`
      CREATE TABLE IF NOT EXISTS colecciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Helper para verificar y agregar columnas a productos
    const columnasProductos = [
      { nombre: 'id_coleccion', def: 'INT DEFAULT NULL, ADD CONSTRAINT fk_producto_coleccion FOREIGN KEY (id_coleccion) REFERENCES colecciones(id) ON DELETE SET NULL' },
      { nombre: 'es_por_mayor', def: 'TINYINT(1) DEFAULT 0' },
      { nombre: 'es_novedad', def: 'TINYINT(1) DEFAULT 0' },
      { nombre: 'es_personalizado', def: 'TINYINT(1) DEFAULT 0' },
      { nombre: 'tipo_bordado', def: 'VARCHAR(50) DEFAULT NULL' },
    ];

    for (const col of columnasProductos) {
      const [colsProd] = await conn.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'productos' 
          AND COLUMN_NAME = ?
      `, [col.nombre]);
      if (colsProd[0].count === 0) {
        try {
          await conn.query(`ALTER TABLE productos ADD COLUMN ${col.nombre} ${col.def}`);
          console.log(`✅ Columna '${col.nombre}' agregada a tabla 'productos'`);
        } catch (e) {
          // Si falla la FK por sintaxis en versiones específicas, intentar sin FK explícita
          await conn.query(`ALTER TABLE productos ADD COLUMN ${col.nombre} ${col.def.split(',')[0]}`);
          console.log(`✅ Columna '${col.nombre}' agregada a tabla 'productos' (sin FK inline)`);
        }
      }
    }

    conn.release();
  } catch (err) {
    console.error("❌ Error de conexión/migración a la DB:", err.message);
  }
}

inicializarDB();

module.exports = db;