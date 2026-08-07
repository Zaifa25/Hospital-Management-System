const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getMedicines,
  addMedicine,
  recordPharmacySale,
} = require('../controllers/pharmacyController');

router.use(authMiddleware);

router.get('/medicines', getMedicines);
router.post('/medicines', addMedicine);
router.post('/sales', recordPharmacySale);

module.exports = router;
