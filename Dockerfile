# ============================================================
# ✅ FINAL PRODUCTION DOCKERFILE — Laravel + React + PostgreSQL (Render)
# ============================================================

FROM serversideup/php:8.3-fpm-nginx

WORKDIR /var/www/html

# Copy everything
COPY . .

USER root

# 🧩 Install Node.js & npm
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && npm install -g npm@latest

# 🧩 Install dependencies and build assets
RUN composer install --no-dev --optimize-autoloader
RUN npm ci && npm run build

# 🧩 Ensure Laravel writable directories and ownership
RUN mkdir -p storage bootstrap/cache storage/logs && \
    chmod -R 777 storage bootstrap/cache storage/logs && \
    chown -R www-data:www-data /var/www/html

USER www-data

# ✅ Nginx inside this image listens on port 8080 by default
EXPOSE 8080

# ✅ Start Laravel setup, PHP-FPM & Nginx handled by image automatically
CMD php artisan config:clear && \
    php artisan optimize:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force || true && \
    php-fpm -D && nginx -g 'daemon off;'