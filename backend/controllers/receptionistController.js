const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

const createReceptionist = async (req, res) => {
  try {
    const { name, email, password, phone, address, status } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const receptionist = await prisma.receptionist.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        status: status || 'Active',
        roleId: 4 // Role ID for Receptionist
      }
    });
    // Remove password from response
    const { password: _, ...receptionistData } = receptionist;
    res.json(receptionistData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getReceptionists = async (req, res) => {
  try {
    const receptionists = await prisma.receptionist.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        status: true,
        roleId: true,
        createdAt: true
      }
    });
    res.json(receptionists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getReceptionistById = async (req, res) => {
  const { id } = req.params;
  try {
    const receptionist = await prisma.receptionist.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        status: true,
        roleId: true,
        createdAt: true
      }
    });
    if (!receptionist) return res.status(404).json({ message: 'Receptionist not found' });
    res.json(receptionist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateReceptionist = async (req, res) => {
  const { id } = req.params;
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const updated = await prisma.receptionist.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    const { password: _, ...receptionistData } = updated;
    res.json(receptionistData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteReceptionist = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.receptionist.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Receptionist deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReceptionist, getReceptionists, getReceptionistById, updateReceptionist, deleteReceptionist };
