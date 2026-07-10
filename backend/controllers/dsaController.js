const prisma = require('../config/db');

// Create DSA profile
const createDSA = async (req, res) => {
  try {
    const dsa = await prisma.dSAProfile.create({ data: req.body });
    res.json(dsa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all DSAs
const getDSAs = async (req, res) => {
  try {
    const dsas = await prisma.dSAProfile.findMany();
    res.json(dsas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get DSA by ID
const getDSAById = async (req, res) => {
  const { id } = req.params;
  try {
    const dsa = await prisma.dSAProfile.findUnique({ where: { id: parseInt(id) } });
    res.json(dsa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update DSA
const updateDSA = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.dSAProfile.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete DSA
const deleteDSA = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.dSAProfile.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'DSA deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createDSA, getDSAs, getDSAById, updateDSA, deleteDSA };
