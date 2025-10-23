# ============================================================
# ✅ FINAL PRODUCTION DOCKERFILE — Laravel + React + PostgreSQL (Render)
# ============================================================

FROM serversideup/php:8.3-fpm-nginx

WORKDIR /var/www/html

# Copy app source
COPY . .

USER root

# 🧩 Install Node.js & npm
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && npm install -g npm@latest

# 🧩 Install PHP & Node dependencies, then build assets
RUN composer install --no-dev --optimize-autoloader
RUN npm install && npm run build

# ✅ Ensure Vite manifest ends up directly in /public/build/
RUN if [ -f public/build/.vite/manifest.json ]; then \
      mv public/build/.vite/manifest.json public/build/manifest.json && \
      rm -rf public/build/.vite; \
    fi

# 🧩 Set correct permissions
RUN mkdir -p storage bootstrap/cache storage/logs && \
    chmod -R 777 storage bootstrap/cache storage/logs && \
    chown -R www-data:www-data /var/www/html

USER www-data

# ✅ Expose correct port for Render
EXPOSE 8080

# ✅ Run Laravel setup before Nginx/PHP startup
CMD php artisan config:clear && \
    php artisan optimize:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force || true && \
    /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf