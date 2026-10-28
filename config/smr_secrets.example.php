<?php
// SMR server secrets — TEMPLATE ONLY.
//
// Copy this file to /home/u839355029/config/smr_secrets.php ON THE SERVER
// (OUTSIDE the web root and OUTSIDE the repo) and fill in the real values.
// NEVER commit the filled-in file to the repo. Deployments never touch that
// server path, so the file survives every deploy.
//
// ROTATION REQUIRED: every credential previously committed in the repo lives
// in git history forever and must be treated as public. After deploying the
// Phase 1 fixes, change the database passwords (Hostinger) and the Zamplia
// API keys (Zamplia panel), then put ONLY the new values in the server file
// and in GitHub Secrets. Old values must stop working.

return [
    // Database used by api/index.php at runtime.
    'db' => [
        'host' => 'localhost',
        'user' => 'FILL-IN-NEW-DB-USER',
        'pass' => 'FILL-IN-NEW-DB-PASSWORD',
        'db'   => 'FILL-IN-NEW-DB-NAME',
    ],
    // Database used ONLY as deploy transport (_deploy_tmp / _tmp tables).
    'deploy_db' => [
        'host' => '127.0.0.1',
        'user' => 'FILL-IN-NEW-DEPLOY-DB-USER',
        'pass' => 'FILL-IN-NEW-DEPLOY-DB-PASSWORD',
        'db'   => 'FILL-IN-NEW-DEPLOY-DB-NAME',
    ],
];
