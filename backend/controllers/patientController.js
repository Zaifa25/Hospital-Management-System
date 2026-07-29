const prisma = require('../config/db');

/**
 * Register a new patient record in the hospital system.
 * @route POST /api/patients
 */
const createPatient = async (req, res) => {
  try {
    const patient = await prisma.patient.create({ data: req.body });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Fetch all registered patient profiles.
 * @route GET /api/patients
 */
const getPatients = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get patient profile details by ID.
 * @route GET /api/patients/:id
 */
const getPatientById = async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await prisma.patient.findUnique({ where: { id: parseInt(id) } });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update an existing patient record.
 * @route PUT /api/patients/:id
 */
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

/**
 * Delete a patient profile from database.
 * @route DELETE /api/patients/:id
 */
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
