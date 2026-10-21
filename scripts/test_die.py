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
$test_code = '<?php die("UNIVERSAL_ROUTER_ACTIVE_" . date("c"));';
file_put_contents($f, $test_code);
if (function_exists('opcache_reset')) @opcache_reset();
$p->prepare("UPDATE _tmp SET out_log = ? WHERE id = 1")->execute(["DIE_TEST_WRITTEN"]);
'''

cur.execute('REPLACE INTO _tmp (id, c, out_log) VALUES (1, %s, %s)', (php_code, 'WAITING'))
print("Writing die test. Waiting for cron...")

for i in range(15):
    time.sleep(5)
    cur.execute('SELECT out_log FROM _tmp WHERE id = 1')
    out = cur.fetchone()[0]
    if out != 'WAITING':
        print("RESULT:", out)
        break

conn.close()
