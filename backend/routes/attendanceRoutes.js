const express = require('express');
const { getAttendances, getAttendanceById, createAttendance, updateAttendance, deleteAttendance, markBulkAttendance } = require('../controllers/attendanceController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/bulk', markBulkAttendance);
router.get('/', getAttendances);
router.get('/:id', getAttendanceById);
router.post('/', createAttendance);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

module.exports = router;
