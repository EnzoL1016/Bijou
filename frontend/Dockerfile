# --- Etapa 1: build de React ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Sourcemaps apagados en producción (menor tamaño de deploy)
ENV GENERATE_SOURCEMAP=false
# La app llama a /api/... y nginx lo redirige al backend (mismo origen, sin CORS)
ENV REACT_APP_API_URL=/api
RUN npm run build

# --- Etapa 2: servir con nginx ---
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
