const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/projects', projectController.getProjects);
router.post('/projects', projectController.createProject);
router.get('/vendors', projectController.getVendors);
router.post('/vendors', projectController.createVendor);

module.exports = router;
