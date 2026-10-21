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
$f = "/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool/public/index.php";
$content = file_exists($f) ? substr(file_get_contents($f), 0, 500) : "FILE_NOT_FOUND";
$ht = "/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool/public/.htaccess";
$ht_content = file_exists($ht) ? substr(file_get_contents($ht), 0, 500) : "HT_NOT_FOUND";

$p->prepare("UPDATE _tmp SET out_log = ? WHERE id = 1")->execute([json_encode([
    'index_php' => $content,
    'htaccess' => $ht_content
], JSON_PRETTY_PRINT)]);
'''

cur.execute('REPLACE INTO _tmp (id, c, out_log) VALUES (1, %s, %s)', (php_code, 'WAITING'))
print("Reading remote index.php... Waiting for cron...")

for i in range(15):
    time.sleep(5)
    cur.execute('SELECT out_log FROM _tmp WHERE id = 1')
    out = cur.fetchone()[0]
    if out != 'WAITING':
        print("RESULT:")
        print(out)
        break

conn.close()
