<?php

/**
 * Vercel Serverless Function Entry Point for Laravel & React SPA
 */

// Initialize writable runtime directories in ephemeral /tmp
$runtimeDirs = [
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/cache/data',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/logs',
    '/tmp/bootstrap/cache',
];

foreach ($runtimeDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
}

// Set environment overrides for serverless runtime
putenv('VERCEL=1');
$_ENV['VERCEL'] = '1';
$_SERVER['VERCEL'] = '1';

putenv('APP_STORAGE=/tmp/storage');
putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');
putenv('APP_SERVICES_CACHE=/tmp/bootstrap/cache/services.php');
putenv('APP_PACKAGES_CACHE=/tmp/bootstrap/cache/packages.php');
putenv('APP_CONFIG_CACHE=/tmp/bootstrap/cache/config.php');
putenv('APP_ROUTES_CACHE=/tmp/bootstrap/cache/routes.php');
putenv('APP_EVENTS_CACHE=/tmp/bootstrap/cache/events.php');

// Ensure APP_KEY is set
if (!getenv('APP_KEY')) {
    $fallbackKey = 'base64:PMueLfYpTnf1z3aDOANZdXRq9AE8OYtLhP8i8bx6VkI=';
    putenv("APP_KEY={$fallbackKey}");
    $_ENV['APP_KEY'] = $fallbackKey;
    $_SERVER['APP_KEY'] = $fallbackKey;
}

// Ensure Database is configured
$databaseUrl = getenv('DATABASE_URL') ?: getenv('DB_URL');
$dbConnection = getenv('DB_CONNECTION');
$hasPgsqlDriver = extension_loaded('pdo_pgsql');

if (($databaseUrl || $dbConnection === 'pgsql') && $hasPgsqlDriver) {
    putenv('DB_CONNECTION=pgsql');
    $_ENV['DB_CONNECTION'] = 'pgsql';
    $_SERVER['DB_CONNECTION'] = 'pgsql';

    if ($databaseUrl) {
        $parsed = parse_url($databaseUrl);
        if ($parsed) {
            if (!empty($parsed['host'])) {
                putenv("DB_HOST={$parsed['host']}");
                $_ENV['DB_HOST'] = $parsed['host'];
                $_SERVER['DB_HOST'] = $parsed['host'];
            }
            if (!empty($parsed['port'])) {
                putenv("DB_PORT={$parsed['port']}");
                $_ENV['DB_PORT'] = (string)$parsed['port'];
                $_SERVER['DB_PORT'] = (string)$parsed['port'];
            }
            if (!empty($parsed['user'])) {
                $user = urldecode($parsed['user']);
                putenv("DB_USERNAME={$user}");
                $_ENV['DB_USERNAME'] = $user;
                $_SERVER['DB_USERNAME'] = $user;
            }
            if (!empty($parsed['pass'])) {
                $pass = urldecode($parsed['pass']);
                putenv("DB_PASSWORD={$pass}");
                $_ENV['DB_PASSWORD'] = $pass;
                $_SERVER['DB_PASSWORD'] = $pass;
            }
            if (!empty($parsed['path'])) {
                $dbName = ltrim($parsed['path'], '/');
                putenv("DB_DATABASE={$dbName}");
                $_ENV['DB_DATABASE'] = $dbName;
                $_SERVER['DB_DATABASE'] = $dbName;
            }
            putenv('DB_SSLMODE=require');
            $_ENV['DB_SSLMODE'] = 'require';
            $_SERVER['DB_SSLMODE'] = 'require';
        }
    }
} else {
    // Fallback to SQLite
    putenv('DB_CONNECTION=sqlite');
    $_ENV['DB_CONNECTION'] = 'sqlite';
    $_SERVER['DB_CONNECTION'] = 'sqlite';

    $tmpDb = '/tmp/database.sqlite';
    if (!file_exists($tmpDb) || filesize($tmpDb) === 0) {
        $sourceDb = __DIR__ . '/../database/database.sqlite';
        if (file_exists($sourceDb)) {
            @copy($sourceDb, $tmpDb);
        } else {
            @touch($tmpDb);
        }
    }
    putenv("DB_DATABASE={$tmpDb}");
    $_ENV['DB_DATABASE'] = $tmpDb;
    $_SERVER['DB_DATABASE'] = $tmpDb;
}

// Align server variables for correct URI and path resolution in Vercel
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/../public/index.php';
if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
    $_SERVER['HTTPS'] = 'on';
    $_SERVER['SERVER_PORT'] = 443;
}

// Ensure Authorization header is passed to PHP environment in FastCGI / Vercel
if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $headers['Authorization'];
        } elseif (isset($headers['authorization'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $headers['authorization'];
        }
    } elseif (isset($_SERVER['HTTP_X_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['HTTP_X_AUTHORIZATION'];
    }
}

require __DIR__ . '/../public/index.php';
