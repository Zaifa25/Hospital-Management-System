/**
 * @file attendanceRoutes.js
 * @description Express router for Daily Staff Attendance tracking & bulk check-in endpoints.
 */

const express = require('express');
const { 
  getAttendances, 
  getAttendanceById, 
  createAttendance, 
  updateAttendance, 
  deleteAttendance, 
  markBulkAttendance,
  getEmployeeTodayAttendance,
  markEmployeeSelfAttendance,
  getEmployeeAttendanceHistory
} = require('../controllers/attendanceController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Require JWT authentication for attendance endpoints
router.use(authMiddleware);

/** GET /api/attendance/employee/:employeeId/today - Get today's attendance for employee */
router.get('/employee/:employeeId/today', getEmployeeTodayAttendance);

/** POST /api/attendance/employee/mark - Employee self check-in / check-out */
router.post('/employee/mark', markEmployeeSelfAttendance);

/** GET /api/attendance/employee/:employeeId/history - Get attendance history for employee */
router.get('/employee/:employeeId/history', getEmployeeAttendanceHistory);

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

