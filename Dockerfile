# Multi-stage build for production
FROM composer:2 as composer

# Stage 1: Install dependencies
FROM php:8.3-fpm-alpine as vendor

# Install system dependencies
RUN apk add --no-cache \
    $PHPIZE_DEPS \
    nginx \
    supervisor \
    mysql-client \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    mysqli \
    zip \
    gd \
    exif \
    pcntl \
    bcmath

# Copy composer files
WORKDIR /var/www
COPY composer.json composer.lock ./

# Install Composer dependencies
COPY --from=composer /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --no-scripts --no-autoloader --optimize-autoloader \
    && rm -rf /root/.composer

# Copy source code
COPY . .

# Build optimized autoloader
RUN composer dump-autoloader --optimize --classmap-authoritative

# Stage 2: Production runtime
FROM php:8.3-fpm-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    mysql-client \
    curl \
    libpng \
    libjpeg-turbo \
    freetype \
    libzip \
    zip \
    supervisor

# Copy PHP extensions
COPY --from=vendor /usr/local/lib/php/extensions /usr/local/lib/php/extensions
COPY --from=vendor /var/www/vendor /var/www/vendor

# Copy application
WORKDIR /var/www/html
COPY --from=vendor /var/www .

# Copy nginx config
COPY ./docker/nginx/nginx.conf /etc/nginx/http.d/default.conf
COPY ./docker/nginx/nginx-site.conf /etc/nginx/conf.d/default.conf

# Copy supervisord config
COPY ./docker/supervisord/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage

# Laravel optimizations
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan queue:table \
    && php artisan migrate --force

# Expose port 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]