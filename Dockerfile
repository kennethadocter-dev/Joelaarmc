# ============================================================
# 🚀 FINAL PRODUCTION DOCKERFILE — Laravel + React + PostgreSQL
# ✅ Runs Nginx + PHP-FPM + Supervisor with full caching/compression
# ============================================================

# ---- Stage 1: Build frontend with Node ----
FROM node:20-alpine AS frontend
WORKDIR /app

# Cache dependencies
COPY package*.json vite.config.js ./
RUN npm install

# Copy and build frontend
COPY resources ./resources
RUN npm run build


# ---- Stage 2: Laravel runtime (PHP + Nginx + Supervisor) ----
FROM serversideup/php:8.3-fpm-nginx

# 🧩 Enable OPcache
ENV PHP_OPCACHE_ENABLE=1
ENV PHP_OPCACHE_VALIDATE_TIMESTAMPS=0
ENV PHP_OPCACHE_MAX_ACCELERATED_FILES=20000
ENV PHP_OPCACHE_MEMORY_CONSUMPTION=192
ENV PHP_OPCACHE_INTERNED_STRINGS_BUFFER=16
ENV PHP_OPCACHE_REVALIDATE_FREQ=0

WORKDIR /var/www/html

# Copy composer files first (cache vendor)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Copy entire Laravel app
COPY . .

# Copy built frontend assets
COPY --from=frontend /app/public/build ./public/build

USER root

# 🧩 Install nginx, brotli, supervisor, curl
RUN apt-get update && apt-get install -y nginx brotli supervisor curl && rm -rf /var/lib/apt/lists/*

# 🔧 Nginx configuration (with gzip + brotli + caching)
RUN cat <<'EOF' > /etc/nginx/sites-enabled/default.conf
server {
    listen 8080;
    root /var/www/html/public;
    index index.php index.html;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;
    gzip_vary on;
    gzip_proxied any;

    brotli on;
    brotli_static on;
    brotli_types text/plain text/css application/javascript application/json image/svg+xml;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi.conf;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# 🧩 Supervisor config (runs both PHP-FPM + Nginx)
RUN mkdir -p /etc/supervisor/conf.d && cat <<'EOF' > /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true

[program:php-fpm]
command=/usr/local/sbin/php-fpm -F
autostart=true
autorestart=true
priority=10

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
priority=20
EOF

# 🧩 Fix Laravel permissions
RUN mkdir -p storage bootstrap/cache storage/logs && \
    chmod -R 777 storage bootstrap/cache storage/logs && \
    chown -R www-data:www-data /var/www/html

USER www-data

# 🔍 HEALTHCHECK
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# ✅ Expose web port
EXPOSE 8080

# 🚀 Start both Nginx & PHP-FPM via Supervisor
CMD php artisan config:clear && \
    php artisan optimize:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force || true && \
    /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf