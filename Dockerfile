# Usar imagen base de Node.js
FROM node:18-alpine as build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar el código fuente
COPY . .

# Establecer la variable de entorno para Vite en tiempo de construcción
ARG VITE_URL_API=http://localhost:1337
ENV VITE_URL_API=$VITE_URL_API

# Construir la aplicación
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar archivos construidos desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
