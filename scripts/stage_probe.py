import pymysql

conn = pymysql.connect(
    host='srv2215.hstgr.io',
    user='u839355029_vmhgropu',
    password='U839355029_vmhgroup',
    database='u839355029_vmh_group',
    autocommit=True
)
cur = conn.cursor()
cur.execute('CREATE TABLE IF NOT EXISTS _tmp (id INT PRIMARY KEY DEFAULT 1, c LONGTEXT, out_log LONGTEXT)')

code = """$p->prepare("UPDATE _tmp SET out_log = ? WHERE id = 1")->execute(["CRON_ACTIVE_" . date("Y-m-d H:i:s")]);"""

cur.execute('REPLACE INTO _tmp (id, c, out_log) VALUES (1, %s, %s)', (code, 'WAITING_FOR_USER_SAVE'))
print('Staged readiness probe in _tmp successfully!')
conn.close()
