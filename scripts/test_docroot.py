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

php_code = """
file_put_contents('/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool/public/test_probe.txt', 'PROBE_SUCCESS_' . date('c'));
$p->prepare("UPDATE _tmp SET out_log = ? WHERE id = 1")->execute(['PROBE_FILE_WRITTEN']);
"""

cur.execute('REPLACE INTO _tmp (id, c, out_log) VALUES (1, %s, %s)', (php_code, 'WAITING'))
print("Probe staged. Waiting for cron...")

for i in range(15):
    time.sleep(5)
    cur.execute('SELECT out_log FROM _tmp WHERE id = 1')
    out = cur.fetchone()[0]
    if out != 'WAITING':
        print("RESULT:", out)
        break

conn.close()
