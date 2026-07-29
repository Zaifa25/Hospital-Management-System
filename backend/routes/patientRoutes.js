/**
 * @file patientRoutes.js
 * @description Express router for Patient lifecycle endpoints (CRUD operations).
 */

const express = require('express');
const { createPatient, getPatients, getPatientById, updatePatient, deletePatient } = require('../controllers/patientController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Require JWT authentication for all patient API routes
router.use(authMiddleware);

/** POST /api/patients - Register new patient record */
router.post('/', createPatient);

/** GET /api/patients - Fetch list of registered patients */
router.get('/', getPatients);

/** GET /api/patients/:id - Retrieve specific patient details by ID */
router.get('/:id', getPatientById);

/** PUT /api/patients/:id - Update existing patient details by ID */
router.put('/:id', updatePatient);

/** DELETE /api/patients/:id - Remove patient record by ID */
router.delete('/:id', deletePatient);

module.exports = router;

