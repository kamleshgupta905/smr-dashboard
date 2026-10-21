import pymysql
import time
import json

conn = pymysql.connect(
    host='srv2215.hstgr.io',
    user='u839355029_vmhgropu',
    password='U839355029_vmhgroup',
    database='u839355029_vmh_group',
    autocommit=True
)
cur = conn.cursor()

php_code = r'''
$output = shell_exec('find /home/u839355029 -name "LoginController.php" 2>/dev/null');
$domains = glob('/home/u839355029/domains/*');
$subdomains = glob('/home/u839355029/domains/*/*');

$p->prepare("UPDATE _tmp SET out_log = ? WHERE id = 1")->execute([json_encode([
    'login_controllers' => explode("\n", trim($output)),
    'domains' => $domains,
    'subdomains' => $subdomains
], JSON_PRETTY_PRINT)]);
'''

cur.execute('REPLACE INTO _tmp (id, c, out_log) VALUES (1, %s, %s)', (php_code, 'WAITING'))
print("Searching for real document root. Waiting for cron...")

for i in range(15):
    time.sleep(5)
    cur.execute('SELECT out_log FROM _tmp WHERE id = 1')
    out = cur.fetchone()[0]
    if out != 'WAITING':
        print("RESULT:")
        print(out)
        break

conn.close()
