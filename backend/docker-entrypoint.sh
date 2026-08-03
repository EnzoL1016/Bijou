#!/bin/sh
set -e

UPLOADS_DIR="${UPLOADS_DIR:-/app/uploads_publicos}"
SEED_DIR="${SEED_DIR:-/app/seed-productos}"

# Crear directorio de uploads si no existe
mkdir -p "$UPLOADS_DIR"

# Si la carpeta de uploads está vacía y existe la carpeta seed, copiar contenido inicial
if [ -z "$(ls -A "$UPLOADS_DIR" 2>/dev/null)" ]; then
  if [ -d "$SEED_DIR" ]; then
    echo "[Entrypoint] La carpeta de uploads está vacía. Copiando imágenes iniciales de seed..."
    cp -r "$SEED_DIR"/* "$UPLOADS_DIR"/ 2>/dev/null || true
    echo "[Entrypoint] Seeding finalizado con éxito."
  else
    echo "[Entrypoint] No se encontró el directorio de seed ($SEED_DIR)."
  fi
else
  echo "[Entrypoint] La carpeta de uploads ya contiene archivos. Se omite el seeding."
fi

# Ejecutar el comando original del contenedor
exec "$@"
