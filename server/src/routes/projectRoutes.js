const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/projects', projectController.getProjects);
router.post('/projects', projectController.createProject);
router.get('/vendors', projectController.getVendors);
router.post('/vendors', projectController.createVendor);
router.get('/users', projectController.getUsers);
router.post('/users', projectController.createUser);
router.post('/users/delete/:id', projectController.deleteUser);

module.exports = router;

