const express = require('express');
const router = express.Router();
const routerController = require('../controllers/routerController');

// 1. Inbound Click Route: Vendor traffic redirects to client survey
router.get('/vendor/auth/:vendor_id/project/:project_id', routerController.handleVendorClick);

// 2. Outbound Callbacks: Respondent returns after survey completion/termination
router.get('/redirects/c/:client_id/complete', routerController.handleComplete);
router.get('/redirects/c/:client_id/terminate', routerController.handleTerminate);
router.get('/redirects/c/:client_id/quotafull', routerController.handleQuotaFull);
router.get('/redirects/c/:client_id/quality_terminate', routerController.handleQualityTerminate);

// 3. Interactive Sandbox Test Simulator API
router.post('/api/router/simulate-test', routerController.simulateTestRouting);

// 4. Generate Standard Vendor Links with [RESPONDENT_ID] placeholder
router.post('/api/router/generate-vendor-link', (req, res) => {
  const { projectId, vendorId, baseUrl } = req.body;
  const host = baseUrl || 'http://localhost:5000';
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
