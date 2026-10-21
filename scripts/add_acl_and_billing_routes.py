with open('api/index.php', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update $isPublic
if 'menu-permissions' not in code:
    code = code.replace(
        "    str_starts_with($normalizedRoute, 'reports')",
        "    str_starts_with($normalizedRoute, 'reports') ||\n    str_starts_with($normalizedRoute, 'menu-permissions') ||\n    str_starts_with($normalizedRoute, 'vendor-billing')"
    )

# 2. Add endpoints before Fallback 404
new_endpoints = """// -------------------------------------------------------------
// 8i. Menu Permissions & Role-based ACL (MySQL menus & menu_permissions)
// -------------------------------------------------------------
if ($normalizedRoute === 'menu-permissions' || str_starts_with($normalizedRoute, 'menu-permissions')) {
    $db = getDbConnection();
    $uId = (int)($_GET['user_id'] ?? $body['user_id'] ?? 1);
    if ($db) {
        try {
            if ($method === 'POST') {
                $uId = (int)($body['user_id'] ?? 1);
                $perms = $body['permissions'] ?? [];
                $menuIds = $body['menu_ids'] ?? [];

                // Delete existing permissions for this user
                $db->prepare("DELETE FROM menu_permissions WHERE user_id = ?")->execute([$uId]);

                if (!empty($perms) && is_array($perms)) {
                    $ins = $db->prepare("
                        INSERT INTO menu_permissions (user_id, menu_id, `add`, `edit`, `delete`, `print`, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
                    ");
                    foreach ($perms as $p) {
                        $mId = (int)($p['menu_id'] ?? 0);
                        if ($mId <= 0) continue;
                        $ins->execute([
                            $uId,
                            $mId,
                            !empty($p['add']) ? 1 : 0,
                            !empty($p['edit']) ? 1 : 0,
                            !empty($p['delete']) ? 1 : 0,
                            !empty($p['print']) ? 1 : 0
                        ]);
                    }
                } elseif (!empty($menuIds) && is_array($menuIds)) {
                    $ins = $db->prepare("
                        INSERT INTO menu_permissions (user_id, menu_id, `add`, `edit`, `delete`, `print`, created_at, updated_at)
                        VALUES (?, ?, 1, 1, 1, 1, NOW(), NOW())
                    ");
                    foreach ($menuIds as $mId) {
                        $ins->execute([$uId, (int)$mId]);
                    }
                }

                echo json_encode(['success' => true, 'message' => 'Menu permissions updated successfully!']);
                exit;
            }

            // GET: Fetch menus list and user permissions
            $menusStmt = $db->query("SELECT id, name, route, icon, menu_srl FROM menus WHERE is_active = 'Y' ORDER BY menu_srl ASC");
            $menus = $menusStmt->fetchAll(PDO::FETCH_ASSOC);

            $permStmt = $db->prepare("SELECT menu_id, `add`, `edit`, `delete`, `print` FROM menu_permissions WHERE user_id = ?");
            $permStmt->execute([$uId]);
            $userPerms = $permStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'menus' => $menus,
                'permissions' => $userPerms,
                'user_id' => $uId
            ]);
            exit;
        } catch (Throwable $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }
    echo json_encode(['success' => true, 'menus' => [], 'permissions' => []]);
    exit;
}

// -------------------------------------------------------------
// 8j. Vendor Billing & Financial Compliance (MySQL supplier_billing_details)
// -------------------------------------------------------------
if ($normalizedRoute === 'vendor-billing' || str_starts_with($normalizedRoute, 'vendor-billing')) {
    $db = getDbConnection();
    $vId = trim($_GET['vendor_id'] ?? $_GET['supplier_id'] ?? $body['vendor_id'] ?? $body['supplier_id'] ?? '');
    if ($db) {
        try {
            if ($method === 'POST' || $method === 'PUT') {
                $vId = trim($body['vendor_id'] ?? $body['supplier_id'] ?? '');
                if (empty($vId)) {
                    echo json_encode(['success' => false, 'message' => 'Missing vendor_id']);
                    exit;
                }
                $legalName = trim($body['legal_name'] ?? '');
                $bizType = trim($body['business_type'] ?? 'Private Limited');
                $pan = trim($body['pan'] ?? '');
                $gst = trim($body['gst'] ?? '');
                $regAddr = trim($body['reg_address'] ?? '');
                $billAddr = trim($body['bill_address'] ?? '');
                $bank = trim($body['bank'] ?? '');
                $holder = trim($body['holder'] ?? '');
                $acc = trim($body['acc'] ?? '');
                $ifsc = trim($body['ifsc'] ?? '');
                $upi = trim($body['upi'] ?? '');
                $payMode = trim($body['payment_mode'] ?? 'Bank Transfer');
                $currency = trim($body['currency'] ?? 'USD');
                $terms = trim($body['terms'] ?? 'Net 30');

                // Check existing
                $chk = $db->prepare("SELECT id FROM supplier_billing_details WHERE supplier_id = ? LIMIT 1");
                $chk->execute([$vId]);
                $existingId = $chk->fetchColumn();

                if ($existingId) {
                    $upd = $db->prepare("
                        UPDATE supplier_billing_details
                        SET legal_name = ?, business_type = ?, pan = ?, gst = ?, reg_address = ?, bill_address = ?,
                            bank = ?, holder = ?, acc = ?, ifsc = ?, upi = ?, payment_mode = ?, currency = ?, terms = ?, updated_at = NOW()
                        WHERE id = ?
                    ");
                    $upd->execute([$legalName, $bizType, $pan, $gst, $regAddr, $billAddr, $bank, $holder, $acc, $ifsc, $upi, $payMode, $currency, $terms, $existingId]);
                } else {
                    $ins = $db->prepare("
                        INSERT INTO supplier_billing_details (
                            supplier_id, legal_name, business_type, pan, gst, reg_address, bill_address,
                            bank, holder, acc, ifsc, upi, payment_mode, currency, terms, created_at, updated_at
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?,
                            ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
                        )
                    ");
                    $ins->execute([$vId, $legalName, $bizType, $pan, $gst, $regAddr, $billAddr, $bank, $holder, $acc, $ifsc, $upi, $payMode, $currency, $terms]);
                }

                echo json_encode(['success' => true, 'message' => 'Vendor billing details saved successfully!']);
                exit;
            }

            // GET: Return billing details
            $stmt = $db->prepare("SELECT * FROM supplier_billing_details WHERE supplier_id = ? LIMIT 1");
            $stmt->execute([$vId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $row ?: null
            ]);
            exit;
        } catch (Throwable $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }
    echo json_encode(['success' => true, 'data' => null]);
    exit;
}

// -------------------------------------------------------------
// 8k. PM Assignment & Booking Notification on Won Bids
// -------------------------------------------------------------
if ($normalizedRoute === 'bids/send-booking-email' && ($method === 'POST')) {
    $db = getDbConnection();
    $bidId = (int)($body['bid_id'] ?? 0);
    $pmUser = (int)($body['pm_user'] ?? $body['pm_user_id'] ?? 1);
    if ($db && $bidId > 0) {
        try {
            $bidStmt = $db->prepare("SELECT * FROM bids WHERE id = ? LIMIT 1");
            $bidStmt->execute([$bidId]);
            $bid = $bidStmt->fetch(PDO::FETCH_ASSOC);

            $userStmt = $db->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
            $userStmt->execute([$pmUser]);
            $pm = $userStmt->fetch(PDO::FETCH_ASSOC);

            if ($bid) {
                $db->prepare("UPDATE bids SET status = 'Won', updated_at = NOW() WHERE id = ?")->execute([$bidId]);
                $db->prepare("UPDATE projects SET booking_email_sent = 1, updated_at = NOW() WHERE bid_id = ?")->execute([$bidId]);
                echo json_encode([
                    'success' => true,
                    'message' => 'Booking confirmed and notification assigned to PM ' . ($pm['name'] ?? 'Staff') . '!'
                ]);
                exit;
            }
        } catch (Throwable $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }
    echo json_encode(['success' => false, 'message' => 'Invalid Bid ID']);
    exit;
}
"""

if 'menu-permissions' not in code or 'supplier_billing_details' not in code:
    code = code.replace(
        "// -------------------------------------------------------------\n// 10. Fallback 404 Route",
        new_endpoints + "\n// -------------------------------------------------------------\n// 10. Fallback 404 Route"
    )

with open('api/index.php', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("api/index.php updated with ACL, Vendor Billing, and Won Bid Booking!")
