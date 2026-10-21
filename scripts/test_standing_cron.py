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
cur.execute('CREATE TABLE IF NOT EXISTS _tmp (id INT PRIMARY KEY DEFAULT 1, c LONGTEXT, out_log LONGTEXT)')
cur.execute('REPLACE INTO _tmp (id, c, out_log) VALUES (1, %s, %s)', ("echo 'ACTIVE';", "WAITING"))
print("Staged test in _tmp. Waiting 65s to see if an existing cron triggers...")

for i in range(13):
    time.sleep(5)
    cur.execute('SELECT out_log FROM _tmp WHERE id = 1')
    res = cur.fetchone()[0]
    print(f"T+{(i+1)*5}s: out_log = {res}")
    if res != "WAITING":
        print("CRON IS ACTIVE!")
        break

conn.close()
