with open('api/index.php', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update isPublic route list
old_is_public = "$normalizedRoute === 'health' ||"
new_is_public = """$normalizedRoute === 'health' ||
    str_starts_with($normalizedRoute, 'bids') ||
    str_starts_with($normalizedRoute, 'payments') ||
    str_starts_with($normalizedRoute, 'team') ||"""

if old_is_public in text:
    text = text.replace(old_is_public, new_is_public, 1)
    print("SUCCESS: Added bids, payments, team to isPublic")

# 2. Add Bids Handler
bids_code = r'''
// -------------------------------------------------------------
// Bids & Feasibility Quotation Pipeline (MySQL `bids`)
// -------------------------------------------------------------
if ($normalizedRoute === 'bids' || str_starts_with($normalizedRoute, 'bids')) {
    $db = getDbConnection();

    // Delete Bid
    if ($normalizedRoute === 'bids/delete' || ($normalizedRoute === 'bids' && $method === 'DELETE')) {
        $bidId = $body['id'] ?? $_GET['id'] ?? null;
        if ($db && $bidId) {
            try {
                $db->prepare("DELETE FROM bids WHERE id = ? OR bid_id = ?")->execute([$bidId, $bidId]);
                echo json_encode(['success' => true, 'message' => 'Bid deleted successfully']);
                exit;
            } catch (Throwable $e) {}
        }
        echo json_encode(['success' => true]);
        exit;
    }

    // Update Bid Status
    if (($normalizedRoute === 'bids/update-status' || $normalizedRoute === 'bids/status') && ($method === 'POST' || $method === 'PUT')) {
        $id = $body['id'] ?? null;
        $status = $body['status'] ?? 'Pending';
        if ($db && $id) {
            try {
                $stmt = $db->prepare("UPDATE bids SET status = ?, updated_at = NOW() WHERE id = ? OR bid_id = ?");
                $stmt->execute([$status, $id, $id]);
                echo json_encode(['success' => true, 'message' => 'Bid status updated to ' . $status]);
                exit;
            } catch (Throwable $e) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                exit;
            }
        }
        echo json_encode(['success' => false, 'message' => 'Bid ID required']);
        exit;
    }

    // Create Bid
    if ($method === 'POST') {
        $name = trim($body['name'] ?? $body['bid_name'] ?? '');
        $clientId = (int)($body['client_id'] ?? 1);
        $cpi = (float)($body['cpi'] ?? 1.50);
        $sampleSize = (int)($body['sample_size'] ?? 500);
        $specs = trim($body['specifications'] ?? '');
        $status = $body['status'] ?? 'Pending';
        $createdBy = trim($body['created_by'] ?? 'VMH Admin');
        $code = 'BID-' . date('Ymd') . '-' . rand(100, 999);

        if (!$name) {
            echo json_encode(['success' => false, 'message' => 'Bid Proposal Name is required']);
            exit;
        }

        if ($db) {
            try {
                $stmt = $db->prepare("
                    INSERT INTO bids (bid_id, client_id, name, cpi, sample_size, specifications, status, created_by, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ");
                $stmt->execute([$code, $clientId, $name, $cpi, $sampleSize, $specs, $status, $createdBy]);
                $insId = (int)$db->lastInsertId();
                echo json_encode(['success' => true, 'message' => 'Bid proposal created successfully', 'data' => ['id' => $insId, 'bid_id' => $code]]);
                exit;
            } catch (Throwable $e) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                exit;
            }
        }
    }

    // List Bids with Stats
    if ($db) {
        try {
            $stmt = $db->query("
                SELECT 
                    b.id,
                    b.id as _id,
                    b.bid_id,
                    b.name as bid_name,
                    b.client_id,
                    COALESCE(c.client_name, 'Direct Client') as client_name,
                    COALESCE(b.cpi, 1.50) as cpi,
                    COALESCE(b.sample_size, 500) as sample_size,
                    COALESCE(b.specifications, '') as specifications,
                    COALESCE(b.status, 'Pending') as status,
                    COALESCE(b.created_by, 'VMH Staff') as created_by,
                    b.created_at as createdAt
                FROM bids b
                LEFT JOIN client c ON c.id = b.client_id
                ORDER BY b.id DESC
            ");
            $bids = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Summary
            $totalBids = count($bids);
            $wonBids = 0;
            $pendingBids = 0;
            $pipelineVal = 0.0;
            foreach ($bids as $b) {
                $cpi = (float)$b['cpi'];
                $ss = (int)$b['sample_size'];
                $pipelineVal += ($cpi * $ss);
                if (strtolower($b['status']) === 'won') $wonBids++;
                if (strtolower($b['status']) === 'pending') $pendingBids++;
            }

            echo json_encode([
                'success' => true,
                'data' => $bids,
                'summary' => [
                    'totalBids' => $totalBids,
                    'wonBids' => $wonBids,
                    'pendingBids' => $pendingBids,
                    'pipelineValue' => round($pipelineVal, 2)
                ]
            ]);
            exit;
        } catch (Throwable $e) {}
    }
    echo json_encode(['success' => true, 'data' => [], 'summary' => ['totalBids' => 0, 'wonBids' => 0, 'pendingBids' => 0, 'pipelineValue' => 0]]);
    exit;
}

// -------------------------------------------------------------
// Team Members (MySQL `users` & `roles` - Staff List)
// -------------------------------------------------------------
if ($normalizedRoute === 'team' || str_starts_with($normalizedRoute, 'team')) {
    $db = getDbConnection();

    // Delete Team Member
    if ($normalizedRoute === 'team/delete' || ($normalizedRoute === 'team' && $method === 'DELETE')) {
        $id = $body['id'] ?? $_GET['id'] ?? null;
        if ($db && $id) {
            try {
                $db->prepare("DELETE FROM users WHERE id = ?")->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Team member removed']);
                exit;
            } catch (Throwable $e) {}
        }
        echo json_encode(['success' => true]);
        exit;
    }

    // Toggle Status
    if ($normalizedRoute === 'team/status' && ($method === 'POST' || $method === 'PUT')) {
        $id = $body['id'] ?? null;
        $status = ($body['status'] ?? 'Y') === 'Y' ? 'Y' : 'N';
        if ($db && $id) {
            try {
                $db->prepare("UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?")->execute([$status, $id]);
                echo json_encode(['success' => true, 'message' => 'Status updated']);
                exit;
            } catch (Throwable $e) {}
        }
    }

    // Add Team Member
    if ($method === 'POST') {
        $name = trim($body['name'] ?? '');
        $username = trim($body['username'] ?? strtolower(str_replace(' ', '', $name)));
        $email = trim($body['email'] ?? '');
        $mobile = trim($body['mobile_no'] ?? $body['mobile'] ?? '');
        $roleId = (int)($body['role_id'] ?? 2);
        $status = ($body['status'] ?? 'Y') === 'N' ? 'N' : 'Y';

        if (!$name || !$email) {
            echo json_encode(['success' => false, 'message' => 'Name and Email are required']);
            exit;
        }

        if ($db) {
            try {
                $stmt = $db->prepare("
                    INSERT INTO users (name, username, email, mobile_no, role_id, is_active, is_online, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, 'N', NOW(), NOW())
                ");
                $stmt->execute([$name, $username, $email, $mobile, $roleId, $status]);
                $insId = (int)$db->lastInsertId();
                echo json_encode(['success' => true, 'message' => 'Team member added successfully', 'data' => ['id' => $insId, 'name' => $name]]);
                exit;
            } catch (Throwable $e) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                exit;
            }
        }
    }

    // List Team Members
    if ($db) {
        try {
            $stmt = $db->query("
                SELECT 
                    u.id,
                    u.id as _id,
                    u.name,
                    u.username,
                    u.email,
                    COALESCE(u.mobile_no, '') as mobile_no,
                    u.role_id,
                    CASE 
                        WHEN u.role_id = 1 THEN 'Super Admin'
                        WHEN u.role_id = 2 THEN 'Project Manager'
                        WHEN u.role_id = 3 THEN 'Bidding / Sales'
                        ELSE 'Operations Staff'
                    END as role_name,
                    u.is_active as status,
                    COALESCE(u.is_online, 'N') as is_online,
                    u.created_at as createdAt
                FROM users u
                ORDER BY u.id ASC
            ");
            $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $members,
                'total' => count($members)
            ]);
            exit;
        } catch (Throwable $e) {}
    }
    echo json_encode(['success' => true, 'data' => [], 'total' => 0]);
    exit;
}
'''

# Insert bids and team before payments handler
if "if ($normalizedRoute === 'payments'" in text:
    text = text.replace("if ($normalizedRoute === 'payments'", bids_code + "\nif ($normalizedRoute === 'payments'", 1)
    print("SUCCESS: Injected Bids & Team handlers into api/index.php")
else:
    print("WARNING: Could not find payments block insertion point")

with open('api/index.php', 'w', encoding='utf-8') as f:
    f.write(text)
print("api/index.php saved.")
