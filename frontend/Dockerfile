# 1. AŞAMA: Derleme (Build)
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. AŞAMA: Yayınlama (Nginx)
FROM nginx:stable-alpine

# Build edilen dosyaları kopyala
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Nginx konfigürasyonu oluştur
RUN echo 'server { \
    listen 80; \
    server_name _; \
    \
    # React app \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # API Proxy - Backend'e yönlendir \
    location /api/ { \
        proxy_pass http://backend:5001; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_read_timeout 60s; \
        proxy_connect_timeout 60s; \
        proxy_send_timeout 60s; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]