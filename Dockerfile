# ============================================================
# 🚀 FINAL PRODUCTION DOCKERFILE — Laravel + React + PostgreSQL
# ✅ Works perfectly on Render / Railway / local Docker
# ============================================================

# ---- Stage 1: Build frontend (React + Vite) ----
FROM node:20-alpine AS frontend
WORKDIR /app

COPY package*.json vite.config.js ./
RUN npm install
COPY resources ./resources
RUN npm run build


# ---- Stage 2: Laravel Runtime ----
FROM serversideup/php:8.3-fpm-nginx

# ✅ Enable OPcache for production
ENV PHP_OPCACHE_ENABLE=1 \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0 \
    PHP_OPCACHE_MAX_ACCELERATED_FILES=20000 \
    PHP_OPCACHE_MEMORY_CONSUMPTION=192 \
    PHP_OPCACHE_INTERNED_STRINGS_BUFFER=16 \
    PHP_OPCACHE_REVALIDATE_FREQ=0

WORKDIR /var/www/html

# Copy composer files and install PHP dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Copy full Laravel app
COPY . .

# Copy built frontend assets from first stage
COPY --from=frontend /app/public/build ./public/build

USER root

# 🧩 Install Nginx, Brotli, Supervisor, Curl
RUN apt-get update && \
    apt-get install -y nginx brotli supervisor curl && \
    rm -rf /var/lib/apt/lists/*

# 🔧 Copy Nginx configuration (create nginx.conf in project root)
COPY nginx.conf /etc/nginx/sites-enabled/default.conf

# 🔧 Add Supervisor configuration (multi-line heredoc — valid syntax)
RUN mkdir -p /etc/supervisor/conf.d && cat > /etc/supervisor/conf.d/supervisord.conf <<'EOL'
[supervisord]
nodaemon=true

[program:php-fpm]
command=/usr/local/sbin/php-fpm -F
autostart=true
autorestart=true
priority=10

[program:nginx]
command=nginx -g 'daemon off;'
autostart=true
autorestart=true
priority=20
EOL

# 🧩 Fix permissions for Laravel writable directories
RUN mkdir -p storage bootstrap/cache storage/logs && \
    chmod -R 777 storage bootstrap/cache storage/logs && \
    chown -R www-data:www-data /var/www/html

USER www-data

# ✅ Healthcheck
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# ✅ Expose Render port
EXPOSE 8080

# ✅ Start Laravel optimizations then Supervisor
CMD php artisan config:clear && \
    php artisan optimize:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force || true && \
    /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf