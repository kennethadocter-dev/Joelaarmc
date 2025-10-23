# ============================================================
# ✅ PRODUCTION DOCKERFILE — Render (Laravel + React + PostgreSQL)
# ============================================================

FROM serversideup/php:8.3-fpm-nginx

# Set working directory
WORKDIR /var/www/html

# Copy everything into the container
COPY . .

# Switch to root for setup tasks
USER root

# 🧩 Install Node.js & npm (for Vite/React build)
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && npm install -g npm@latest

# 🧩 Install PHP dependencies and build frontend
RUN composer install --no-dev --optimize-autoloader
RUN npm install && npm run build

# 🧩 Fix permissions for Laravel writable directories
RUN mkdir -p storage bootstrap/cache storage/logs && \
    chmod -R 777 storage bootstrap/cache storage/logs && \
    chown -R www-data:www-data /var/www/html

# Switch back to web user
USER www-data

# ✅ Expose port 10000 so Render can detect the web server
EXPOSE 10000

# ✅ Start Laravel's built-in HTTP server
# Render will automatically inject env vars before this runs
CMD php artisan config:clear && \
    php artisan optimize:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force || true && \
    php artisan serve --host=0.0.0.0 --port=10000