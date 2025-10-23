# ============================================================
# 🚀 FINAL DOCKERFILE — Laravel + React + PostgreSQL (Render)
# ============================================================

# ---- Stage 1: Frontend Build (React + Vite) ----
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

# Copy Laravel app & built assets
COPY . .
COPY --from=frontend /app/public/build ./public/build

USER root

# Fix permissions
RUN mkdir -p storage bootstrap/cache storage/logs && \
    chmod -R 777 storage bootstrap/cache storage/logs && \
    chown -R www-data:www-data /var/www/html

USER www-data

# ✅ The serversideup image already runs PHP-FPM + Nginx on port 8080
EXPOSE 8080

# ✅ Run Laravel optimizations & migrations, then start the supervisor
CMD php artisan config:clear && \
    php artisan optimize:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force || true && \
    /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf