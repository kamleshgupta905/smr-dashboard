import pymysql
import time

conn = pymysql.connect(
    host='srv2215.hstgr.io',
    user='u839355029_vmhgropu',
    password='U839355029_vmhgroup',
    database='u839355029_vmh_group',
    autocommit=True
)
cur = conn.cursor()

php_code = r'''
$base = "/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool/public";

// 1. Ensure original Laravel index.php is backed up
if (!file_exists("$base/index.php.laravel_orig") && file_exists("$base/index.php")) {
    copy("$base/index.php", "$base/index.php.laravel_orig");
}

// 2. Write SMR Universal Router index.php
$router_code = '<?php
// SMR Universal Production Router for api.vmhgroupsmr.com
$uri = $_SERVER["REQUEST_URI"] ?? "/";
$path = parse_url($uri, PHP_URL_PATH);

// 1. Route API requests
if (str_starts_with($path, "/api") || $path === "/api" || $path === "/health") {
    require __DIR__ . "/api/index.php";
    exit;
}

// 2. Direct Redirects / Callbacks
if (str_starts_with($path, "/redirects") || str_starts_with($path, "/router")) {
    require __DIR__ . "/api/index.php";
    exit;
}

// 3. Serve static files if they exist
$file = __DIR__ . $path;
if ($path !== "/" && is_file($file)) {
    return false; // Let webserver serve static file
}

// 4. Default: Serve SMR Single Page App
if (file_exists(__DIR__ . "/index.html")) {
    header("Content-Type: text/html; charset=utf-8");
    readfile(__DIR__ . "/index.html");
    exit;
}
';

file_put_contents("$base/index.php", $router_code);

// 3. Update .htaccess with DirectoryIndex
$ht_code = '<IfModule mod_dir.c>
    DirectoryIndex index.html index.php
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Route API
    RewriteRule ^api/(.*)$ api/index.php?route=$1 [QSA,L]
    RewriteRule ^api$ api/index.php?route=api [QSA,L]
    RewriteRule ^health$ api/index.php?route=health [QSA,L]

    # Static files
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # SPA Fallback
    RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
</IfModule>
';

file_put_contents("$base/.htaccess", $ht_code);

if (function_exists('opcache_reset')) {
    @opcache_reset();
}

$p->prepare("UPDATE _tmp SET out_log = ? WHERE id = 1")->execute(["ROUTER_APPLIED_SUCCESS_" . date('c')]);
'''

cur.execute('REPLACE INTO _tmp (id, c, out_log) VALUES (1, %s, %s)', (php_code, 'WAITING'))
print("Universal router staged. Waiting for cron...")

for i in range(15):
    time.sleep(5)
    cur.execute('SELECT out_log FROM _tmp WHERE id = 1')
    out = cur.fetchone()[0]
    if out != 'WAITING':
        print("RESULT:", out)
        break

conn.close()
