const prisma = require('../config/db');

const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: { department: true }
    });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getEmployeeById = async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: { department: true, attendances: true, payrolls: true }
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.departmentId) data.departmentId = Number(data.departmentId);
    if (data.salary) data.salary = Number(data.salary);
    if (data.joiningDate) data.joiningDate = new Date(data.joiningDate);
    
    const employee = await prisma.employee.create({ data });
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const data = { ...req.body };
    if (data.departmentId) data.departmentId = Number(data.departmentId);
    if (data.salary) data.salary = Number(data.salary);
    if (data.joiningDate) data.joiningDate = new Date(data.joiningDate);
    
    const updated = await prisma.employee.update({
      where: { id: parseInt(id) },
      data
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.employee.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
