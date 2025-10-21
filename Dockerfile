# Use PHP + Nginx image optimized for Laravel
FROM serversideup/php:8.3-fpm-nginx

# Set working directory
WORKDIR /var/www/html

# Copy everything
COPY . .

# Switch to root to fix permissions safely
USER root

# Fix permissions manually (Render-safe)
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Build frontend assets
RUN npm install && npm run build

# Optimize Laravel setup
RUN php artisan key:generate --force || true \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Return to www-data user (for security)
USER www-data

# Expose HTTP port
EXPOSE 80

# Start the container
CMD ["php-fpm"]