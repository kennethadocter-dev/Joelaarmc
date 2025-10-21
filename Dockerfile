# ============================================================
# ✅ FIXED PRODUCTION DOCKERFILE — Render (Laravel + React)
# ============================================================

FROM serversideup/php:8.3-fpm-nginx

WORKDIR /var/www/html
COPY . .

USER root

# 🧩 Install Node.js & npm
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && npm install -g npm@latest

# 🧩 Install PHP dependencies & build React/Vite
RUN composer install --no-dev --optimize-autoloader
RUN npm install && npm run build

# 🧩 Fix permissions
RUN mkdir -p storage bootstrap/cache storage/logs && \
    chmod -R 777 storage bootstrap/cache && \
    chown -R www-data:www-data /var/www/html

# 🚫 Do NOT run artisan commands at build-time (they fail without DB)
# We'll run them automatically at runtime (CMD section)

USER www-data
EXPOSE 80

# ✅ CMD runs after Render injects environment variables
CMD php artisan key:generate --force || true && \
    php artisan migrate --force || true && \
    php artisan optimize:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php-fpm