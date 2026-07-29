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
 * Fetch all appointments with patient, doctor, and department details.
 * @route GET /api/appointments
 */
const getAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: true,
        department: true
      }
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
    const { doctorId, date, time } = req.body;
    
    // Check for existing slot collision if schedule fields are updated
    if (doctorId && date && time) {
      const existing = await prisma.appointment.findFirst({
        where: {
          id: { not: parseInt(id) },
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
    await prisma.appointment.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment };
