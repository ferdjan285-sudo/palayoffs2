<?php

require dirname(__DIR__) . '/vendor/autoload.php';
$app = require_once dirname(__DIR__) . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$pdo = DB::getPdo();
$dbName = config('database.connections.mysql.database');

echo "Dumping database: $dbName\n";

$tables = [];
$res = $pdo->query("SHOW TABLES");
while ($row = $res->fetch(PDO::FETCH_NUM)) {
    $tables[] = $row[0];
}

$sql = "-- ========================================================\n";
$sql .= "-- PALAYOFFS ESPORTS TOURNAMENT SYSTEM DATABASE DUMP\n";
$sql .= "-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB, phpMyAdmin\n";
$sql .= "-- Database: `{$dbName}`\n";
$sql .= "-- Generated: " . date('Y-m-d H:i:s') . "\n";
$sql .= "-- ========================================================\n\n";

$sql .= "SET FOREIGN_KEY_CHECKS=0;\n";
$sql .= "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n";
$sql .= "SET time_zone = \"+00:00\";\n\n";

$sql .= "CREATE DATABASE IF NOT EXISTS `{$dbName}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n";
$sql .= "USE `{$dbName}`;\n\n";

foreach ($tables as $table) {
    $sql .= "-- --------------------------------------------------------\n";
    $sql .= "-- Table structure for table `{$table}`\n";
    $sql .= "-- --------------------------------------------------------\n\n";
    $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";

    $createRes = $pdo->query("SHOW CREATE TABLE `{$table}`")->fetch(PDO::FETCH_ASSOC);
    $sql .= $createRes['Create Table'] . ";\n\n";

    $rowsRes = $pdo->query("SELECT * FROM `{$table}`");
    $rows = $rowsRes->fetchAll(PDO::FETCH_ASSOC);

    if (count($rows) > 0) {
        $sql .= "-- Dumping data for table `{$table}`\n\n";
        $columns = array_keys($rows[0]);
        $colNames = implode('`, `', $columns);

        $sql .= "INSERT INTO `{$table}` (`{$colNames}`) VALUES\n";
        $valuesArr = [];
        foreach ($rows as $row) {
            $vals = [];
            foreach ($row as $val) {
                if ($val === null) {
                    $vals[] = "NULL";
                } else {
                    $vals[] = $pdo->quote($val);
                }
            }
            $valuesArr[] = "(" . implode(', ', $vals) . ")";
        }
        $sql .= implode(",\n", $valuesArr) . ";\n\n";
    }
}

$sql .= "SET FOREIGN_KEY_CHECKS=1;\n";

$rootDir = dirname(__DIR__);
file_put_contents($rootDir . '/palayoffs.sql', $sql);
file_put_contents($rootDir . '/database/palayoffs.sql', $sql);

echo "Successfully exported database to:\n";
echo "1. " . $rootDir . "/palayoffs.sql\n";
echo "2. " . $rootDir . "/database/palayoffs.sql\n";
echo "Total file size: " . strlen($sql) . " bytes\n";
