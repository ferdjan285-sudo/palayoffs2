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
$dbConnection = getenv('DB_CONNECTION');
if (!$dbConnection || $dbConnection === 'sqlite') {
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

require __DIR__ . '/../public/index.php';
