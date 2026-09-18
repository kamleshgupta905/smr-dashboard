const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');

router.get('/policy', securityController.getSecurityPolicy);
router.put('/policy', securityController.updateSecurityPolicy);
router.post('/simulate-check', securityController.simulateTrafficCheck);

module.exports = router;
