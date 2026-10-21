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
$ht = file_exists('/home/u839355029/domains/vmhgroupsmr.com/public_html/smr_v2/.htaccess') ? file_get_contents('/home/u839355029/domains/vmhgroupsmr.com/public_html/smr_v2/.htaccess') : 'NO_HTACCESS';
$api_ht = file_exists('/home/u839355029/domains/vmhgroupsmr.com/public_html/smr_v2/api/.htaccess') ? file_get_contents('/home/u839355029/domains/vmhgroupsmr.com/public_html/smr_v2/api/.htaccess') : (file_exists('/home/u839355029/domains/vmhgroupsmr.com/public_html/api/.htaccess') ? file_get_contents('/home/u839355029/domains/vmhgroupsmr.com/public_html/api/.htaccess') : 'NO_API_HTACCESS');

$res = [
    'root_ht' => $ht,
    'api_ht' => $api_ht
];

$p->prepare("UPDATE _tmp SET out_log = ? WHERE id = 1")->execute([json_encode($res, JSON_PRETTY_PRINT)]);
"""

cur.execute('REPLACE INTO _tmp (id, c, out_log) VALUES (1, %s, %s)', (php_code, 'WAITING'))
print("Reading htaccess... Waiting for cron...")

for i in range(15):
    time.sleep(5)
    cur.execute('SELECT out_log FROM _tmp WHERE id = 1')
    out = cur.fetchone()[0]
    if out != 'WAITING':
        print("RESULT:")
        print(out)
        break

conn.close()
