import pymysql

conn = pymysql.connect(host='srv2215.hstgr.io', user='u839355029_vmhgropu', password='U839355029_vmhgroup', database='u839355029_vmh_group', autocommit=True)
cur = conn.cursor()

code = """
$api_files = glob('/home/u839355029/domains/vmhgroupsmr.com/public_html/api/*');
$all_domains = glob('/home/u839355029/domains/*');
$p->prepare("UPDATE _tmp SET out_log = ? WHERE id = 1")->execute([json_encode([
    'api_files' => $api_files,
    'all_domains' => $all_domains
], JSON_PRETTY_PRINT)]);
"""

cur.execute('REPLACE INTO _tmp (id, c, out_log) VALUES (1, %s, %s)', (code, 'WAITING'))
print("Staged listing probe. Ready.")
conn.close()
