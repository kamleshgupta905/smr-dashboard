<?php
/**
 * Local Development Router for PHP Built-in Server
 * Simulates Hostinger LiteSpeed .htaccess routing
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Serve static assets directly if they exist
$distPath = __DIR__ . '/client/dist';
if ($uri !== '/' && file_exists($distPath . $uri) && !is_dir($distPath . $uri)) {
    return false;
}

// Route API requests directly to our PHP API Engine
if (str_starts_with($uri, '/api')) {
    $_GET['route'] = ltrim(substr($uri, 4), '/');
    require $distPath . '/api/index.php';
    exit;
}

// Route Traffic Router redirects
if (str_starts_with($uri, '/redirects') || str_starts_with($uri, '/vendor')) {
    $_GET['route'] = ltrim($uri, '/');
    require $distPath . '/api/index.php';
    exit;
}

// Default to React SPA
require $distPath . '/index.html';
