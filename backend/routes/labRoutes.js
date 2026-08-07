const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getLabTests,
  createLabTest,
  orderLabTest,
  getLabOrders,
  updateLabResult,
} = require('../controllers/labController');

router.use(authMiddleware);

router.get('/tests', getLabTests);
router.post('/tests', createLabTest);

router.get('/orders', getLabOrders);
router.post('/orders', orderLabTest);
router.put('/orders/:id/result', updateLabResult);

module.exports = router;
