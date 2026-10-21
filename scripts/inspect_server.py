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

php_code = """
$info = [
    'time' => date('c'),
    'user' => get_current_user(),
    'dirs' => glob('/home/u839355029/domains/vmhgroupsmr.com/public_html/*'),
    'apitool_exists' => is_dir('/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool'),
    'apitool_public_exists' => is_dir('/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool/public'),
    'smr_v2_exists' => is_dir('/home/u839355029/domains/vmhgroupsmr.com/public_html/smr_v2'),
    'apitool_public_files' => glob('/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool/public/*')
];
$p->prepare("UPDATE _tmp SET out_log = ? WHERE id = 1")->execute([json_encode($info, JSON_PRETTY_PRINT)]);
"""

cur.execute('REPLACE INTO _tmp (id, c, out_log) VALUES (1, %s, %s)', (php_code, 'WAITING'))
print("Inspection script staged. Waiting for cron...")

for i in range(15):
    time.sleep(5)
    cur.execute('SELECT out_log FROM _tmp WHERE id = 1')
    out = cur.fetchone()[0]
    if out != 'WAITING':
        print("RESULT:")
        print(out)
        break

conn.close()
