const prisma = require('../config/db');

const createDepartment = async (req, res) => {
  try {
    const department = await prisma.department.create({ data: req.body });
    res.json(department);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    console.log("department",departments);
    
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDepartmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const department = await prisma.department.findUnique({ where: { id: parseInt(id) } });
    res.json(department);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.department.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.department.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment };
