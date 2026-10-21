import pymysql

conn = pymysql.connect(host='srv2215.hstgr.io', user='u839355029_vmhgropu', password='U839355029_vmhgroup', database='u839355029_vmh_group', autocommit=True)
cur = conn.cursor()

code = """
$p1 = file_exists('/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool/index.php');
$p2 = file_exists('/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool/.htaccess');
$p3 = file_exists('/home/u839355029/domains/vmhgroupsmr.com/public_html/apitool/server.php');
$p4 = file_exists('/home/u839355029/domains/vmhgroupsmr.com/public_html/index.php');

$p->prepare("UPDATE _tmp SET out_log = ? WHERE id = 1")->execute([json_encode([
    'apitool_root_index_php' => $p1,
    'apitool_root_htaccess' => $p2,
    'apitool_server_php' => $p3,
    'public_html_index_php' => $p4
], JSON_PRETTY_PRINT)]);
"""

cur.execute('REPLACE INTO _tmp (id, c, out_log) VALUES (1, %s, %s)', (code, 'WAITING'))
print("Staged apitool root check.")
conn.close()
