with open('api/index.php', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update $isPublic
if "str_starts_with($normalizedRoute, 'leads')" not in code:
    code = code.replace(
        "str_starts_with($normalizedRoute, 'bids') ||",
        "str_starts_with($normalizedRoute, 'bids') ||\n    str_starts_with($normalizedRoute, 'leads') ||\n    str_starts_with($normalizedRoute, 'traffic') ||"
    )

new_endpoints = """
// -------------------------------------------------------------
// 8f. Traffic Leads Log (Laravel LeadsController replicate)
// -------------------------------------------------------------
if ($normalizedRoute === 'leads' || str_starts_with($normalizedRoute, 'leads') || $normalizedRoute === 'traffic') {
    $db = getDbConnection();

    // Summary Aggregates
    $summary = [
        'total_clicks' => 0,
        'total_completes' => 0,
        'total_terminates' => 0,
        'total_overquota' => 0,
        'conversion_rate' => 0.0
    ];

    if ($db) {
        try {
            $sumRow = $db->query("
                SELECT 
                    COUNT(*) as total_clicks,
                    SUM(CASE WHEN status = 'Complete' THEN 1 ELSE 0 END) as total_completes,
                    SUM(CASE WHEN status = 'Terminates' OR status = 'Terminated' THEN 1 ELSE 0 END) as total_terminates,
                    SUM(CASE WHEN status = 'Quota Full' THEN 1 ELSE 0 END) as total_overquota
                FROM leads
            ")->fetch(PDO::FETCH_ASSOC);

            if ($sumRow) {
                $summary['total_clicks'] = (int)($sumRow['total_clicks'] ?? 0);
                $summary['total_completes'] = (int)($sumRow['total_completes'] ?? 0);
                $summary['total_terminates'] = (int)($sumRow['total_terminates'] ?? 0);
                $summary['total_overquota'] = (int)($sumRow['total_overquota'] ?? 0);
                if ($summary['total_clicks'] > 0) {
                    $summary['conversion_rate'] = round(($summary['total_completes'] / $summary['total_clicks']) * 100, 2);
                }
            }

            // Create test / simulated lead
            if ($method === 'POST') {
                $pId = trim($body['project_id'] ?? 'PRJ-101');
                $vId = trim($body['vendor_id'] ?? '1');
                $uid = trim($body['username'] ?? $body['uid'] ?? ('RESP_' . rand(10000, 99999)));
                $status = trim($body['status'] ?? 'Complete');
                $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

                $ins = $db->prepare("INSERT INTO leads (project_id, vendor_id, client_id, username, status, ip_address, created_at, updated_at) VALUES (?, ?, '1', ?, ?, ?, NOW(), NOW())");
                $ins->execute([$pId, $vId, $uid, $status, $ip]);
                echo json_encode(['success' => true, 'id' => $db->lastInsertId(), 'uid' => $uid]);
                exit;
            }

            // List leads with filters
            $statusFilter = $_GET['status'] ?? '';
            $search = trim($_GET['search'] ?? '');
            $limit = min(500, max(10, (int)($_GET['limit'] ?? 50)));
            $offset = max(0, (int)($_GET['offset'] ?? 0));

            $where = [];
            $params = [];

            if ($statusFilter && $statusFilter !== 'ALL') {
                $where[] = "l.status = ?";
                $params[] = $statusFilter;
            }

            if ($search !== '') {
                $where[] = "(l.username LIKE ? OR l.project_id LIKE ? OR l.ip_address LIKE ? OR l.vendor_id LIKE ?)";
                $params[] = "%{$search}%";
                $params[] = "%{$search}%";
                $params[] = "%{$search}%";
                $params[] = "%{$search}%";
            }

            $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

            $countStmt = $db->prepare("SELECT COUNT(*) FROM leads l {$whereSql}");
            $countStmt->execute($params);
            $totalCount = (int)$countStmt->fetchColumn();

            $query = "
                SELECT 
                    l.id,
                    l.project_id,
                    l.vendor_id,
                    COALESCE(v.vendor_name, CONCAT('Vendor #', l.vendor_id)) as vendor_name,
                    l.client_id,
                    l.username as uid,
                    l.status,
                    l.ip_address,
                    l.created_at,
                    l.updated_at
                FROM leads l
                LEFT JOIN vendor v ON v.id = l.vendor_id OR v.vendor_id = l.vendor_id
                {$whereSql}
                ORDER BY l.id DESC
                LIMIT {$limit} OFFSET {$offset}
            ";
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $leads,
                'summary' => $summary,
                'total' => $totalCount
            ]);
            exit;
        } catch (Throwable $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }
    echo json_encode(['success' => true, 'data' => [], 'summary' => $summary, 'total' => 0]);
    exit;
}

// -------------------------------------------------------------
// 8g. Change Password & Staff Login Activity Audit
// -------------------------------------------------------------
if ($normalizedRoute === 'auth/change-password' && ($method === 'POST' || $method === 'PUT')) {
    $db = getDbConnection();
    $userId = (int)($body['user_id'] ?? 1);
    $currentPass = trim($body['current_password'] ?? '');
    $newPass = trim($body['new_password'] ?? '');

    if (!$newPass || strlen($newPass) < 4) {
        echo json_encode(['success' => false, 'message' => 'New password must be at least 4 characters']);
        exit;
    }

    if ($db) {
        try {
            $userStmt = $db->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
            $userStmt->execute([$userId]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                if ($currentPass && !empty($user['password'])) {
                    if (!password_verify($currentPass, $user['password']) && $user['password'] !== $currentPass && $user['password'] !== md5($currentPass)) {
                        echo json_encode(['success' => false, 'message' => 'Current password does not match']);
                        exit;
                    }
                }

                $hashed = password_hash($newPass, PASSWORD_BCRYPT);
                $upd = $db->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
                $upd->execute([$hashed, $userId]);

                echo json_encode(['success' => true, 'message' => 'Password updated successfully!']);
                exit;
            }
        } catch (Throwable $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

if ($normalizedRoute === 'team/activity' || str_starts_with($normalizedRoute, 'team/activity')) {
    $db = getDbConnection();
    if ($db) {
        try {
            if ($method === 'POST') {
                $uId = (int)($body['user_id'] ?? 1);
                $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
                $browser = $_SERVER['HTTP_USER_AGENT'] ?? 'Chrome';
                $platform = PHP_OS;

                $ins = $db->prepare("
                    INSERT INTO user_account_activitys (user_id, ip_address, user_browser, user_platform, login_time, created_at, updated_at)
                    VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())
                ");
                $ins->execute([$uId, $ip, substr($browser, 0, 255), substr($platform, 0, 255)]);
                echo json_encode(['success' => true, 'message' => 'Activity logged']);
                exit;
            }

            $stmt = $db->query("
                SELECT 
                    a.id,
                    a.user_id,
                    COALESCE(u.name, 'Admin') as user_name,
                    COALESCE(u.username, 'admin') as username,
                    a.ip_address,
                    a.user_browser,
                    a.user_platform,
                    a.login_time,
                    a.logout_time,
                    a.created_at
                FROM user_account_activitys a
                LEFT JOIN users u ON u.id = a.user_id
                ORDER BY a.id DESC
                LIMIT 50
            ");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $rows]);
            exit;
        } catch (Throwable $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }
    echo json_encode(['success' => true, 'data' => []]);
    exit;
}

// -------------------------------------------------------------
// 8h. Bid Options & Tiers (MySQL bid_options)
// -------------------------------------------------------------
if ($normalizedRoute === 'bids/options' || str_starts_with($normalizedRoute, 'bids/options')) {
    $db = getDbConnection();
    $bidId = (int)($_GET['bid_id'] ?? $body['bid_id'] ?? 0);

    if ($method === 'DELETE') {
        $id = $body['id'] ?? $_GET['id'] ?? 0;
        if ($db && $id) {
            $db->prepare("DELETE FROM bid_options WHERE id = ?")->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Option removed']);
            exit;
        }
    }

    if ($method === 'POST') {
        $optName = trim($body['option_name'] ?? '');
        $val = trim($body['value'] ?? '');
        if ($db && $bidId && $optName) {
            $ins = $db->prepare("INSERT INTO bid_options (bid_id, option_name, value, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
            $ins->execute([$bidId, $optName, $val]);
            echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
            exit;
        }
    }

    if ($db && $bidId) {
        $stmt = $db->prepare("SELECT * FROM bid_options WHERE bid_id = ? ORDER BY id ASC");
        $stmt->execute([$bidId]);
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }
    echo json_encode(['success' => true, 'data' => []]);
    exit;
}
"""

if "8f. Traffic Leads Log" not in code:
    code = code.replace("// -------------------------------------------------------------\n// 8e. Client & Supplier Multi-Contact Persons", new_endpoints + "\n// -------------------------------------------------------------\n// 8e. Client & Supplier Multi-Contact Persons")

with open('api/index.php', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("Added all missing endpoints to api/index.php successfully!")
