# ============================================================
# 🚀 PRODUCTION DOCKERFILE — Laravel + React + PostgreSQL (Render)
# ============================================================

FROM serversideup/php:8.3-fpm-nginx

# Set working directory
WORKDIR /var/www/html

# Copy all app files
COPY . .

# Switch to root for setup
USER root

# ✅ Install Node.js for building React/Vite assets
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && npm install -g npm@latest

# ✅ Install PHP + Composer dependencies
RUN composer install --no-dev --optimize-autoloader

# ✅ Build frontend (React/Vite)
RUN npm install && npm run build

# ✅ Set permissions so Laravel can write logs & cache safely
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/storage/logs && \
    chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache && \
    chown -R www-data:www-data /var/www/html

# ✅ Auto-create a production .env file (Render uses its own environment variables)
RUN echo "APP_NAME=Joelaar-MC" > .env && \
    echo "APP_ENV=production" >> .env && \
    echo "APP_KEY=" >> .env && \
    echo "APP_DEBUG=false" >> .env && \
    echo "APP_URL=\${APP_URL:-https://jmc-hk3m.onrender.com}" >> .env && \
    echo "ASSET_URL=\${APP_URL:-https://jmc-hk3m.onrender.com}" >> .env && \
    echo "LOG_CHANNEL=stack" >> .env && \
    echo "LOG_LEVEL=debug" >> .env && \
    echo "DB_CONNECTION=pgsql" >> .env && \
    echo "DB_HOST=\${DB_HOST}" >> .env && \
    echo "DB_PORT=\${DB_PORT}" >> .env && \
    echo "DB_DATABASE=\${DB_DATABASE}" >> .env && \
    echo "DB_USERNAME=\${DB_USERNAME}" >> .env && \
    echo "DB_PASSWORD=\${DB_PASSWORD}" >> .env && \
    echo "DB_SSLMODE=require" >> .env && \
    echo "SESSION_DRIVER=database" >> .env && \
    echo "CACHE_STORE=database" >> .env && \
    echo "QUEUE_CONNECTION=database" >> .env

# ✅ Generate key and optimize (ignore if already set)
RUN php artisan key:generate --force || true && \
    php artisan optimize:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache

# Switch back to www-data for security
USER www-data

# Expose default web port
EXPOSE 80

# ✅ Start Laravel + Nginx
CMD ["php-fpm"]