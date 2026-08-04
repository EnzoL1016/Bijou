FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN chmod +x docker-entrypoint.sh

# Carpeta de imágenes subidas por el panel admin (montada como volumen compartido con el frontend)
RUN mkdir -p /app/uploads_publicos

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "index.js"]
