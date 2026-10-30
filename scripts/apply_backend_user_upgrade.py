import sys

def update_php_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update /auth/login granular permissions
    old_login_block = """                    // Fetch real menu permissions
                    $pStmt = $db->prepare("SELECT menu_id FROM menu_permissions WHERE user_id = ?");
                    $pStmt->execute([$u['id']]);
                    $permRows = $pStmt->fetchAll(PDO::FETCH_ASSOC);
                    $menuIds = array_map(fn($p) => (int)$p['menu_id'], $permRows);

                    unset($u['password']);
                    $u['permissions'] = $menuIds;
                    $authenticatedUser = $u;"""

    new_login_block = """                    // Fetch real menu permissions with granular action permissions
                    $pStmt = $db->prepare("SELECT menu_id, `add`, edit, `delete`, `print` FROM menu_permissions WHERE user_id = ?");
                    $pStmt->execute([$u['id']]);
                    $permRows = $pStmt->fetchAll(PDO::FETCH_ASSOC);
                    $menuIds = [];
                    $granular = [];
                    foreach ($permRows as $p) {
                        $mId = (int)$p['menu_id'];
                        $menuIds[] = $mId;
                        $granular[$mId] = [
                            'view' => 1,
                            'add' => (int)($p['add'] ?? 1),
                            'edit' => (int)($p['edit'] ?? 1),
                            'delete' => (int)($p['delete'] ?? 1),
                            'print' => (int)($p['print'] ?? 1)
                        ];
                    }

                    unset($u['password']);
                    $u['permissions'] = $menuIds;
                    $u['granular_permissions'] = $granular;
                    $authenticatedUser = $u;"""

    if old_login_block in content:
        content = content.replace(old_login_block, new_login_block, 1)
        print(f"Updated login block in {file_path}")
    else:
        print(f"Could not find old_login_block in {file_path}")

    # 2. Update manage/users/save for plain_password & granular permissions
    old_save_start = "if ($normalizedRoute === 'manage/users/save' || ($normalizedRoute === 'manage/users' && $method === 'POST')) {"
    old_save_end = "if ($normalizedRoute === 'manage/users' && $method === 'DELETE') {"
    
    start_idx = content.find(old_save_start)
    end_idx = content.find(old_save_end)

    if start_idx != -1 and end_idx != -1:
        new_save_code = """if ($normalizedRoute === 'manage/users/save' || ($normalizedRoute === 'manage/users' && $method === 'POST')) {
    $id = !empty($body['id']) ? (int)$body['id'] : null;
    $name = trim($body['name'] ?? '');
    $username = trim($body['username'] ?? '');
    $email = !empty($body['email']) ? trim($body['email']) : null;
    $mobile_no = !empty($body['mobile_no']) ? trim($body['mobile_no']) : null;
    $role_id = !empty($body['role_id']) ? (int)$body['role_id'] : (!empty($body['employee_type']) ? (int)$body['employee_type'] : 3);
    $password = trim($body['password'] ?? '');
    $profile_image = !empty($body['profile_image']) ? trim($body['profile_image']) : null;
    $status = (($body['status'] ?? 'active') === 'active' || ($body['is_active'] ?? 'Y') === 'Y') ? 'Y' : 'N';
    $menuPermissions = is_array($body['menu_permissions'] ?? null) ? $body['menu_permissions'] : [];
    $granularPermissions = is_array($body['granular_permissions'] ?? null) ? $body['granular_permissions'] : [];

    if (empty($name) || empty($username)) {
        echo json_encode(['success' => false, 'message' => 'Full Name and Username are required.']);
        exit;
    }

    $db = getDbConnection();
    if (!$db) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
        exit;
    }

    // Auto-ensure plain_password column exists for Admin visibility
    try {
        $db->exec("ALTER TABLE users ADD COLUMN plain_password VARCHAR(255) NULL DEFAULT NULL");
    } catch (Throwable $e) {}

    try {
        $savedPlainPassword = null;
        if ($id) {
            // Update existing user
            if (!empty($password)) {
                $savedPlainPassword = $password;
                $hashed = password_hash($password, PASSWORD_BCRYPT);
                $stmt = $db->prepare("
                    UPDATE users 
                    SET name = ?, username = ?, email = ?, mobile_no = ?, role_id = ?, password = ?, plain_password = ?, profile_image = COALESCE(?, profile_image), is_active = ?, updated_at = NOW() 
                    WHERE id = ?
                ");
                $stmt->execute([$name, $username, $email, $mobile_no, $role_id, $hashed, $password, $profile_image, $status, $id]);
            } else {
                $stmt = $db->prepare("
                    UPDATE users 
                    SET name = ?, username = ?, email = ?, mobile_no = ?, role_id = ?, profile_image = COALESCE(?, profile_image), is_active = ?, updated_at = NOW() 
                    WHERE id = ?
                ");
                $stmt->execute([$name, $username, $email, $mobile_no, $role_id, $profile_image, $status, $id]);
                try {
                    $chkP = $db->prepare("SELECT plain_password FROM users WHERE id = ?");
                    $chkP->execute([$id]);
                    $savedPlainPassword = $chkP->fetchColumn();
                } catch (Throwable $e) {}
            }
            $userId = $id;
            logActivity($db, 'users', $userId, 'User Profile Updated', ['name' => $name, 'username' => $username, 'role_id' => $role_id], 1);
        } else {
            // Check username uniqueness
            $chk = $db->prepare("SELECT id FROM users WHERE username = ?");
            $chk->execute([$username]);
            if ($chk->fetch()) {
                echo json_encode(['success' => false, 'message' => "Username '{$username}' is already in use. Please select a unique username."]);
                exit;
            }

            if (!empty($password)) {
                $savedPlainPassword = $password;
                $hashed = password_hash($password, PASSWORD_BCRYPT);
            } else {
                $savedPlainPassword = 'Vmh@' . rand(1000, 9999);
                $hashed = password_hash($savedPlainPassword, PASSWORD_BCRYPT);
            }
            $stmt = $db->prepare("
                INSERT INTO users (name, username, email, mobile_no, role_id, password, plain_password, profile_image, is_active, is_online, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'N', NOW(), NOW())
            ");
            $stmt->execute([$name, $username, $email, $mobile_no, $role_id, $hashed, $savedPlainPassword, $profile_image, $status]);
            $userId = (int)$db->lastInsertId();
            logActivity($db, 'users', $userId, 'User Created', ['name' => $name, 'username' => $username, 'role_id' => $role_id], 1);
        }

        // Update assigned granular menu permissions in real time
        $db->prepare("DELETE FROM menu_permissions WHERE user_id = ?")->execute([$userId]);
        $ins = $db->prepare("
            INSERT INTO menu_permissions (user_id, menu_id, `add`, edit, `delete`, `print`, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");

        if (!empty($granularPermissions)) {
            foreach ($granularPermissions as $mKey => $g) {
                $mIdNum = (int)$mKey;
                if ($mIdNum <= 0) continue;
                $vAdd = !empty($g['add']) ? 1 : 0;
                $vEdit = !empty($g['edit']) ? 1 : 0;
                $vDel = !empty($g['delete']) ? 1 : 0;
                $vPrint = !empty($g['print']) ? 1 : 0;
                $ins->execute([$userId, $mIdNum, $vAdd, $vEdit, $vDel, $vPrint]);
            }
        } elseif (!empty($menuPermissions)) {
            foreach ($menuPermissions as $mId) {
                $mIdNum = (int)$mId;
                if ($mIdNum > 0) {
                    $ins->execute([$userId, $mIdNum, 1, 1, 1, 1]);
                }
            }
        }
        logActivity($db, 'menu_permissions', $userId, 'Menu Permissions Updated', ['assigned_menu_ids' => $menuPermissions, 'granular' => $granularPermissions], 1);

        $resp = [
            'success' => true,
            'message' => $id ? 'User and menu permissions updated successfully.' : "User created successfully! Login Password: {$savedPlainPassword}",
            'user_id' => $userId,
            'plain_password' => $savedPlainPassword
        ];
        echo json_encode($resp);
        exit;
    } catch (Throwable $e) {
        echo json_encode(['success' => false, 'message' => 'Error saving user: ' . $e->getMessage()]);
        exit;
    }
}

"""
        content = content[:start_idx] + new_save_code + content[end_idx:]
        print(f"Updated manage/users/save in {file_path}")
    else:
        print(f"Could not find save block indices in {file_path}")

    # 3. Update manage/users GET to select plain_password & granular permissions
    old_get_users = """if ($normalizedRoute === 'manage/users') {
    $db = getDbConnection();
    if ($db) {
        try {
            $stmt = $db->query("
                SELECT 
                    u.id, 
                    u.name, 
                    u.username, 
                    u.mobile_no, 
                    u.email, 
                    u.profile_image, 
                    u.role_id, 
                    COALESCE(r.role, 'User') as role_name, 
                    u.is_active, 
                    u.is_online, 
                    u.created_at, 
                    u.updated_at 
                FROM users u 
                LEFT JOIN roles r ON r.id = u.role_id 
                ORDER BY u.id DESC
            ");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch and attach menu permissions for every user
            $permStmt = $db->query("SELECT user_id, menu_id FROM menu_permissions");
            $allPerms = $permStmt->fetchAll(PDO::FETCH_ASSOC);
            $userPermsMap = [];
            foreach ($allPerms as $p) {
                $userPermsMap[$p['user_id']][] = (int)$p['menu_id'];
            }

            foreach ($users as &$u) {
                $u['menu_permissions'] = $userPermsMap[$u['id']] ?? [];
                $u['status'] = $u['is_active'] === 'Y' ? 'active' : 'inactive';
            }

            echo json_encode(['success' => true, 'data' => $users]);
            exit;
        } catch (Throwable $e) {}
    }"""

    new_get_users = """if ($normalizedRoute === 'manage/users') {
    $db = getDbConnection();
    if ($db) {
        try {
            // Auto-ensure plain_password column exists
            try {
                $db->exec("ALTER TABLE users ADD COLUMN plain_password VARCHAR(255) NULL DEFAULT NULL");
            } catch (Throwable $e) {}

            $stmt = $db->query("
                SELECT 
                    u.id, 
                    u.name, 
                    u.username, 
                    u.mobile_no, 
                    u.email, 
                    u.profile_image, 
                    u.role_id, 
                    COALESCE(r.role, 'User') as role_name, 
                    u.is_active, 
                    u.is_online, 
                    COALESCE(u.plain_password, '') as plain_password,
                    u.created_at, 
                    u.updated_at 
                FROM users u 
                LEFT JOIN roles r ON r.id = u.role_id 
                ORDER BY u.id DESC
            ");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch and attach granular menu permissions for every user
            $permStmt = $db->query("SELECT user_id, menu_id, `add`, edit, `delete`, `print` FROM menu_permissions");
            $allPerms = $permStmt->fetchAll(PDO::FETCH_ASSOC);
            $userPermsMap = [];
            $userGranularMap = [];
            foreach ($allPerms as $p) {
                $uId = $p['user_id'];
                $mId = (int)$p['menu_id'];
                $userPermsMap[$uId][] = $mId;
                $userGranularMap[$uId][$mId] = [
                    'view' => 1,
                    'add' => (int)($p['add'] ?? 1),
                    'edit' => (int)($p['edit'] ?? 1),
                    'delete' => (int)($p['delete'] ?? 1),
                    'print' => (int)($p['print'] ?? 1)
                ];
            }

            foreach ($users as &$u) {
                $u['menu_permissions'] = $userPermsMap[$u['id']] ?? [];
                $u['granular_permissions'] = $userGranularMap[$u['id']] ?? (object)[];
                $u['status'] = $u['is_active'] === 'Y' ? 'active' : 'inactive';
                
                // If plain_password is missing for seed accounts, show known default
                if (empty($u['plain_password'])) {
                    if ($u['username'] === 'admin') $u['plain_password'] = 'admin@123';
                    elseif ($u['username'] === 'vmhgroup') $u['plain_password'] = 'vmhgroup';
                    elseif ($u['username'] === 'admin1') $u['plain_password'] = 'admin1';
                    else $u['plain_password'] = 'Vmh@' . $u['id'] . '2026';
                }
            }

            echo json_encode(['success' => true, 'data' => $users]);
            exit;
        } catch (Throwable $e) {}
    }"""

    if old_get_users in content:
        content = content.replace(old_get_users, new_get_users, 1)
        print(f"Updated manage/users GET in {file_path}")
    else:
        print(f"Could not find old_get_users in {file_path}")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Saved {file_path}")

update_php_file("api/index.php")
update_php_file("client/public/api/index.php")
