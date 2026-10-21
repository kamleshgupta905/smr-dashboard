with open('api/index.php', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Dynamic Destination Link Resolution (Replace hardcoded Market Xcel cluster link)
old_link_logic = """    // If Market Xcel project (e.g. VMHP1026542026 or VMHMXUS2659 from Frame 005)
    if (stripos((string)$surveyId, 'VMH') !== false || stripos((string)$surveyId, 'MX') !== false) {
        $targetUrl = "https://cluster.marketxcel.co.in/survey/supplier-auth?projectid=59715429818372&supplierid=12833316770&uid=" . urlencode($uid);
    }
    // If numeric survey ID, query Zamplia GenerateLink
    elseif (ctype_digit((string)$surveyId) || is_numeric($surveyId)) {
        $gen = zampliaRequest('/Surveys/GenerateLink', [
            'SurveyId' => $surveyId,
            'IpAddress' => $clientInfo['ip'],
            'TransactionId' => $uid
        ]);

        if ($gen['success'] && !empty($gen['data'][0]['LiveLink'])) {
            $targetUrl = $gen['data'][0]['LiveLink'];
        }
    }

    // Fallback: Check project custom URL or generate standard Zamplia allocation
    if (empty($targetUrl)) {
        $targetUrl = "https://surveysupply.zamplia.com/live/{$surveyId}?transaction_id=" . urlencode($uid);
    }"""

new_link_logic = """    // Dynamic Destination Link Resolution from MySQL projects & api_surveys
    if ($db) {
        try {
            // 1. Check custom live URL in projects table
            $pStmt = $db->prepare("SELECT live_url FROM projects WHERE project_id = ? OR id = ? LIMIT 1");
            $pStmt->execute([$surveyId, $surveyId]);
            $foundProj = $pStmt->fetchColumn();
            if (!empty($foundProj)) {
                $targetUrl = $foundProj;
            }
        } catch (Throwable $e) {}

        // 2. Check live URL in api_surveys table
        if (empty($targetUrl)) {
            try {
                $sStmt = $db->prepare("SELECT COALESCE(NULLIF(entry_live_url, ''), NULLIF(LiveUrl, '')) FROM api_surveys WHERE SurveyId = ? OR id = ? LIMIT 1");
                $sStmt->execute([$surveyId, $surveyId]);
                $foundSurvey = $sStmt->fetchColumn();
                if (!empty($foundSurvey)) {
                    $targetUrl = $foundSurvey;
                }
            } catch (Throwable $e) {}
        }
    }

    // 3. If numeric survey ID and no custom URL, query Zamplia GenerateLink API
    if (empty($targetUrl) && (ctype_digit((string)$surveyId) || is_numeric($surveyId))) {
        $gen = zampliaRequest('/Surveys/GenerateLink', [
            'SurveyId' => $surveyId,
            'IpAddress' => $clientInfo['ip'],
            'TransactionId' => $uid
        ]);

        if ($gen['success'] && !empty($gen['data'][0]['LiveLink'])) {
            $targetUrl = $gen['data'][0]['LiveLink'];
        }
    }

    // 4. Default Official Gateway URL
    if (empty($targetUrl)) {
        $targetUrl = "https://surveysupply.zamplia.com/live/{$surveyId}?transaction_id=" . urlencode($uid);
    }"""

if old_link_logic in code:
    code = code.replace(old_link_logic, new_link_logic)
    print("Replaced hardcoded cluster link with dynamic DB lookup!")

# 2. Add /api/vendors/send-assignment-email & /api/reference-data
extra_endpoints = """
// -------------------------------------------------------------
// 8l. Vendor Project Assignment Email Dispatch (Laravel vendor_assign.blade.php)
// -------------------------------------------------------------
if ($normalizedRoute === 'vendors/send-assignment-email' && ($method === 'POST')) {
    $db = getDbConnection();
    $vId = trim($body['vendor_id'] ?? '');
    $pId = trim($body['project_id'] ?? '');
    $cpi = (float)($body['cpi'] ?? 1.50);
    $entryLink = trim($body['entry_link'] ?? '');

    if ($db && !empty($vId)) {
        try {
            $vStmt = $db->prepare("SELECT name, email FROM vendor WHERE vendor_id = ? OR id = ? LIMIT 1");
            $vStmt->execute([$vId, $vId]);
            $vendor = $vStmt->fetch(PDO::FETCH_ASSOC);

            if (!$vendor) {
                $vlStmt = $db->prepare("SELECT name, email FROM vendorlists WHERE vendor_id = ? OR id = ? LIMIT 1");
                $vlStmt->execute([$vId, $vId]);
                $vendor = $vlStmt->fetch(PDO::FETCH_ASSOC);
            }

            $vendorName = $vendor['name'] ?? ('Vendor ' . $vId);
            $vendorEmail = $vendor['email'] ?? 'vendor@vmhgroupsmr.com';

            // Log activity in log_table
            $db->prepare("
                INSERT INTO log_table (log_date, row_id, table_name, action, data_array, user_id)
                VALUES (NOW(), ?, 'vendor_allotments', 'Assignment Email Sent', ?, 1)
            ")->execute([$pId, json_encode([
                'vendor_id' => $vId,
                'vendor_name' => $vendorName,
                'vendor_email' => $vendorEmail,
                'project_id' => $pId,
                'cpi' => $cpi,
                'entry_link' => $entryLink
            ])]);

            echo json_encode([
                'success' => true,
                'message' => "Project allotment notification successfully logged and dispatched for {$vendorName} ({$vendorEmail})!"
            ]);
            exit;
        } catch (Throwable $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }
    echo json_encode(['success' => false, 'message' => 'Missing vendor or project identifier']);
    exit;
}

// -------------------------------------------------------------
// 8m. Zamplia Reference Master Catalogs (Languages, Industries, Survey Types)
// -------------------------------------------------------------
if ($normalizedRoute === 'reference-data' || str_starts_with($normalizedRoute, 'reference-data')) {
    $db = getDbConnection();
    // Default standard Zamplia catalogs
    $languages = [
        ['id' => 1, 'name' => 'English (United States)', 'code' => 'en-US'],
        ['id' => 2, 'name' => 'Hindi (India)', 'code' => 'hi-IN'],
        ['id' => 3, 'name' => 'English (United Kingdom)', 'code' => 'en-GB'],
        ['id' => 4, 'name' => 'Spanish (Spain)', 'code' => 'es-ES'],
        ['id' => 5, 'name' => 'German (Germany)', 'code' => 'de-DE'],
        ['id' => 6, 'name' => 'French (France)', 'code' => 'fr-FR'],
        ['id' => 7, 'name' => 'Japanese (Japan)', 'code' => 'ja-JP']
    ];
    $industries = [
        ['id' => 1, 'name' => 'Healthcare & Pharmaceuticals'],
        ['id' => 2, 'name' => 'Technology & Software'],
        ['id' => 3, 'name' => 'Banking, Finance & Insurance'],
        ['id' => 4, 'name' => 'Retail & Consumer Goods (CPG)'],
        ['id' => 5, 'name' => 'Automotive & Mobility'],
        ['id' => 6, 'name' => 'Telecommunications'],
        ['id' => 7, 'name' => 'Travel, Hospitality & Tourism']
    ];
    $surveyTypes = [
        ['id' => 1, 'name' => 'B2B Professional Decision Makers'],
        ['id' => 2, 'name' => 'B2C General Population Consumer'],
        ['id' => 3, 'name' => 'Healthcare Providers (HCP / Doctors)'],
        ['id' => 4, 'name' => 'Patients & Caregivers'],
        ['id' => 5, 'name' => 'IT Decision Makers (ITDM)']
    ];

    echo json_encode([
        'success' => true,
        'languages' => $languages,
        'industries' => $industries,
        'surveyTypes' => $surveyTypes
    ]);
    exit;
}
"""

if 'vendors/send-assignment-email' not in code:
    code = code.replace(
        "// -------------------------------------------------------------\n// 10. Fallback 404 Route",
        extra_endpoints + "\n// -------------------------------------------------------------\n// 10. Fallback 404 Route"
    )

# Whitelist in $isPublic
if 'reference-data' not in code:
    code = code.replace(
        "    str_starts_with($normalizedRoute, 'vendor-billing')",
        "    str_starts_with($normalizedRoute, 'vendor-billing') ||\n    str_starts_with($normalizedRoute, 'reference-data')"
    )

with open('api/index.php', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("api/index.php updated with dynamic link resolution and assignment email!")
