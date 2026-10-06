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
$usePgsql = false;

if (($databaseUrl || $dbConnection === 'pgsql') && $hasPgsqlDriver) {
    try {
        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $port = getenv('DB_PORT') ?: '5432';
        $db = getenv('DB_DATABASE') ?: 'postgres';
        $user = getenv('DB_USERNAME') ?: 'postgres';
        $pass = getenv('DB_PASSWORD') ?: '';

        if ($databaseUrl) {
            $parsed = parse_url($databaseUrl);
            if (!empty($parsed['host'])) $host = $parsed['host'];
            if (!empty($parsed['port'])) $port = (string)$parsed['port'];
            if (!empty($parsed['user'])) $user = urldecode($parsed['user']);
            if (!empty($parsed['pass'])) $pass = urldecode($parsed['pass']);
            if (!empty($parsed['path'])) $db = ltrim($parsed['path'], '/');
        }

        $dsn = "pgsql:host={$host};port={$port};dbname={$db};sslmode=require";
        $testPdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 3,
            PDO::ATTR_EMULATE_PREPARES => true,
        ]);
        $testPdo->query('SELECT 1');
        $usePgsql = true;

        putenv('DB_CONNECTION=pgsql');
        $_ENV['DB_CONNECTION'] = 'pgsql';
        $_SERVER['DB_CONNECTION'] = 'pgsql';
        putenv("DB_HOST={$host}");
        $_ENV['DB_HOST'] = $host;
        $_SERVER['DB_HOST'] = $host;
        putenv("DB_PORT={$port}");
        $_ENV['DB_PORT'] = (string)$port;
        $_SERVER['DB_PORT'] = (string)$port;
        putenv("DB_DATABASE={$db}");
        $_ENV['DB_DATABASE'] = $db;
        $_SERVER['DB_DATABASE'] = $db;
        putenv("DB_USERNAME={$user}");
        $_ENV['DB_USERNAME'] = $user;
        $_SERVER['DB_USERNAME'] = $user;
        putenv("DB_PASSWORD={$pass}");
        $_ENV['DB_PASSWORD'] = $pass;
        $_SERVER['DB_PASSWORD'] = $pass;
        putenv('DB_SSLMODE=require');
        $_ENV['DB_SSLMODE'] = 'require';
        $_SERVER['DB_SSLMODE'] = 'require';
    } catch (\Throwable $e) {
        error_log("PostgreSQL connection probe failed, falling back to SQLite: " . $e->getMessage());
        $usePgsql = false;
    }
}

if (!$usePgsql) {
    putenv('DB_CONNECTION=sqlite');
    $_ENV['DB_CONNECTION'] = 'sqlite';
    $_SERVER['DB_CONNECTION'] = 'sqlite';
    putenv('DATABASE_URL=');
    $_ENV['DATABASE_URL'] = '';
    $_SERVER['DB_DATABASE'] = '';

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
if (empty($_SERVER['HTTP_AUTHORIZATION'])) {
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['HTTP_X_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['HTTP_X_AUTHORIZATION'];
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $k => $v) {
            if (strcasecmp($k, 'authorization') === 0 || strcasecmp($k, 'x-authorization') === 0) {
                $_SERVER['HTTP_AUTHORIZATION'] = $v;
                break;
            }
        }
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        foreach ($headers as $k => $v) {
            if (strcasecmp($k, 'authorization') === 0 || strcasecmp($k, 'x-authorization') === 0) {
                $_SERVER['HTTP_AUTHORIZATION'] = $v;
                break;
            }
        }
    }
}

require __DIR__ . '/../public/index.php';
