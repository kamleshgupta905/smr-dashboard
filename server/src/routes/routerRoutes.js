const express = require('express');
const router = express.Router();
const routerController = require('../controllers/routerController');

// Click Route: Vendor traffic redirects to client / Zamplia survey
router.get('/vendor/auth/:vendor_id/project/:project_id', routerController.handleVendorClick);

// Return Redirects: Respondent returns after survey completion/termination
router.get('/redirects/c/:client_id/complete', routerController.handleComplete);
router.get('/redirects/c/:client_id/terminate', routerController.handleTerminate);
router.get('/redirects/c/:client_id/quotafull', routerController.handleQuotaFull);

module.exports = router;
