/**
 * @file attendanceRoutes.js
 * @description Express router for Daily Staff Attendance tracking & bulk check-in endpoints.
 */

const express = require('express');
const { getAttendances, getAttendanceById, createAttendance, updateAttendance, deleteAttendance, markBulkAttendance } = require('../controllers/attendanceController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Require JWT authentication for attendance endpoints
router.use(authMiddleware);

/** POST /api/attendance/bulk - Record daily bulk attendance sheet */
router.post('/bulk', markBulkAttendance);

/** GET /api/attendance - Fetch attendance records */
router.get('/', getAttendances);

/** GET /api/attendance/:id - Retrieve specific attendance record by ID */
router.get('/:id', getAttendanceById);

/** POST /api/attendance - Create single attendance entry */
router.post('/', createAttendance);

/** PUT /api/attendance/:id - Update attendance record status by ID */
router.put('/:id', updateAttendance);

/** DELETE /api/attendance/:id - Delete attendance record by ID */
router.delete('/:id', deleteAttendance);

module.exports = router;

