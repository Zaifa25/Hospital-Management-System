/**
 * @file appointmentRoutes.js
 * @description Express router for Appointment booking, token assignment, and scheduling endpoints.
 */

const express = require('express');
const { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Require JWT authentication for all appointment API routes
router.use(authMiddleware);

/** POST /api/appointments - Book new appointment & issue token */
router.post('/', createAppointment);

/** GET /api/appointments - Retrieve appointments list */
router.get('/', getAppointments);

/** GET /api/appointments/:id - Fetch appointment details by ID */
router.get('/:id', getAppointmentById);

/** PUT /api/appointments/:id - Update appointment details or status by ID */
router.put('/:id', updateAppointment);

/** DELETE /api/appointments/:id - Cancel/Delete appointment by ID */
router.delete('/:id', deleteAppointment);

module.exports = router;

