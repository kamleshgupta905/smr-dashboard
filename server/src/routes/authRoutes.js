const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/me', authController.getMe);
router.get('/google-sheet-status', authController.getGoogleSheetStatus);
router.get('/google/authorize', authController.googleAuthorize);
router.get('/google/callback', authController.googleCallback);

module.exports = router;
