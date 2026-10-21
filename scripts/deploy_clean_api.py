import os
import pymysql
import base64
import time

target_path = "/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool/api/index.php"
local_file = r"c:\Users\shri hari computer\Downloads\smr1\api\index.php"

with open(local_file, "rb") as f:
    b64 = base64.b64encode(f.read()).decode("ascii")

print(f"Deploying clean api/index.php ({os.path.getsize(local_file):,} bytes) to {target_path}...")

conn = pymysql.connect(
    host="srv2215.hstgr.io",
    user="u839355029_vmhgropu",
    password="U839355029_vmhgroup",
    database="u839355029_vmh_group",
    autocommit=True
)
cur = conn.cursor()

cur.execute("DROP TABLE IF EXISTS _clean_tmp;")
cur.execute("CREATE TABLE _clean_tmp (id INT PRIMARY KEY, content LONGTEXT);")
cur.execute("INSERT INTO _clean_tmp (id, content) VALUES (1, %s);", (b64,))

php_runner = r'''$pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=u839355029_vmh_group", "u839355029_vmhgropu", "U839355029_vmhgroup", [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

$raw = $pdo->query("SELECT content FROM _clean_tmp WHERE id=1")->fetchColumn();
if ($raw) {
    $bytes = base64_decode($raw);
    $dest = "/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool/api/index.php";
    @mkdir(dirname($dest), 0755, true);
    file_put_contents($dest, $bytes);
    $out = "DEPLOYED_CLEAN_INDEX_PHP: " . strlen($bytes) . " bytes";
} else {
    $out = "ERROR: No content in _clean_tmp";
}

$pdo->prepare("UPDATE _tmp SET out_log=? WHERE id=1")->execute([$out]);
'''

cur.execute("UPDATE _tmp SET c=%s, out_log='' WHERE id=1;", (php_runner,))
print("Payload staged into _tmp. Waiting for Hostinger cron runner (every 1 min)...")

start = time.time()
while time.time() - start < 120:
    cur.execute("SELECT out_log FROM _tmp WHERE id=1;")
    out = cur.fetchone()[0] or ""
    if out:
        print(f"Cron Result: {out}")
        break
    print(".", end="", flush=True)
    time.sleep(5)

conn.close()
