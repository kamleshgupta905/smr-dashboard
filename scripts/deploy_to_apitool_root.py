import os
import pymysql
import base64
import time

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
dist_dir = os.path.join(project_root, "client", "dist")
target_base = "/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool"

files_to_deploy = {}

for root, dirs, files in os.walk(dist_dir):
    for f in files:
        if f.endswith(('.html', '.js', '.css', '.svg', '.png', '.php', '.htaccess')):
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, dist_dir).replace('\\', '/')
            remote_path = f"{target_base}/{rel_path}"
            files_to_deploy[remote_path] = full_path

api_php = os.path.join(project_root, "api", "index.php")
if os.path.exists(api_php):
    files_to_deploy[f"{target_base}/api/index.php"] = api_php

print(f"Staging {len(files_to_deploy)} files to deploy directly to {target_base}:")
for r, l in files_to_deploy.items():
    print(f"  {r} <- {os.path.basename(l)} ({os.path.getsize(l):,} bytes)")

db_host = os.environ.get("DB_HOST", "srv2215.hstgr.io")
db_user = os.environ.get("DB_USER", "u839355029_vmhgropu")
db_pass = os.environ.get("DB_PASS", "U839355029_vmhgroup")
db_name = os.environ.get("DB_NAME", "u839355029_vmh_group")

conn = pymysql.connect(
    host=db_host,
    user=db_user,
    password=db_pass,
    database=db_name,
    autocommit=True
)
cur = conn.cursor()

cur.execute("DROP TABLE IF EXISTS _deploy_tmp;")
cur.execute("CREATE TABLE _deploy_tmp (path VARCHAR(500) PRIMARY KEY, content LONGTEXT);")

for remote_path, local_path in files_to_deploy.items():
    with open(local_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    cur.execute("INSERT INTO _deploy_tmp (path, content) VALUES (%s, %s);", (remote_path, b64))

php_runner = r'''$pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=u839355029_vmh_group", "u839355029_vmhgropu", "U839355029_vmhgroup", [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

$base = "/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool";

// 1. Backup original Laravel index.php and .htaccess if not already done
if (file_exists("$base/index.php") && !file_exists("$base/index.php.laravel_orig")) {
    @copy("$base/index.php", "$base/index.php.laravel_orig");
}
if (file_exists("$base/.htaccess") && !file_exists("$base/.htaccess.laravel_orig")) {
    @copy("$base/.htaccess", "$base/.htaccess.laravel_orig");
}

// 2. Write staged SMR files (index.html, assets, logos, api/index.php, etc.)
$rows = $pdo->query("SELECT path, content FROM _deploy_tmp")->fetchAll(PDO::FETCH_ASSOC);
$log = "SMR Root Deployment started at " . date('c') . "\n";
$success_count = 0;

foreach ($rows as $r) {
    $dir = dirname($r['path']);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $bytes = file_put_contents($r['path'], base64_decode($r['content']));
    if ($bytes !== false) {
        $success_count++;
        $log .= "WROTE: " . $r['path'] . " (" . $bytes . " bytes)\n";
    } else {
        $log .= "ERROR WRITING: " . $r['path'] . "\n";
    }
}

// 3. Write Universal Router into $base/index.php
$router = '<?php
// SMR Universal Gateway Router for api.vmhgroupsmr.com
$uri = $_SERVER["REQUEST_URI"] ?? "/";
$path = parse_url($uri, PHP_URL_PATH);

// 1. Route API, Health, Callbacks, Vendor Entry, Survey Endpages to SMR PHP Engine
if (
    str_starts_with($path, "/api") || 
    $path === "/api" || 
    $path === "/health" || 
    str_starts_with($path, "/redirects") || 
    str_starts_with($path, "/router") ||
    str_starts_with($path, "/traffic") ||
    str_starts_with($path, "/vendor") ||
    str_starts_with($path, "/survey") ||
    str_starts_with($path, "/marketxcel") ||
    str_starts_with($path, "/clients")
) {
    require __DIR__ . "/api/index.php";
    exit;
}

// 2. Serve static files if exist
$file = __DIR__ . $path;
if ($path !== "/" && is_file($file)) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mimes = [
        "css"  => "text/css; charset=utf-8",
        "js"   => "application/javascript; charset=utf-8",
        "json" => "application/json",
        "png"  => "image/png",
        "jpg"  => "image/jpeg",
        "jpeg" => "image/jpeg",
        "gif"  => "image/gif",
        "svg"  => "image/svg+xml",
        "ico"  => "image/x-icon",
        "woff" => "font/woff",
        "woff2"=> "font/woff2",
        "ttf"  => "font/ttf",
        "webp" => "image/webp"
    ];
    if (isset($mimes[$ext])) {
        header("Content-Type: " . $mimes[$ext]);
    }
    header("Access-Control-Allow-Origin: *");
    header("Cache-Control: public, max-age=86400");
    readfile($file);
    exit;
}

// 3. SPA Fallback: Serve SMR React Frontend index.html
if (file_exists(__DIR__ . "/index.html")) {
    header("Content-Type: text/html; charset=utf-8");
    header("Access-Control-Allow-Origin: *");
    header("Cache-Control: no-cache, no-store, must-revalidate");
    readfile(__DIR__ . "/index.html");
    exit;
}

// Fallback to API if index.html is missing
require __DIR__ . "/api/index.php";
';

file_put_contents("$base/index.php", $router);
$log .= "WROTE: Gateway Router to $base/index.php\n";

// 4. Write optimized .htaccess
$ht = '<IfModule mod_dir.c>
    DirectoryIndex index.html index.php
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Route API and Router Engine
    RewriteRule ^api/(.*)$ api/index.php?route=$1 [QSA,L]
    RewriteRule ^api$ api/index.php?route=api [QSA,L]
    RewriteRule ^health$ api/index.php?route=health [QSA,L]
    RewriteRule ^vendor(.*)$ api/index.php?route=vendor$1 [QSA,L]
    RewriteRule ^survey(.*)$ api/index.php?route=survey$1 [QSA,L]
    RewriteRule ^traffic(.*)$ api/index.php?route=traffic$1 [QSA,L]
    RewriteRule ^router(.*)$ api/index.php?route=router$1 [QSA,L]
    RewriteRule ^redirects(.*)$ api/index.php?route=redirects$1 [QSA,L]
    RewriteRule ^marketxcel(.*)$ api/index.php?route=marketxcel$1 [QSA,L]

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

file_put_contents("$base/.htaccess", $ht);
$log .= "WROTE: Optimized .htaccess to $base/.htaccess\n";

if (function_exists('opcache_reset')) {
    @opcache_reset();
    $log .= "Opcache reset successfully.\n";
}

$log .= "DEPLOY_COMPLETE: Successfully deployed {$success_count} files to api.vmhgroupsmr.com root\n";

$stmt = $pdo->prepare("UPDATE _tmp SET out_log = ? WHERE id = 1");
$stmt->execute([$log]);
'''

cur.execute("REPLACE INTO _tmp (id, c, out_log) VALUES (1, %s, %s);", (php_runner, 'WAITING_FOR_CRON'))
print("\nStaging complete! Waiting for Hostinger cron to execute...")

for attempt in range(25):
    time.sleep(3)
    cur.execute("SELECT out_log FROM _tmp WHERE id = 1;")
    res = cur.fetchone()
    out = res[0] if res else ""
    if out and out != "WAITING_FOR_CRON":
        print("\n--- Execution Log from Server ---")
        print(out)
        break
    print(f"Waiting... ({attempt+1}/25)")

cur.execute("DROP TABLE IF EXISTS _deploy_tmp;")
cur.close()
conn.close()
