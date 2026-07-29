const prisma = require('../config/db');

/**
 * Fetch all employee attendance records ordered by date descending.
 * @route GET /api/attendance
 */
const getAttendances = async (req, res) => {
  try {
    const attendances = await prisma.attendance.findMany({
      include: { employee: true },
      orderBy: { date: 'desc' }
    });
    res.json(attendances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get attendance details by record ID.
 * @route GET /api/attendance/:id
 */
const getAttendanceById = async (req, res) => {
  const { id } = req.params;
  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id: parseInt(id) },
      include: { employee: true }
    });
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Record a single employee attendance entry.
 * @route POST /api/attendance
 */
const createAttendance = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.employeeId) data.employeeId = Number(data.employeeId);
    if (data.date) data.date = new Date(data.date);

    const attendance = await prisma.attendance.create({
      data,
      include: { employee: true }
    });
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update an existing attendance record.
 * @route PUT /api/attendance/:id
 */
const updateAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    const data = { ...req.body };
    if (data.employeeId) data.employeeId = Number(data.employeeId);
    if (data.date) data.date = new Date(data.date);

    const updated = await prisma.attendance.update({
      where: { id: parseInt(id) },
      data,
      include: { employee: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete an attendance record.
 * @route DELETE /api/attendance/:id
 */
const deleteAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.attendance.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Mark daily attendance in bulk for multiple staff members.
 * @route POST /api/attendance/bulk
 */
const markBulkAttendance = async (req, res) => {
  try {
    const { date, records } = req.body; // records: Array of { employeeId, status, checkIn, checkOut, notes }
    const attDate = date ? new Date(date) : new Date();

    if (!Array.isArray(records)) {
      return res.status(400).json({ message: 'records must be an array' });
    }

    const createdRecords = [];
    for (const r of records) {
      if (!r.employeeId) continue;
      const att = await prisma.attendance.create({
        data: {
          employeeId: Number(r.employeeId),
          date: attDate,
          status: r.status || 'Present',
          checkIn: r.checkIn || null,
          checkOut: r.checkOut || null,
          notes: r.notes || null
        }
      });
      createdRecords.push(att);
    }
    res.status(201).json({ message: `Successfully marked attendance for ${createdRecords.length} employees`, count: createdRecords.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAttendances,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  markBulkAttendance
};
