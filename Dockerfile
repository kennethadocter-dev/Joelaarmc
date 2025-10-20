# 🐘 Laravel on PHP 8.3 + Nginx (Serversideup optimized image)
FROM serversideup/php:8.3-fpm-nginx

# Set working directory
WORKDIR /var/www/html

# Copy app files
COPY . .

# Install dependencies
# Prepare Laravel directories and permissions
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache \
    && composer install --no-dev --optimize-autoloader
RUN php artisan key:generate
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

EXPOSE 80
CMD ["php-fpm"]