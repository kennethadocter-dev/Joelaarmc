# ============================================================
# 🚀 PRODUCTION DOCKERFILE — Laravel + React + PostgreSQL
# ⚙️ Includes: Node build, OPcache, gzip/brotli compression,
# static caching, healthcheck, and vendor/node caching
# ============================================================

# ---- Stage 1: Build frontend assets with Node ----
FROM node:20-alpine AS frontend

WORKDIR /app

# Copy package files (cache dependencies)
COPY package*.json vite.config.js ./

RUN npm install

# Copy frontend source and build
COPY resources ./resources
RUN npm run build


# ---- Stage 2: PHP + Laravel runtime ----
FROM serversideup/php:8.3-fpm-nginx

# Enable OPcache (for production performance)
ENV PHP_OPCACHE_ENABLE=1
ENV PHP_OPCACHE_VALIDATE_TIMESTAMPS=0
ENV PHP_OPCACHE_MAX_ACCELERATED_FILES=20000
ENV PHP_OPCACHE_MEMORY_CONSUMPTION=192
ENV PHP_OPCACHE_INTERNED_STRINGS_BUFFER=16
ENV PHP_OPCACHE_REVALIDATE_FREQ=0

WORKDIR /var/www/html

# Copy composer files and install dependencies (cache vendor)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Copy full Laravel app
COPY . .

# Copy built frontend assets
COPY --from=frontend /app/public/build ./public/build

USER root

# 🧩 Install compression utilities
RUN apt-get update && apt-get install -y nginx brotli && rm -rf /var/lib/apt/lists/*

# 🔧 Configure Nginx for static + compressed assets
RUN echo '\
server { \
    listen 8080; \
    root /var/www/html/public; \
    index index.php index.html; \
    \
    gzip on; \
    gzip_types text/plain text/css application/javascript application/json image/svg+xml; \
    gzip_min_length 1024; \
    gzip_vary on; \
    gzip_proxied any; \
    \
    brotli on; \
    brotli_static on; \
    brotli_types text/plain text/css application/javascript application/json image/svg+xml; \
    \
    location / { try_files $uri $uri/ /index.php?$query_string; } \
    \
    location ~ \.php$ { \
        include fastcgi_params; \
        fastcgi_pass unix:/var/run/php/php-fpm.sock; \
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \
        include fastcgi.conf; \
    } \
    \
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ { \
        expires 30d; \
        add_header Cache-Control "public, no-transform"; \
    } \
} \
' > /etc/nginx/sites-enabled/default.conf

# Fix permissions
RUN mkdir -p storage bootstrap/cache storage/logs && \
    chmod -R 777 storage bootstrap/cache storage/logs && \
    chown -R www-data:www-data /var/www/html

USER www-data

# 🔍 HEALTHCHECK: ensure Laravel responds
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:10000/ || exit 1

# Expose Render/Railway port
EXPOSE 10000

# 🚀 Start Laravel (Render injects environment vars)
CMD php artisan config:clear && \
    php artisan optimize:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force || true && \
    php artisan serve --host=0.0.0.0 --port=10000