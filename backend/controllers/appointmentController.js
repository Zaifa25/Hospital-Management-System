const prisma = require('../config/db');

/**
 * Schedule a new patient appointment after checking doctor availability.
 * @route POST /api/appointments
 */
const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    
    // Check for existing slot collision
    if (doctorId && date && time) {
      const existing = await prisma.appointment.findFirst({
        where: {
          doctorId: parseInt(doctorId),
          date: new Date(date),
          time: time,
          status: { not: 'cancelled' }
        }
      });
      if (existing) {
        return res.status(400).json({ message: 'The doctor is already booked for this date and time slot.' });
      }
    }

    const appointment = await prisma.appointment.create({ data: req.body });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Fetch appointments with patient, doctor, and department details.
 * If user is a Doctor (roleId === 2), filter exclusively for appointments assigned to this doctor.
 * @route GET /api/appointments
 */
const getAppointments = async (req, res) => {
  try {
    const { doctorId } = req.query;
    const where = {};

    if (req.user && req.user.roleId === 2) {
      // Logged in user is a Doctor - show ONLY appointments for this doctor
      where.doctorId = req.user.id;
    } else if (doctorId) {
      where.doctorId = parseInt(doctorId);
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        department: true
      },
      orderBy: { date: 'desc' }
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get appointment details by ID.
 * @route GET /api/appointments/:id
 */
const getAppointmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: true,
        doctor: true,
        department: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Doctor role check
    if (req.user && req.user.roleId === 2 && appointment.doctorId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You can only view your own patient appointments.' });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update appointment details and verify slot conflict prevention.
 * @route PUT /api/appointments/:id
 */
const updateAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Doctor role check
    if (req.user && req.user.roleId === 2 && existingAppointment.doctorId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You can only update your own patient appointments.' });
    }

    const { doctorId, date, time } = req.body;
    const targetDoctorId = doctorId ? parseInt(doctorId) : existingAppointment.doctorId;
    
    // Check for existing slot collision if schedule fields are updated
    if (targetDoctorId && date && time) {
      const collision = await prisma.appointment.findFirst({
        where: {
          id: { not: parseInt(id) },
          doctorId: targetDoctorId,
          date: new Date(date),
          time: time,
          status: { not: 'cancelled' }
        }
      });
      if (collision) {
        return res.status(400).json({ message: 'The doctor is already booked for this date and time slot.' });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Cancel or delete an appointment record.
 * @route DELETE /api/appointments/:id
 */
const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    });

    if (existingAppointment && req.user && req.user.roleId === 2 && existingAppointment.doctorId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You can only delete your own appointments.' });
    }

    await prisma.appointment.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment };
