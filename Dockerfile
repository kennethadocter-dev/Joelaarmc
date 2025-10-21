# Use PHP + Nginx base image
FROM serversideup/php:8.3-fpm-nginx

# Set working directory
WORKDIR /var/www/html

# Copy everything into container
COPY . .

# Switch to root to install tools
USER root

# ✅ Install Node.js + npm (for React/Vite build)
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest && \
    node -v && npm -v

# ✅ Fix permissions (Render-safe)
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# ✅ Install dependencies & build assets
RUN composer install --no-dev --optimize-autoloader
RUN npm install && npm run build

# ✅ Optimize Laravel
RUN php artisan key:generate --force || true \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Switch back to web user
USER www-data

# Expose default port
EXPOSE 80

# Start PHP-FPM (Nginx handled by base image)
CMD ["php-fpm"]