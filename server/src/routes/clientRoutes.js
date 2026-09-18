const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.get('/', clientController.getClients);
router.post('/', clientController.createClient);
router.delete('/:id', clientController.deleteClient);
router.post('/sync/:clientCode', clientController.syncClientInventory);
router.post('/test-s2s', clientController.testS2sCallback);
router.post('/test-hashing', clientController.testHashing);

module.exports = router;
