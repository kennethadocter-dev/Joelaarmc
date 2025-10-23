# ============================================================
# ✅ PRODUCTION DOCKERFILE — Render (Laravel + React + PostgreSQL)
# ============================================================

FROM serversideup/php:8.3-fpm-nginx

# Set working directory
WORKDIR /var/www/html

# Copy everything
COPY . .

# Switch to root for setup
USER root

# 🧩 Install Node.js & npm
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && npm install -g npm@latest

# 🧩 Install PHP dependencies & build frontend
RUN composer install --no-dev --optimize-autoloader
RUN npm install && npm run build

# 🧩 Fix permissions
RUN mkdir -p storage bootstrap/cache storage/logs && \
    chmod -R 777 storage bootstrap/cache storage/logs && \
    chown -R www-data:www-data /var/www/html

# Switch back to web user
USER www-data

# ✅ Expose port 8080 for Render
EXPOSE 8080

# ✅ Let the image’s built-in supervisor handle Nginx/PHP-FPM
CMD php artisan config:clear && \
    php artisan optimize:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force || true && \
    php artisan serve --host=0.0.0.0 --port=8080