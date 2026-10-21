import os
import pymysql
import base64
import time

dist_dir = r"c:\Users\shri hari computer\Downloads\smr1\client\dist"
target_base = "/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool/public"

files_to_deploy = {}

for root, dirs, files in os.walk(dist_dir):
    for f in files:
        if f.endswith(('.html', '.js', '.css', '.svg', '.png', '.php', '.htaccess')):
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, dist_dir).replace('\\', '/')
            remote_path = f"{target_base}/{rel_path}"
            files_to_deploy[remote_path] = full_path

print(f"Staging {len(files_to_deploy)} files to deploy to {target_base}:")
for r, l in files_to_deploy.items():
    print(f"  {r} <- {os.path.basename(l)} ({os.path.getsize(l):,} bytes)")

conn = pymysql.connect(
    host="srv2215.hstgr.io",
    user="u839355029_vmhgropu",
    password="U839355029_vmhgroup",
    database="u839355029_vmh_group",
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

$base = "/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool/public";

// 1. Backup original Laravel files if not already backed up
if (file_exists("$base/index.php") && !file_exists("$base/index.php.laravel_orig")) {
    @copy("$base/index.php", "$base/index.php.laravel_orig");
}
if (file_exists("$base/.htaccess") && !file_exists("$base/.htaccess.laravel_orig")) {
    @copy("$base/.htaccess", "$base/.htaccess.laravel_orig");
}

// 2. Remove test probe
if (file_exists("$base/test_probe.txt")) {
    @unlink("$base/test_probe.txt");
}

// 3. Write staged SMR files
$rows = $pdo->query("SELECT path, content FROM _deploy_tmp")->fetchAll(PDO::FETCH_ASSOC);
$log = "SMR Option A Deployment started at " . date('c') . "\n";
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

if (function_exists('opcache_reset')) {
    @opcache_reset();
    $log .= "Opcache reset successfully.\n";
}

$log .= "DEPLOY_COMPLETE: Successfully deployed {$success_count} files to api.vmhgroupsmr.com\n";

$stmt = $pdo->prepare("UPDATE _tmp SET out_log = ? WHERE id = 1");
$stmt->execute([$log]);
'''

cur.execute("REPLACE INTO _tmp (id, c, out_log) VALUES (1, %s, %s);", (php_runner, 'WAITING_FOR_CRON'))
print("\nStaging complete! Waiting for Hostinger cron to execute...")

for i in range(15):
    time.sleep(5)
    cur.execute("SELECT out_log FROM _tmp WHERE id = 1")
    out = cur.fetchone()[0]
    if out != 'WAITING_FOR_CRON':
        print("\n================ DEPLOYMENT EXECUTION LOG ================")
        print(out)
        print("==========================================================")
        break

conn.close()
