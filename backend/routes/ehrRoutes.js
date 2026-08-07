const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  recordVitals,
  getPatientVitals,
  createConsultationNote,
  getPatientConsultations,
  createPrescription,
  getPrescriptions,
} = require('../controllers/ehrController');

router.use(authMiddleware);

router.post('/vitals', recordVitals);
router.get('/vitals/:patientId', getPatientVitals);

router.post('/consultations', createConsultationNote);
router.get('/consultations/:patientId', getPatientConsultations);

router.post('/prescriptions', createPrescription);
router.get('/prescriptions', getPrescriptions);

module.exports = router;
