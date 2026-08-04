# Inicialización de MySQL

Poné acá adentro tu dump `.sql` (estructura de tablas: productos, variantes, categorias,
producto_categorias, ventas, detalle_ventas, etc). MySQL lo ejecuta automáticamente
la primera vez que el contenedor crea el volumen `mysql_data` vacío.

Ejemplo: `db/init/001_schema.sql`, `db/init/002_datos_iniciales.sql` (se ejecutan en orden alfabético).

Si no tenés el dump a mano, exportalo de tu base actual con:

    mysqldump -u root -p lody_arte > db/init/001_schema.sql
