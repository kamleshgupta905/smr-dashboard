const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');

// Zamplia Survey Endpoints
router.get('/', surveyController.getSurveys);
router.get('/surveys', surveyController.getSurveys);
router.get('/sync', surveyController.syncSurveys);
router.get('/details/:surveyId', surveyController.getSurveyDetails);
router.get('/qualifications/:surveyId', surveyController.getQualifications);
router.get('/quotas/:surveyId', surveyController.getQuotas);
router.get('/global-stats/:surveyId?', surveyController.getGlobalStats);
router.get('/reconciliation', surveyController.getReconciliation);
router.get('/reference-data', surveyController.getReferenceData);
router.post('/generate-link', surveyController.generateLink);

module.exports = router;
