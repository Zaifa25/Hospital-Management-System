const prisma = require('../config/db');

const createPatient = async (req, res) => {
  try {
    const patient = await prisma.patient.create({ data: req.body });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPatientById = async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await prisma.patient.findUnique({ where: { id: parseInt(id) } });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePatient = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePatient = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.patient.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };
