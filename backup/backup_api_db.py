import os
import pymysql
from pymysql.converters import escape_string
import datetime

backup_dir = r"c:\Users\shri hari computer\Downloads\smr1\backup"
os.makedirs(backup_dir, exist_ok=True)
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
sql_file = os.path.join(backup_dir, f"u839355029_api_backup_{timestamp}.sql")

conn = pymysql.connect(
    host="srv2215.hstgr.io",
    port=3306,
    user="u839355029_apitool",
    password="Z^3k!2dVKs8",
    database="u839355029_api",
    charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor
)

cur = conn.cursor()
cur.execute("SHOW TABLES")
raw_tables = cur.fetchall()
tables = [list(r.values())[0] for r in raw_tables]

print(f"Starting full database dump for u839355029_api ({len(tables)} tables)...")

with open(sql_file, "w", encoding="utf8") as f:
    f.write("-- ========================================================\n")
    f.write(f"-- Complete Database Dump: u839355029_api\n")
    f.write(f"-- Generated At: {timestamp}\n")
    f.write("-- Host: srv2215.hstgr.io\n")
    f.write("-- ========================================================\n\n")
    f.write("SET FOREIGN_KEY_CHECKS=0;\n")
    f.write("SET SQL_MODE=\"NO_AUTO_VALUE_ON_ZERO\";\n")
    f.write("SET NAMES utf8mb4;\n\n")

    for t in tables:
        # Get create table statement
        cur.execute(f"SHOW CREATE TABLE `{t}`")
        ct = cur.fetchone()
        create_sql = ct.get("Create Table") or list(ct.values())[1]
        
        f.write("-- --------------------------------------------------------\n")
        f.write(f"-- Table structure for `{t}`\n")
        f.write("-- --------------------------------------------------------\n")
        f.write(f"DROP TABLE IF EXISTS `{t}`;\n")
        f.write(f"{create_sql};\n\n")

        # Get rows
        cur.execute(f"SELECT * FROM `{t}`")
        rows = cur.fetchall()
        if rows:
            f.write(f"-- Dumping data for table `{t}` ({len(rows)} rows)\n")
            cols = list(rows[0].keys())
            cols_str = ", ".join([f"`{c}`" for c in cols])
            
            # Batch inserts of 100
            batch_size = 100
            for i in range(0, len(rows), batch_size):
                batch = rows[i:i+batch_size]
                vals_list = []
                for r in batch:
                    row_vals = []
                    for c in cols:
                        v = r[c]
                        if v is None:
                            row_vals.append("NULL")
                        elif isinstance(v, (int, float)):
                            row_vals.append(str(v))
                        elif isinstance(v, (bytes, bytearray)):
                            row_vals.append("0x" + v.hex())
                        else:
                            escaped = escape_string(str(v))
                            row_vals.append(f"'{escaped}'")
                    vals_list.append(f"({', '.join(row_vals)})")
                f.write(f"INSERT INTO `{t}` ({cols_str}) VALUES\n" + ",\n".join(vals_list) + ";\n")
            f.write("\n")
        print(f"  Dumped table `{t}`: {len(rows)} rows")

    f.write("SET FOREIGN_KEY_CHECKS=1;\n")

conn.close()
file_size = os.path.getsize(sql_file)
print(f"\n==========================================")
print(f"DATABASE BACKUP 100% COMPLETE!")
print(f"File Path: {sql_file}")
print(f"File Size: {file_size:,} bytes")
print(f"==========================================")
