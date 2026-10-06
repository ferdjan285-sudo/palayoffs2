FROM vercel/php:8.2

# Install PostgreSQL client libraries and enable PDO extensions
RUN apt-get update && \
    apt-get install -y libpq-dev && \
    docker-php-ext-install pdo_pgsql pgsql && \
    rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . /app
WORKDIR /app

# Ensure the entrypoint is the Vercel PHP handler (api/index.php)
# Vercel will invoke the PHP runtime automatically; no further configuration needed.
