FROM serversideup/php:8.3-fpm-nginx

WORKDIR /var/www/html

COPY . .

# Switch to root user to set permissions
USER root

# Prepare Laravel directories and permissions
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache \
    && composer install --no-dev --optimize-autoloader

# Switch back to non-root user for security
USER www-data

RUN php artisan key:generate
RUN php artisan config:cache

EXPOSE 80
CMD ["start-container"]