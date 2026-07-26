const prisma = require('../config/db');

/**
 * Fetch all staff payroll records ordered by creation date.
 * @route GET /api/payrolls
 */
const getPayrolls = async (req, res) => {
  try {
    const payrolls = await prisma.payroll.findMany({
      include: { employee: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get payroll details for a specific record by ID.
 * @route GET /api/payrolls/:id
 */
const getPayrollById = async (req, res) => {
  const { id } = req.params;
  try {
    const payroll = await prisma.payroll.findUnique({
      where: { id: parseInt(id) },
      include: { employee: true }
    });
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create or record a new staff payroll salary entry.
 * @route POST /api/payrolls
 */
const createPayroll = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.employeeId) data.employeeId = Number(data.employeeId);
    if (data.basicSalary) data.basicSalary = Number(data.basicSalary);
    if (data.bonus) data.bonus = Number(data.bonus);
    if (data.deductions) data.deductions = Number(data.deductions);
    
    // Auto calculate net salary if not provided
    data.netSalary = data.basicSalary + (data.bonus || 0) - (data.deductions || 0);

    if (data.status === 'Paid' && !data.paymentDate) {
      data.paymentDate = new Date();
    }

    const payroll = await prisma.payroll.create({
      data,
      include: { employee: true }
    });
    res.status(201).json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePayroll = async (req, res) => {
  const { id } = req.params;
  try {
    const data = { ...req.body };
    if (data.employeeId) data.employeeId = Number(data.employeeId);
    if (data.basicSalary) data.basicSalary = Number(data.basicSalary);
    if (data.bonus) data.bonus = Number(data.bonus);
    if (data.deductions) data.deductions = Number(data.deductions);
    
    if (data.basicSalary !== undefined) {
      const bonus = data.bonus !== undefined ? data.bonus : 0;
      const deductions = data.deductions !== undefined ? data.deductions : 0;
      data.netSalary = data.basicSalary + bonus - deductions;
    }

    if (data.status === 'Paid' && !data.paymentDate) {
      data.paymentDate = new Date();
    }

    const updated = await prisma.payroll.update({
      where: { id: parseInt(id) },
      data,
      include: { employee: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePayroll = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.payroll.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Payroll record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAsPaid = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.payroll.update({
      where: { id: parseInt(id) },
      data: {
        status: 'Paid',
        paymentDate: new Date()
      },
      include: { employee: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAllMonthAsPaid = async (req, res) => {
  const { month } = req.body;
  try {
    const updated = await prisma.payroll.updateMany({
      where: { month, status: 'Pending' },
      data: {
        status: 'Paid',
        paymentDate: new Date()
      }
    });
    res.json({ message: `Marked ${updated.count} payroll records as Paid for ${month}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const generateMonthlyPayroll = async (req, res) => {
  const { month } = req.body;
  try {
    if (!month) return res.status(400).json({ message: 'Month string is required' });

    const employees = await prisma.employee.findMany();
    let generatedCount = 0;

    for (const emp of employees) {
      const existing = await prisma.payroll.findFirst({
        where: { employeeId: emp.id, month }
      });
      if (!existing) {
        const basicSalary = emp.salary || 50000;
        await prisma.payroll.create({
          data: {
            employeeId: emp.id,
            month,
            basicSalary,
            bonus: 0,
            deductions: 0,
            netSalary: basicSalary,
            status: 'Pending'
          }
        });
        generatedCount++;
      }
    }

    res.status(201).json({ message: `Successfully generated ${generatedCount} payroll entries for ${month}`, count: generatedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
  markAsPaid,
  markAllMonthAsPaid,
  generateMonthlyPayroll
};
