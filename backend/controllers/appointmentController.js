const prisma = require('../config/db');

const createAppointment = async (req, res) => {
  try {
    const appointment = await prisma.appointment.create({ data: req.body });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAppointmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
