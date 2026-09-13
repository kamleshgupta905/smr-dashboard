<?php
/**
 * SMR • High-Speed Zamplia Supply Engine & API Router
 * Native PHP 8.1+ standalone API for Hostinger LiteSpeed / Apache
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -------------------------------------------------------------
// Configuration
// -------------------------------------------------------------
$ZAMPLIA_BASE_URL = 'https://surveysupply.zamplia.com/api/v1';
$ZAMPLIA_API_KEY  = 'RCgqJ2hfoVZdwgPkwGnjMwTIi0CSKQ2u';
$CACHE_FILE       = sys_get_temp_dir() . '/smr_zamplia_cache.json';
$DATA_DIR         = __DIR__ . '/../data';

if (!is_dir($DATA_DIR)) {
    @mkdir($DATA_DIR, 0755, true);
}

// -------------------------------------------------------------
// Helper: Fast IPv4 cURL
// -------------------------------------------------------------
function zampliaRequest($endpoint, $params = [], $method = 'GET') {
    global $ZAMPLIA_BASE_URL, $ZAMPLIA_API_KEY;

    $url = rtrim($ZAMPLIA_BASE_URL, '/') . '/' . ltrim($endpoint, '/');
    if ($method === 'GET' && !empty($params)) {
        $url .= '?' . http_build_query($params);
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4); // Instant IPv4
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'ZAMP-KEY: ' . $ZAMPLIA_API_KEY,
        'Accept: application/json',
    ]);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'ZAMP-KEY: ' . $ZAMPLIA_API_KEY,
            'Accept: application/json',
            'Content-Type: application/json',
        ]);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        return ['success' => false, 'message' => $err, 'data' => []];
    }

    $json = json_decode($response, true);
    if ($httpCode >= 200 && $httpCode < 300 && isset($json['success']) && $json['success']) {
        return [
            'success' => true,
            'data' => $json['result']['data'] ?? $json['result'] ?? $json['data'] ?? [],
            'raw' => $json
        ];
    }

    return [
        'success' => false,
        'message' => $json['message'] ?? "HTTP error {$httpCode}",
        'data' => []
    ];
}

// -------------------------------------------------------------
// Route Parsing
// -------------------------------------------------------------
$route = $_GET['route'] ?? '';
$route = trim($route, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Handle JSON POST Body
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?? $_POST;

// -------------------------------------------------------------
// Routes
// -------------------------------------------------------------

// Health Check
if ($route === 'health' || $route === 'api/health') {
    echo json_encode([
        'status' => 'OK',
        'service' => 'SMR Zamplia Hostinger LiteSpeed Engine',
        'php_version' => PHP_VERSION,
        'timestamp' => date('c'),
        'uptime' => '24/7 Serverless PHP Active'
    ]);
    exit;
}

// 1. Get Surveys: /api/zamplia or /api/zamplia/surveys
if ($route === 'api/zamplia' || $route === 'api/zamplia/surveys' || $route === 'zamplia' || $route === 'zamplia/surveys') {
    $tab = $_GET['tab'] ?? 'allocated';

    if ($tab === 'top_picks') {
        $res = zampliaRequest('/Surveys/GetTopPickSurveys');
        echo json_encode(['success' => true, 'data' => $res['data'] ?? []]);
        exit;
    }

    // Check 120s Cache
    global $CACHE_FILE;
    if (file_exists($CACHE_FILE) && (time() - filemtime($CACHE_FILE) < 120)) {
        $cached = json_decode(file_get_contents($CACHE_FILE), true);
        if (!empty($cached)) {
            echo json_encode(['success' => true, 'data' => $cached, 'source' => 'cache']);
            exit;
        }
    }

    // Live Fetch
    $res = zampliaRequest('/Surveys/GetAllocatedSurveys');
    if ($res['success'] && !empty($res['data'])) {
        @file_put_contents($CACHE_FILE, json_encode($res['data']));
        echo json_encode(['success' => true, 'data' => $res['data'], 'source' => 'live']);
        exit;
    }

    // Fallback if cache exists
    if (file_exists($CACHE_FILE)) {
        $cached = json_decode(file_get_contents($CACHE_FILE), true);
        echo json_encode(['success' => true, 'data' => $cached, 'source' => 'stale_cache']);
        exit;
    }

    echo json_encode(['success' => false, 'message' => $res['message'] ?? 'Failed to fetch surveys', 'data' => []]);
    exit;
}

// 2. Sync Surveys
if (preg_match('#^api/zamplia/sync#', $route)) {
    $res = zampliaRequest('/Surveys/GetAllocatedSurveys');
    if ($res['success']) {
        @file_put_contents($CACHE_FILE, json_encode($res['data']));
        echo json_encode(['success' => true, 'message' => 'Synced ' . count($res['data']) . ' surveys successfully.', 'count' => count($res['data'])]);
    } else {
        echo json_encode(['success' => false, 'message' => $res['message']]);
    }
    exit;
}

// 3. Top Picks
if (preg_match('#^api/zamplia/top-picks#', $route)) {
    $res = zampliaRequest('/Surveys/GetTopPickSurveys');
    echo json_encode(['success' => true, 'data' => $res['data'] ?? []]);
    exit;
}

// 4. Survey Details: /api/zamplia/details/:id
if (preg_match('#^api/zamplia/details/(\w+)#', $route, $m)) {
    $surveyId = $m[1];
    $details = zampliaRequest('/Surveys/GetSurveyById', ['SurveyId' => $surveyId]);
    $quals   = zampliaRequest('/Surveys/GetSurveyQualifications', ['SurveyId' => $surveyId]);
    $quotas  = zampliaRequest('/Surveys/GetSurveyQuotas', ['SurveyId' => $surveyId]);

    echo json_encode([
        'success' => true,
        'data' => [
            'survey' => $details['data'][0] ?? $details['data'] ?? null,
            'qualifications' => $quals['data'] ?? [],
            'quotas' => $quotas['data'] ?? []
        ]
    ]);
    exit;
}

// 5. Qualifications: /api/zamplia/qualifications/:id
if (preg_match('#^api/zamplia/qualifications/(\w+)#', $route, $m)) {
    $surveyId = $m[1];
    $res = zampliaRequest('/Surveys/GetSurveyQualifications', ['SurveyId' => $surveyId]);
    echo json_encode($res);
    exit;
}

// 6. Quotas: /api/zamplia/quotas/:id
if (preg_match('#^api/zamplia/quotas/(\w+)#', $route, $m)) {
    $surveyId = $m[1];
    $res = zampliaRequest('/Surveys/GetSurveyQuotas', ['SurveyId' => $surveyId]);
    echo json_encode($res);
    exit;
}

// 7. Generate Link: POST /api/zamplia/generate-link
if ($route === 'api/zamplia/generate-link' || $route === 'zamplia/generate-link') {
    $surveyId = $body['surveyId'] ?? '';
    $vendorId = $body['vendorId'] ?? '';
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $txn = $vendorId ?: ('txn_' . time());

    $res = zampliaRequest('/Surveys/GenerateLink', [
        'SurveyId' => $surveyId,
        'IpAddress' => $ip,
        'TransactionId' => $txn
    ]);

    if ($res['success'] && !empty($res['data'][0]['LiveLink'])) {
        echo json_encode([
            'success' => true,
            'liveLink' => $res['data'][0]['LiveLink'],
            'signedLiveLink' => $res['data'][0]['LiveLink'],
            'message' => 'Vendor entry link generated successfully.'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => $res['message'] ?? 'Failed to generate link']);
    }
    exit;
}

// 8. Reference Data: /api/zamplia/reference-data
if ($route === 'api/zamplia/reference-data' || $route === 'zamplia/reference-data') {
    $blocked = zampliaRequest('/Surveys/GetBlockIp');

    $languages = [
        ['LanguageId' => 1, 'LanguageCode' => 'en-US', 'Name' => 'English (United States)', 'NativeName' => 'English'],
        ['LanguageId' => 2, 'LanguageCode' => 'en-GB', 'Name' => 'English (United Kingdom)', 'NativeName' => 'English'],
        ['LanguageId' => 3, 'LanguageCode' => 'en-CA', 'Name' => 'English (Canada)', 'NativeName' => 'English'],
        ['LanguageId' => 4, 'LanguageCode' => 'en-AU', 'Name' => 'English (Australia)', 'NativeName' => 'English'],
        ['LanguageId' => 5, 'LanguageCode' => 'es-ES', 'Name' => 'Spanish (Spain)', 'NativeName' => 'Español'],
        ['LanguageId' => 6, 'LanguageCode' => 'fr-FR', 'Name' => 'French (France)', 'NativeName' => 'Français'],
        ['LanguageId' => 7, 'LanguageCode' => 'de-DE', 'Name' => 'German (Germany)', 'NativeName' => 'Deutsch'],
        ['LanguageId' => 8, 'LanguageCode' => 'hi-IN', 'Name' => 'Hindi (India)', 'NativeName' => 'हिन्दी'],
    ];

    $industries = [
        ['IndustryId' => 1, 'Name' => 'Technology & Software', 'Code' => 'TECH'],
        ['IndustryId' => 2, 'Name' => 'Healthcare & Pharmaceuticals', 'Code' => 'HEALTH'],
        ['IndustryId' => 3, 'Name' => 'Banking & Financial Services', 'Code' => 'FIN'],
        ['IndustryId' => 4, 'Name' => 'Retail & Consumer Goods', 'Code' => 'RETAIL'],
        ['IndustryId' => 5, 'Name' => 'Automotive & Transport', 'Code' => 'AUTO'],
        ['IndustryId' => 6, 'Name' => 'Education & Research', 'Code' => 'EDU'],
    ];

    $types = [
        ['SurveyTypeId' => 1, 'Name' => 'Standard Consumer Panel', 'Description' => 'General opinion surveys'],
        ['SurveyTypeId' => 2, 'Name' => 'B2B / Professional', 'Description' => 'Enterprise decision makers'],
        ['SurveyTypeId' => 3, 'Name' => 'Healthcare Professional (HCP)', 'Description' => 'Medical research'],
    ];

    echo json_encode([
        'success' => true,
        'data' => [
            'languages' => $languages,
            'industries' => $industries,
            'surveyTypes' => $types,
            'blockedIps' => $blocked['data'] ?? []
        ]
    ]);
    exit;
}

// 9. Reconciliation: /api/zamplia/reconciliation
if (preg_match('#^api/zamplia/reconciliation#', $route)) {
    echo json_encode([
        'success' => true,
        'data' => [
            'totalCompletes' => 0,
            'totalTerminates' => 0,
            'totalOverQuota' => 0,
            'records' => []
        ]
    ]);
    exit;
}

// 10. Projects Store: /api/manage/projects
$projectsFile = $DATA_DIR . '/projects.json';
if ($route === 'api/manage/projects') {
    if ($method === 'POST') {
        $list = file_exists($projectsFile) ? json_decode(file_get_contents($projectsFile), true) : [];
        $newProject = array_merge($body, ['id' => 'prj_' . time(), 'createdAt' => date('c')]);
        $list[] = $newProject;
        file_put_contents($projectsFile, json_encode($list, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'data' => $newProject]);
        exit;
    }
    $list = file_exists($projectsFile) ? json_decode(file_get_contents($projectsFile), true) : [];
    echo json_encode(['success' => true, 'data' => $list]);
    exit;
}

// 11. Vendors Store: /api/manage/vendors
$vendorsFile = $DATA_DIR . '/vendors.json';
if ($route === 'api/manage/vendors') {
    if ($method === 'POST') {
        $list = file_exists($vendorsFile) ? json_decode(file_get_contents($vendorsFile), true) : [];
        $newVendor = array_merge($body, ['id' => 'vnd_' . time(), 'createdAt' => date('c')]);
        $list[] = $newVendor;
        file_put_contents($vendorsFile, json_encode($list, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'data' => $newVendor]);
        exit;
    }
    $defaultVendors = [
        ['id' => 'vnd_1', 'name' => 'Panel X Global', 'code' => 'PXG', 'cpi' => 1.20, 'status' => 'Active'],
        ['id' => 'vnd_2', 'name' => 'Prime Opinion Network', 'code' => 'PON', 'cpi' => 0.95, 'status' => 'Active'],
        ['id' => 'vnd_3', 'name' => 'Survey Sampling Asia', 'code' => 'SSA', 'cpi' => 1.10, 'status' => 'Active'],
        ['id' => 'vnd_4', 'name' => 'Direct Consumer Link', 'code' => 'DCL', 'cpi' => 1.00, 'status' => 'Active']
    ];
    $list = file_exists($vendorsFile) ? json_decode(file_get_contents($vendorsFile), true) : $defaultVendors;
    echo json_encode(['success' => true, 'data' => $list]);
    exit;
}

// 12. Participant Redirects / Traffic Router: /redirects
if (preg_match('#^(api/)?redirects#', $route) || preg_match('#^(api/)?vendor#', $route)) {
    $surveyId = $_GET['PID'] ?? $_GET['SurveyId'] ?? '';
    $uid = $_GET['UID'] ?? $_GET['uid'] ?? '';
    $vendorId = $_GET['vendor'] ?? 'default';

    if (!$surveyId) {
        die('Invalid Request: Missing Survey ID');
    }

    $gen = zampliaRequest('/Surveys/GenerateLink', [
        'SurveyId' => $surveyId,
        'IpAddress' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
        'TransactionId' => $uid ?: ('txn_' . time())
    ]);

    if ($gen['success'] && !empty($gen['data'][0]['LiveLink'])) {
        header('Location: ' . $gen['data'][0]['LiveLink']);
        exit;
    }

    echo "Survey allocation unavailable or quota exceeded.";
    exit;
}

// 404 Fallback
http_response_code(404);
echo json_encode(['success' => false, 'message' => "Route not found: {$route}"]);
