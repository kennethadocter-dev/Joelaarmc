# Use an official PHP + Nginx image with Composer & Node
FROM serversideup/php:8.3-fpm-nginx

# Set working directory
WORKDIR /var/www/html

# Copy everything to the container
COPY . .

# Prepare Laravel directories and permissions
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Build front-end assets
RUN npm install && npm run build

# Optimize Laravel
RUN php artisan key:generate && php artisan config:cache && php artisan route:cache && php artisan view:cache

# Expose port 80
EXPOSE 80

CMD ["start-container"]