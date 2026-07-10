const prisma = require('../config/db');

// Create procedure
const createProcedure = async (req, res) => {
  try {
    const procedure = await prisma.procedure.create({ data: req.body });
    res.json(procedure);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all procedures
const getProcedures = async (req, res) => {
  try {
    const procedures = await prisma.procedure.findMany({ include: { department: true } });
    res.json(procedures);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get procedure by ID
const getProcedureById = async (req, res) => {
  const { id } = req.params;
  try {
    const procedure = await prisma.procedure.findUnique({ where: { id: parseInt(id) } });
    res.json(procedure);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update procedure
const updateProcedure = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.procedure.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete procedure
const deleteProcedure = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.procedure.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Procedure deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createProcedure, getProcedures, getProcedureById, updateProcedure, deleteProcedure };
