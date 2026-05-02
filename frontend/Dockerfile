FROM nginx:alpine

# Limpiar contenido por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar todo tu frontend
COPY . /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]