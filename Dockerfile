# ============================================================
# 🚀 FINAL DOCKERFILE — Laravel + React + PostgreSQL (Render)
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

# Enable OPcache
ENV PHP_OPCACHE_ENABLE=1 \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0 \
    PHP_OPCACHE_MAX_ACCELERATED_FILES=20000 \
    PHP_OPCACHE_MEMORY_CONSUMPTION=192 \
    PHP_OPCACHE_INTERNED_STRINGS_BUFFER=16 \
    PHP_OPCACHE_REVALIDATE_FREQ=0

WORKDIR /var/www/html

# Copy and install PHP deps
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Copy full app and built assets
COPY . .
COPY --from=frontend /app/public/build ./public/build

USER root

# Install Nginx, Brotli, Supervisor, Curl
RUN apt-get update && \
    apt-get install -y nginx brotli supervisor curl && \
    rm -rf /var/lib/apt/lists/*

# 🧩 Copy Nginx config to correct path (conf.d, not sites-enabled)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 🧩 Add Supervisor configuration
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

# Fix permissions
RUN mkdir -p storage bootstrap/cache storage/logs && \
    chmod -R 777 storage bootstrap/cache storage/logs && \
    chown -R www-data:www-data /var/www/html

USER www-data

# Healthcheck
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# ✅ Render expects this
EXPOSE 8080

CMD php artisan config:clear && \
    php artisan optimize:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force || true && \
    /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf