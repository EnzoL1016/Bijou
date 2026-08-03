#!/bin/sh
set -e

UPLOADS_DIR="${UPLOADS_DIR:-/app/uploads_publicos}"
SEED_DIR="${SEED_DIR:-/app/seed-productos}"

mkdir -p "$UPLOADS_DIR"

if [ -z "$(ls -A "$UPLOADS_DIR" 2>/dev/null)" ]; then
  if [ -d "$SEED_DIR" ]; then
    echo "Copiando imágenes iniciales de seed..."
    cp -r "$SEED_DIR"/* "$UPLOADS_DIR"/ 2>/dev/null || true
    echo "Seed completado."
  else
    echo "No se encontró directorio de seed: $SEED_DIR"
  fi
else
  echo "El directorio de uploads no está vacío. Se omite el seed."
fi
