with open('api/index.php', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update $isPublic
if "str_starts_with($normalizedRoute, 'client-contacts')" not in code:
    code = code.replace(
        "str_starts_with($normalizedRoute, 'clients') ||",
        "str_starts_with($normalizedRoute, 'clients') ||\n    str_starts_with($normalizedRoute, 'client-contacts') ||\n    str_starts_with($normalizedRoute, 'vendor-contacts') ||"
    )

# 2. Add bids/convert
convert_code = """    // Convert Won Bid to Live Project (Laravel createProjectFromBooking replicate)
    if ($normalizedRoute === 'bids/convert' && ($method === 'POST' || $method === 'PUT')) {
        $id = $body['id'] ?? $body['bid_id'] ?? null;
        if ($db && $id) {
            try {
                $bidStmt = $db->prepare("SELECT * FROM bids WHERE id = ? OR bid_id = ? LIMIT 1");
                $bidStmt->execute([$id, $id]);
                $bid = $bidStmt->fetch(PDO::FETCH_ASSOC);

                if (!$bid) {
                    echo json_encode(['success' => false, 'message' => 'Bid record not found']);
                    exit;
                }

                // Update bid status to Won
                $db->prepare("UPDATE bids SET status = 'Won', updated_at = NOW() WHERE id = ?")->execute([$bid['id']]);

                // Generate Project Code
                $newProjCode = 'PRJ-BID-' . $bid['id'] . '-' . rand(100, 999);
                
                // Insert project
                $projStmt = $db->prepare("
                    INSERT INTO projects (project_id, client_id, bid_id, name, description, cost_per_complete, max_limit, status, date, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', CURDATE(), NOW(), NOW())
                ");
                $projStmt->execute([
                    $newProjCode,
                    $bid['client_id'] ?: 1,
                    $bid['id'],
                    $bid['name'],
                    $bid['specifications'] ?: 'Auto-converted from Won Bid ' . $bid['bid_id'],
                    $bid['cpi'] ?: 1.50,
                    $bid['sample_size'] ?: 500
                ]);
                $newProjId = (int)$db->lastInsertId();

                logActivity($db, 'projects', $newProjId, 'ConvertFromBid', [
                    'bid_id' => $bid['bid_id'],
                    'project_code' => $newProjCode,
                    'name' => $bid['name']
                ]);

                echo json_encode([
                    'success' => true,
                    'message' => "Bid {$bid['bid_id']} converted to live Study #{$newProjCode} successfully!",
                    'data' => [
                        'id' => $newProjId,
                        'project_id' => $newProjCode,
                        'name' => $bid['name']
                    ]
                ]);
                exit;
            } catch (Throwable $e) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                exit;
            }
        }
        echo json_encode(['success' => false, 'message' => 'Bid ID is required']);
        exit;
    }\n\n"""

if "bids/convert" not in code:
    code = code.replace("    // Update Bid Status", convert_code + "    // Update Bid Status")

# 3. Add Client Contacts & Supplier Contacts Handlers
contacts_handlers = """// -------------------------------------------------------------
// 8e. Client & Supplier Multi-Contact Persons (Laravel client_contacts & supplier_contacts)
// -------------------------------------------------------------
if ($normalizedRoute === 'client-contacts' || str_starts_with($normalizedRoute, 'client-contacts')) {
    $db = getDbConnection();

    if ($method === 'DELETE' || $normalizedRoute === 'client-contacts/delete') {
        $id = $body['id'] ?? $_GET['id'] ?? null;
        if ($db && $id) {
            $db->prepare("DELETE FROM client_contacts WHERE id = ?")->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Contact removed']);
            exit;
        }
    }

    if ($method === 'POST') {
        $cId = (int)($body['client_id'] ?? 1);
        $name = trim($body['name'] ?? '');
        $email = trim($body['email'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $isPrimary = (int)($body['is_primary'] ?? 0);
        $billing = (int)($body['billing'] ?? 0);

        if ($db && $name) {
            $stmt = $db->prepare("INSERT INTO client_contacts (client_id, name, email, phone, is_primary, billing, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())");
            $stmt->execute([$cId, $name, $email, $phone, $isPrimary, $billing]);
            echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
            exit;
        }
    }

    // List contacts for a client
    $cId = (int)($_GET['client_id'] ?? $body['client_id'] ?? 0);
    if ($db) {
        $stmt = $db->prepare("SELECT * FROM client_contacts WHERE client_id = ? ORDER BY id ASC");
        $stmt->execute([$cId]);
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }
    echo json_encode(['success' => true, 'data' => []]);
    exit;
}

if ($normalizedRoute === 'vendor-contacts' || str_starts_with($normalizedRoute, 'vendor-contacts')) {
    $db = getDbConnection();

    if ($method === 'DELETE' || $normalizedRoute === 'vendor-contacts/delete') {
        $id = $body['id'] ?? $_GET['id'] ?? null;
        if ($db && $id) {
            $db->prepare("DELETE FROM supplier_contacts WHERE id = ?")->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Vendor contact removed']);
            exit;
        }
    }

    if ($method === 'POST') {
        $vId = (string)($body['vendor_id'] ?? $body['supplier_id'] ?? '');
        $name = trim($body['name'] ?? '');
        $email = trim($body['email'] ?? '');
        $phone = trim($body['phone'] ?? '');

        if ($db && $name) {
            $stmt = $db->prepare("INSERT INTO supplier_contacts (supplier_id, name, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())");
            $stmt->execute([$vId, $name, $email, $phone]);
            echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
            exit;
        }
    }

    // List contacts for a vendor
    $vId = (string)($_GET['vendor_id'] ?? $_GET['supplier_id'] ?? $body['vendor_id'] ?? '');
    if ($db) {
        $stmt = $db->prepare("SELECT * FROM supplier_contacts WHERE supplier_id = ? ORDER BY id ASC");
        $stmt->execute([$vId]);
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }
    echo json_encode(['success' => true, 'data' => []]);
    exit;
}\n\n"""

if "8e. Client & Supplier Multi-Contact Persons" not in code:
    code = code.replace("// -------------------------------------------------------------\n// Team Members (MySQL `users` & `roles`", contacts_handlers + "// -------------------------------------------------------------\n// Team Members (MySQL `users` & `roles`")

with open('api/index.php', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("api/index.php updated with missing backend features!")
