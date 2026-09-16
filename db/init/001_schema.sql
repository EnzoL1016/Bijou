-- Schema initialization for Lody Arte (Bijou)
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  imagen_url VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  material VARCHAR(100),
  precio DECIMAL(10,2) NOT NULL,
  imagen_url TEXT,
  activo TINYINT(1) DEFAULT 1,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS variantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_producto INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  stock INT DEFAULT 0,
  imagen_url VARCHAR(255) DEFAULT NULL,
  precio DECIMAL(10,2) DEFAULT NULL,
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS producto_categorias (
  id_producto INT NOT NULL,
  id_categoria INT NOT NULL,
  PRIMARY KEY (id_producto, id_categoria),
  FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total DECIMAL(10,2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  nombre_comprador VARCHAR(255),
  telefono_comprador VARCHAR(50),
  email_comprador VARCHAR(255),
  codigo_postal VARCHAR(20),
  direccion VARCHAR(255),
  ciudad VARCHAR(100),
  provincia VARCHAR(100),
  metodo_pago VARCHAR(50),
  estado_pago VARCHAR(50) DEFAULT 'pendiente',
  id_pago_mp VARCHAR(255),
  numero_seguimiento VARCHAR(255),
  transportista VARCHAR(100),
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS detalle_ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT NOT NULL,
  id_variante INT,
  nombre_producto VARCHAR(255),
  nombre_variante VARCHAR(100),
  precio_unitario DECIMAL(10,2),
  cantidad INT,
  subtotal DECIMAL(10,2),
  FOREIGN KEY (id_venta) REFERENCES ventas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categorías por defecto si no existen
INSERT IGNORE INTO categorias (id, nombre) VALUES
(1, 'Pulseras'),
(2, 'Collares'),
(3, 'Aros'),
(4, 'Tobilleras');
