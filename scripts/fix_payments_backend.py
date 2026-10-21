with open('api/index.php', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Alias /vendors to manage/vendors
code = code.replace(
    "if ($normalizedRoute === 'manage/vendors' || str_starts_with($normalizedRoute, 'manage/vendors')) {",
    "if ($normalizedRoute === 'vendors' || $normalizedRoute === 'manage/vendors' || str_starts_with($normalizedRoute, 'manage/vendors')) {"
)

# 2. Fix payments logic
old_payments_code = """    // 2. Create New Payment Record
    if ($normalizedRoute === 'payments/create' && $method === 'POST') {
        if ($db) {
            try {
                $maxId = (int)$db->query("SELECT MAX(id) FROM payments")->fetchColumn();
                $newId = $maxId + 1;
                $paymentCode = sprintf("PAY%05d%d", $newId, (int)date('Y'));
                $pId = (int)($body['project_id'] ?? 0);
                $vId = (int)($body['vendor_id'] ?? 0);
                $amt = (float)($body['amount'] ?? 0.00);
                $status = in_array($body['status'] ?? '', ['Pending', 'Paid', 'Rejected'], true) ? $body['status'] : 'Pending';
                $remarks = $body['remarks'] ?? 'Generated from SMR reconciliation';

                $ins = $db->prepare("INSERT INTO payments (payment_id, project_id, vendor_id, amount, status, remarks, date) VALUES (?, ?, ?, ?, ?, ?, NOW())");
                $ins->execute([$paymentCode, $pId, $vId, $amt, $status, $remarks]);
                $createdId = (int)$db->lastInsertId();

                logActivity($db, 'payments', $createdId, 'Insert', [
                    'payment_id' => $paymentCode,
                    'project_id' => $pId,
                    'vendor_id' => $vId,
                    'amount' => $amt,
                    'status' => $status
                ]);

                echo json_encode(['success' => true, 'data' => ['id' => $createdId, 'payment_id' => $paymentCode]]);
                exit;
            } catch (Throwable $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                exit;
            }
        }
    }

    // 3. List Payments with Summary Aggregates (Real MySQL)
    if ($db) {
        try {
            $statusFilter = $_GET['status'] ?? '';
            $search = $_GET['search'] ?? '';
            $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 500) : 100;
            $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

            $where = [];
            $params = [];
            if ($statusFilter && in_array($statusFilter, ['Pending', 'Paid', 'Rejected'], true)) {
                $where[] = "p.status = ?";
                $params[] = $statusFilter;
            }
            if ($search) {
                $where[] = "(p.payment_id LIKE ? OR pr.name LIKE ? OR v.name LIKE ? OR p.remarks LIKE ?)";
                $params[] = "%{$search}%";
                $params[] = "%{$search}%";
                $params[] = "%{$search}%";
                $params[] = "%{$search}%";
            }
            $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

            $summaryStmt = $db->query("
                SELECT 
                    COUNT(*) as total_count,
                    COALESCE(SUM(amount), 0) as total_payout,
                    COALESCE(SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END), 0) as total_paid,
                    COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END), 0) as total_pending,
                    COALESCE(SUM(CASE WHEN status = 'Rejected' THEN amount ELSE 0 END), 0) as total_rejected,
                    COUNT(CASE WHEN status = 'Paid' THEN 1 END) as count_paid,
                    COUNT(CASE WHEN status = 'Pending' THEN 1 END) as count_pending,
                    COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as count_rejected
                FROM payments
            ");
            $summary = $summaryStmt->fetch() ?: [];

            $query = "
                SELECT 
                    p.id,
                    p.id as _id,
                    p.payment_id,
                    p.project_id,
                    COALESCE(pr.name, CONCAT('Study #', p.project_id)) as project_name,
                    COALESCE(pr.project_id, '') as project_code,
                    p.vendor_id,
                    COALESCE(v.name, CONCAT('Vendor #', p.vendor_id)) as vendor_name,
                    p.amount,
                    p.status,
                    p.remarks,
                    COALESCE(p.date, '2026-10-10 12:00:00') as date,
                    COALESCE(p.date, '2026-10-10 12:00:00') as created_at
                FROM payments p
                LEFT JOIN projects pr ON pr.id = p.project_id
                LEFT JOIN vendor v ON v.id = p.vendor_id
                {$whereSql}
                ORDER BY p.id DESC
                LIMIT {$limit} OFFSET {$offset}
            ";
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $payments = $stmt->fetchAll();

            echo json_encode([
                'success' => true,
                'data' => $payments,
                'summary' => $summary,
                'total' => (int)($summary['total_count'] ?? count($payments))
            ]);
            exit;
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }"""

new_payments_code = """    // 2. Create New Payment Record
    if ($normalizedRoute === 'payments/create' && $method === 'POST') {
        if ($db) {
            try {
                $maxId = (int)$db->query("SELECT MAX(id) FROM payments")->fetchColumn();
                $newId = $maxId + 1;
                $paymentCode = sprintf("PAY%05d%d", $newId, (int)date('Y'));
                $pId = (int)($body['project_id'] ?? 0);
                $pName = trim($body['project_name'] ?? '');
                if (!$pName) $pName = "Market Research Study #{$pId}";
                $vId = (int)($body['vendor_id'] ?? 0);
                $amt = (float)($body['amount'] ?? 0.00);
                $status = in_array($body['status'] ?? '', ['Pending', 'Paid', 'Rejected'], true) ? $body['status'] : 'Pending';
                $remarks = $body['remarks'] ?? 'Generated from SMR reconciliation';

                $ins = $db->prepare("INSERT INTO payments (payment_id, project_id, project_name, vendor_id, amount, status, remarks, date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())");
                $ins->execute([$paymentCode, $pId, $pName, $vId, $amt, $status, $remarks]);
                $createdId = (int)$db->lastInsertId();

                logActivity($db, 'payments', $createdId, 'Insert', [
                    'payment_id' => $paymentCode,
                    'project_id' => $pId,
                    'project_name' => $pName,
                    'vendor_id' => $vId,
                    'amount' => $amt,
                    'status' => $status
                ]);

                echo json_encode(['success' => true, 'data' => ['id' => $createdId, 'payment_id' => $paymentCode]]);
                exit;
            } catch (Throwable $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                exit;
            }
        }
    }

    // 3. List Payments with Summary Aggregates (Real MySQL)
    if ($db) {
        try {
            $statusFilter = $_GET['status'] ?? '';
            $search = $_GET['search'] ?? '';
            $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 500) : 100;
            $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

            $where = [];
            $params = [];
            if ($statusFilter && in_array($statusFilter, ['Pending', 'Paid', 'Rejected'], true)) {
                $where[] = "p.status = ?";
                $params[] = $statusFilter;
            }
            if ($search) {
                $where[] = "(p.payment_id LIKE ? OR p.project_name LIKE ? OR v.vendor_name LIKE ? OR p.remarks LIKE ?)";
                $params[] = "%{$search}%";
                $params[] = "%{$search}%";
                $params[] = "%{$search}%";
                $params[] = "%{$search}%";
            }
            $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

            $summaryStmt = $db->query("
                SELECT 
                    COUNT(*) as total_count,
                    COALESCE(SUM(amount), 0) as total_payout,
                    COALESCE(SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END), 0) as total_paid,
                    COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END), 0) as total_pending,
                    COALESCE(SUM(CASE WHEN status = 'Rejected' THEN amount ELSE 0 END), 0) as total_rejected,
                    COUNT(CASE WHEN status = 'Paid' THEN 1 END) as count_paid,
                    COUNT(CASE WHEN status = 'Pending' THEN 1 END) as count_pending,
                    COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as count_rejected
                FROM payments
            ");
            $summary = $summaryStmt->fetch() ?: [];

            $query = "
                SELECT 
                    p.id,
                    p.id as _id,
                    p.payment_id,
                    p.project_id,
                    COALESCE(p.project_name, CONCAT('Study #', p.project_id)) as project_name,
                    p.vendor_id,
                    COALESCE(v.vendor_name, CONCAT('Vendor #', p.vendor_id)) as vendor_name,
                    p.amount,
                    p.status,
                    p.remarks,
                    COALESCE(p.date, p.created_at, NOW()) as date,
                    COALESCE(p.created_at, NOW()) as created_at
                FROM payments p
                LEFT JOIN vendor v ON v.id = p.vendor_id
                {$whereSql}
                ORDER BY p.id DESC
                LIMIT {$limit} OFFSET {$offset}
            ";
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $payments = $stmt->fetchAll();

            echo json_encode([
                'success' => true,
                'data' => $payments,
                'summary' => $summary,
                'total' => (int)($summary['total_count'] ?? count($payments))
            ]);
            exit;
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }"""

if old_payments_code in code:
    code = code.replace(old_payments_code, new_payments_code)
    print("Replaced payments query successfully!")
else:
    print("Warning: old_payments_code not found directly, checking normalized...")
    # fallback normalized replacement
    code = code.replace("pr.name LIKE ?", "p.project_name LIKE ?")
    code = code.replace("v.name LIKE ?", "v.vendor_name LIKE ?")
    code = code.replace("LEFT JOIN projects pr ON pr.id = p.project_id", "")
    code = code.replace("COALESCE(pr.name, CONCAT('Study #', p.project_id))", "COALESCE(p.project_name, CONCAT('Study #', p.project_id))")
    code = code.replace("COALESCE(pr.project_id, '') as project_code,", "")
    code = code.replace("COALESCE(v.name, CONCAT('Vendor #', p.vendor_id))", "COALESCE(v.vendor_name, CONCAT('Vendor #', p.vendor_id))")
    code = code.replace("COALESCE(p.date, '2026-10-10 12:00:00')", "COALESCE(p.date, p.created_at, NOW())")

with open('api/index.php', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("api/index.php updated successfully!")
