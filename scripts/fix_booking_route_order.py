with open('api/index.php', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove the one at bottom if exists
booking_snippet = """// -------------------------------------------------------------
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
}"""

if booking_snippet in code:
    code = code.replace(booking_snippet, "")

# Place it right after bids/convert
target = "if ($normalizedRoute === 'bids/convert' && ($method === 'POST' || $method === 'PUT')) {"
code = code.replace(
    target,
    booking_snippet + "\n\n" + target
)

with open('api/index.php', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("Moved bids/send-booking-email before general bids handler!")
