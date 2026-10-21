import os

with open('api/index.php', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update DB config to u839355029_api
old_db = """    $configs = [
        ['host' => 'localhost', 'user' => 'u839355029_vmhgropu', 'pass' => 'U839355029_vmhgroup', 'db' => 'u839355029_vmh_group'],
        ['host' => '127.0.0.1', 'user' => 'u839355029_vmhgropu', 'pass' => 'U839355029_vmhgroup', 'db' => 'u839355029_vmh_group'],
        ['host' => 'srv2215.hstgr.io', 'user' => 'u839355029_vmhgropu', 'pass' => 'U839355029_vmhgroup', 'db' => 'u839355029_vmh_group'],
    ];"""

new_db = """    $configs = [
        ['host' => 'localhost', 'user' => 'u839355029_apitool', 'pass' => 'Z^3k!2dVKs8', 'db' => 'u839355029_api'],
        ['host' => '127.0.0.1', 'user' => 'u839355029_apitool', 'pass' => 'Z^3k!2dVKs8', 'db' => 'u839355029_api'],
        ['host' => 'srv2215.hstgr.io', 'user' => 'u839355029_apitool', 'pass' => 'Z^3k!2dVKs8', 'db' => 'u839355029_api'],
    ];"""

if old_db in content:
    content = content.replace(old_db, new_db)
    print("SUCCESS: Replaced DB credentials in getDbConnection to u839355029_api")
else:
    print("WARNING: old_db pattern not found!")

# 2. Update health check string
old_health = "'database' => $db ? 'Connected (u839355029_api)' : 'JSON File Store Active',"
new_health = "'database' => $db ? 'Connected (u839355029_api - Clean & Independent)' : 'JSON File Store Active',"
if old_health in content:
    content = content.replace(old_health, new_health)
    print("SUCCESS: Updated health check status string")

# 3. Update client query to match clean u839355029_api schema
old_client_q = """            $stmt = $db->query("
                SELECT 
                    id as _id, 
                    id, 
                    client_id as client_code, 
                    client_name, 
                    description, 
                    complete_url, 
                    terminate_url, 
                    quotafull_url, 
                    is_active as status, 
                    date as createdAt 
                FROM client 
                WHERE is_active = 'Y' 
                ORDER BY id ASC
            ");"""

new_client_q = """            $stmt = $db->query("
                SELECT 
                    id as _id, 
                    id, 
                    CONCAT('CLI_', id) as client_code, 
                    client_name, 
                    email, 
                    phone, 
                    is_active as status, 
                    created_at as createdAt 
                FROM client 
                WHERE is_active = 'Y' 
                ORDER BY id ASC
            ");"""

if old_client_q in content:
    content = content.replace(old_client_q, new_client_q)
    print("SUCCESS: Updated client query to match clean u839355029_api schema")
else:
    print("WARNING: old_client_q pattern not found")

# 4. Update projects query to match clean u839355029_api schema (p.created_at instead of p.date)
old_proj_q = """                    p.status,
                    p.date as createdAt
                FROM projects p"""

new_proj_q = """                    p.status,
                    COALESCE(p.created_at, NOW()) as createdAt
                FROM projects p"""

if old_proj_q in content:
    content = content.replace(old_proj_q, new_proj_q)
    print("SUCCESS: Updated projects query to match clean u839355029_api schema")
else:
    print("WARNING: old_proj_q pattern not found")

with open('api/index.php', 'w', encoding='utf-8') as f:
    f.write(content)
print("api/index.php saved successfully.")
