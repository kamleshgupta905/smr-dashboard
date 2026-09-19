const express = require('express');
const router = express.Router();
const routerController = require('../controllers/routerController');

// 1. Inbound Click Route: Vendor traffic redirects to client survey
//    (mounted at '/' in server.js AND at '/api' — accept both shapes)
router.get('/vendor/auth/:vendor_id/project/:project_id', routerController.handleVendorClick);
router.get('/api/vendor/auth/:vendor_id/project/:project_id', routerController.handleVendorClick);

// 2. Outbound Callbacks: Respondent returns after survey completion/termination
router.get('/redirects/c/:client_id/complete', routerController.handleComplete);
router.get('/redirects/c/:client_id/terminate', routerController.handleTerminate);
router.get('/redirects/c/:client_id/quotafull', routerController.handleQuotaFull);
router.get('/redirects/c/:client_id/quality_terminate', routerController.handleQualityTerminate);
router.get('/api/redirects/c/:client_id/complete', routerController.handleComplete);
router.get('/api/redirects/c/:client_id/terminate', routerController.handleTerminate);
router.get('/api/redirects/c/:client_id/quotafull', routerController.handleQuotaFull);
router.get('/api/redirects/c/:client_id/quality_terminate', routerController.handleQualityTerminate);

// 3. Interactive Sandbox Test Simulator API
router.post('/api/router/simulate-test', routerController.simulateTestRouting);

// 5. Internal live traffic ledger (Recent Vendor Clicks & Outcomes)
router.get('/api/router/leads', routerController.getRecentLeads);

// 4. Generate Standard Vendor Links with [RESPONDENT_ID] placeholder
//    Uses the request host by default so generated links work behind any domain/proxy.
router.post('/api/router/generate-vendor-link', (req, res) => {
  const { projectId, vendorId, baseUrl } = req.body;
  const proto = req.protocol || 'http';
  const host = baseUrl || `${proto}://${req.get('host')}`;
  const pid = projectId || 'SURVEY_101';
  const vid = vendorId || 'SAMPLE_VENDOR_1';

  const liveEntryLink = `${host}/vendor/auth/${vid}/project/${pid}?uid=[RESPONDENT_ID]`;
  const testEntryLink = `${host}/vendor/auth/${vid}/project/${pid}?uid=TEST_DEMO_01`;

  res.json({
    success: true,
    projectId: pid,
    vendorId: vid,
    liveEntryLink,
    testEntryLink,
    instructions: 'Provide the liveEntryLink to your panel partner. The partner will dynamically replace [RESPONDENT_ID] with their panelist identifier.',
  });
});

module.exports = router;
