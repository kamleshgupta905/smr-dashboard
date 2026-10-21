import pymysql
import time

conn = pymysql.connect(host='srv2215.hstgr.io', user='u839355029_vmhgropu', password='U839355029_vmhgroup', database='u839355029_vmh_group')
cur = conn.cursor()

for i in range(12):
    cur.execute('SELECT out_log FROM _tmp WHERE id = 1')
    out = cur.fetchone()[0]
    if out != 'WAITING':
        print("CRON RESULT:")
        print(out)
        break
    time.sleep(5)

conn.close()
