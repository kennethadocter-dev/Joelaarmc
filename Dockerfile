# ============================================================
# ✅ SIMPLE PRODUCTION DOCKERFILE — Laravel + React + PostgreSQL (Render)
# ============================================================

# Base image (no nginx)
FROM serversideup/php:8.3-fpm

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . .

# Switch to root for setup
USER root

# ✅ Enable OPcache for better performance
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini && \
    echo "opcache.enable_cli=1" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini && \
    echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini && \
    echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini && \
    echo "opcache.max_accelerated_files=20000" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini

# 🧩 Install Node.js & npm (for Vite/React build)
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && npm install -g npm@latest

# 🧩 Install PHP and JS dependencies
RUN composer install --no-dev --optimize-autoloader
RUN npm ci && npm run build

# 🧩 Ensure Laravel writable directories
RUN mkdir -p storage bootstrap/cache storage/logs && \
    chmod -R 777 storage bootstrap/cache storage/logs && \
    chown -R www-data:www-data /var/www/html

# Switch back to www-data
USER www-data

# Render looks for an open port
EXPOSE 10000

# ✅ Run Laravel’s built-in server (no nginx)
CMD php artisan config:clear && \
    php artisan optimize:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force || true && \
    php artisan serve --host=0.0.0.0 --port=10000