const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const TransactionController = require('../controllers/TransactionController');
const { transactionValidation } = require('../middleware/validators');

router.use(isAuthenticated);

router.get('/', TransactionController.list);
router.get('/create', TransactionController.create);
router.post('/', transactionValidation, TransactionController.store);
router.get('/:id/print', TransactionController.printInvoice);

module.exports = router;

