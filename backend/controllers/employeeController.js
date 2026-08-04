const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

/**
 * Fetch all registered hospital employees with department information.
 * @route GET /api/employees
 */
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

/**
 * Get employee details by ID including attendances and payroll records.
 * @route GET /api/employees/:id
 */
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

/**
 * Create a new employee record.
 * @route POST /api/employees
 */
const createEmployee = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.departmentId !== undefined && data.departmentId !== null && data.departmentId !== '') {
      data.departmentId = Number(data.departmentId);
    } else {
      data.departmentId = null;
    }
    
    if (data.salary !== undefined && data.salary !== null && data.salary !== '') {
      data.salary = Number(data.salary);
    } else {
      data.salary = 0;
    }

    if (data.joiningDate) {
      data.joiningDate = new Date(data.joiningDate);
    }
    
    // Hash password or provide default
    const rawPassword = (data.password && data.password.trim()) ? data.password : 'Employee123!';
    data.password = await bcrypt.hash(rawPassword, 10);
    data.roleId = 6;

    const employee = await prisma.employee.create({ data });
    res.status(201).json(employee);
  } catch (err) {
    console.error('Create Employee error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update an existing employee profile.
 * @route PUT /api/employees/:id
 */
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const data = { ...req.body };
    if (data.departmentId !== undefined && data.departmentId !== null && data.departmentId !== '') {
      data.departmentId = Number(data.departmentId);
    } else {
      data.departmentId = null;
    }

    if (data.salary !== undefined && data.salary !== null && data.salary !== '') {
      data.salary = Number(data.salary);
    }

    if (data.joiningDate) {
      data.joiningDate = new Date(data.joiningDate);
    }
    
    if (data.password && data.password.trim()) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }

    // Remove immutable fields if present in req.body
    delete data.id;
    delete data.createdAt;
    delete data.department;
    delete data.attendances;
    delete data.payrolls;

    const updated = await prisma.employee.update({
      where: { id: parseInt(id) },
      data
    });
    res.json(updated);
  } catch (err) {
    console.error('Update Employee error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete an employee record by ID.
 * @route DELETE /api/employees/:id
 */
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
