const express = require('express');
const router = express.Router();
const explorerController = require('../controllers/apiExplorerController');

// Market Xcel Master Data APIs
router.get('/marketxcel/countries', explorerController.getMarketXcelCountries);
router.get('/marketxcel/languages', explorerController.getMarketXcelLanguages);
router.get('/marketxcel/questions', explorerController.getMarketXcelQuestions);

// Zamplia Demand Helper APIs
router.post('/zamplia/demand/create-project', explorerController.createDemandProject);
router.get('/zamplia/demand/feasibility', explorerController.getDemandFeasibility);

// Master Interactive API Runner (Executes all 37 APIs)
router.post('/run-test', explorerController.runApiTest);

module.exports = router;
