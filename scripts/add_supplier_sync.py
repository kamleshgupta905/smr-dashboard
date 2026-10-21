with open('api/index.php', 'r', encoding='utf-8') as f:
    api = f.read()

target = """                $db->prepare("
                    REPLACE INTO vendor_settings (vendor_id, settings, updated_at)
                    VALUES (?, ?, NOW())
                ")->execute([$code, $extraJson]);"""

sync_code = """                $db->prepare("
                    REPLACE INTO vendor_settings (vendor_id, settings, updated_at)
                    VALUES (?, ?, NOW())
                ")->execute([$code, $extraJson]);

                // Sync to legacy supplier_country and supplier_blocked_clients tables
                try {
                    $vlStmt = $db->prepare("SELECT id FROM vendorlists WHERE vendor_id = ? LIMIT 1");
                    $vlStmt->execute([$code]);
                    $suppId = (int)$vlStmt->fetchColumn();
                    if ($suppId > 0) {
                        if (is_array($countries)) {
                            $db->prepare("DELETE FROM supplier_country WHERE supplier_id = ?")->execute([$suppId]);
                            $cIns = $db->prepare("INSERT INTO supplier_country (supplier_id, country_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())");
                            foreach ($countries as $cItem) {
                                $cId = is_numeric($cItem) ? (int)$cItem : 1;
                                $cIns->execute([$suppId, $cId]);
                            }
                        }
                        if (is_array($blockedClients)) {
                            $db->prepare("DELETE FROM supplier_blocked_clients WHERE supplier_id = ?")->execute([$suppId]);
                            $bIns = $db->prepare("INSERT INTO supplier_blocked_clients (supplier_id, client_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())");
                            foreach ($blockedClients as $bItem) {
                                $bId = is_numeric($bItem) ? (int)$bItem : 1;
                                $bIns->execute([$suppId, $bId]);
                            }
                        }
                    }
                } catch (Throwable $e) {}"""

if 'supplier_country' not in api:
    if target in api:
        api = api.replace(target, sync_code)
        with open('api/index.php', 'w', encoding='utf-8', newline='') as f:
            f.write(api)
        print('Updated api/index.php with supplier sync!')
    else:
        print('Target not found in api/index.php')
else:
    print('Already present in api/index.php')
