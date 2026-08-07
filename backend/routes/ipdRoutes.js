const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getWards,
  createWard,
  admitPatient,
  dischargePatient,
} = require('../controllers/ipdController');

router.use(authMiddleware);

router.get('/wards', getWards);
router.post('/wards', createWard);
router.post('/admit', admitPatient);
router.post('/discharge/:admissionId', dischargePatient);

module.exports = router;
