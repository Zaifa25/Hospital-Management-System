const prisma = require('../config/db');

/**
 * Fetch all staff payroll records ordered by creation date.
 * @route GET /api/payrolls
 */
const getPayrolls = async (req, res) => {
  try {
    const payrolls = await prisma.payroll.findMany({
      include: {
        employee: {
          include: { department: true }
        }
      },
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
      include: {
        employee: {
          include: { department: true }
        }
      }
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
 * Create or update (upsert) a payroll salary entry for a specific employee & month.
 * Prevents duplicate records when HR re-processes a month.
 * @route POST /api/payrolls
 */
const createPayroll = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.employeeId) data.employeeId = Number(data.employeeId);
    if (data.basicSalary) data.basicSalary = Number(data.basicSalary);
    if (data.bonus !== undefined) data.bonus = Number(data.bonus);
    if (data.deductions !== undefined) data.deductions = Number(data.deductions);

    // Auto calculate net salary
    const basic = data.basicSalary || 0;
    const bonus = data.bonus || 0;
    const deductions = data.deductions || 0;
    data.netSalary = basic + bonus - deductions;

    if (data.status === 'Paid' && !data.paymentDate) {
      data.paymentDate = new Date();
    }
    // If status changed to Pending, clear payment date
    if (data.status === 'Pending') {
      data.paymentDate = null;
    }

    // Check if a record already exists for this employee + month
    if (data.employeeId && data.month) {
      const existing = await prisma.payroll.findFirst({
        where: { employeeId: data.employeeId, month: data.month }
      });

      if (existing) {
        // Update the existing record instead of creating a duplicate
        const updated = await prisma.payroll.update({
          where: { id: existing.id },
          data: {
            basicSalary: data.basicSalary,
            bonus: data.bonus,
            deductions: data.deductions,
            netSalary: data.netSalary,
            status: data.status || existing.status,
            paymentDate: data.paymentDate !== undefined ? data.paymentDate : existing.paymentDate,
          },
          include: {
            employee: { include: { department: true } }
          }
        });
        return res.status(200).json(updated);
      }
    }

    const payroll = await prisma.payroll.create({
      data,
      include: {
        employee: { include: { department: true } }
      }
    });
    res.status(201).json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update an existing payroll record.
 * @route PUT /api/payrolls/:id
 */
const updatePayroll = async (req, res) => {
  const { id } = req.params;
  try {
    const data = { ...req.body };
    if (data.employeeId) data.employeeId = Number(data.employeeId);
    if (data.basicSalary !== undefined) data.basicSalary = Number(data.basicSalary);
    if (data.bonus !== undefined) data.bonus = Number(data.bonus);
    if (data.deductions !== undefined) data.deductions = Number(data.deductions);

    // Recalculate net salary if any salary component changed
    if (data.basicSalary !== undefined || data.bonus !== undefined || data.deductions !== undefined) {
      // Fetch current record to fill in missing values
      const current = await prisma.payroll.findUnique({ where: { id: parseInt(id) } });
      if (!current) return res.status(404).json({ message: 'Payroll record not found' });

      const basic = data.basicSalary !== undefined ? data.basicSalary : current.basicSalary;
      const bonus = data.bonus !== undefined ? data.bonus : current.bonus;
      const deductions = data.deductions !== undefined ? data.deductions : current.deductions;
      data.netSalary = basic + bonus - deductions;
    }

    if (data.status === 'Paid' && !data.paymentDate) {
      data.paymentDate = new Date();
    }
    if (data.status === 'Pending') {
      data.paymentDate = null;
    }

    const updated = await prisma.payroll.update({
      where: { id: parseInt(id) },
      data,
      include: {
        employee: { include: { department: true } }
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete a payroll record.
 * @route DELETE /api/payrolls/:id
 */
const deletePayroll = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.payroll.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Payroll record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Toggle a single payroll record's status between Paid and Pending.
 * @route PUT /api/payrolls/:id/pay
 */
const markAsPaid = async (req, res) => {
  const { id } = req.params;
  try {
    const current = await prisma.payroll.findUnique({ where: { id: parseInt(id) } });
    if (!current) return res.status(404).json({ message: 'Payroll record not found' });

    // Toggle: if currently Paid → set to Pending, otherwise → set to Paid
    const newStatus = current.status === 'Paid' ? 'Pending' : 'Paid';

    const updated = await prisma.payroll.update({
      where: { id: parseInt(id) },
      data: {
        status: newStatus,
        paymentDate: newStatus === 'Paid' ? new Date() : null
      },
      include: {
        employee: { include: { department: true } }
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update just the status of a single payroll entry.
 * @route PUT /api/payrolls/:id/status
 */
const updatePayrollStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (!status || !['Paid', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "Paid" or "Pending"' });
    }

    const updated = await prisma.payroll.update({
      where: { id: parseInt(id) },
      data: {
        status,
        paymentDate: status === 'Paid' ? new Date() : null
      },
      include: {
        employee: { include: { department: true } }
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Mark all pending payroll entries for a given month as Paid.
 * @route POST /api/payrolls/mark-all-paid
 */
const markAllMonthAsPaid = async (req, res) => {
  const { month } = req.body;
  try {
    if (!month) return res.status(400).json({ message: 'Month is required' });

    const updated = await prisma.payroll.updateMany({
      where: { month, status: 'Pending' },
      data: {
        status: 'Paid',
        paymentDate: new Date()
      }
    });
    res.json({
      message: `Marked ${updated.count} payroll records as Paid for ${month}`,
      count: updated.count,
      month
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Auto-generate monthly payroll entries for all active employees.
 * Uses each employee's base salary. Skips employees that already have a record for the month.
 * @route POST /api/payrolls/generate
 */
const generateMonthlyPayroll = async (req, res) => {
  const { month } = req.body;
  try {
    if (!month) return res.status(400).json({ message: 'Month string is required (e.g. "July 2026")' });

    // Only generate for active employees
    const employees = await prisma.employee.findMany({
      where: { status: 'active' },
      include: { department: true }
    });

    let generatedCount = 0;
    let skippedCount = 0;

    for (const emp of employees) {
      const existing = await prisma.payroll.findFirst({
        where: { employeeId: emp.id, month }
      });
      if (existing) {
        skippedCount++;
        continue;
      }

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

    res.status(201).json({
      message: `Generated ${generatedCount} payroll entries for ${month}` +
        (skippedCount > 0 ? ` (${skippedCount} already existed)` : ''),
      generated: generatedCount,
      skipped: skippedCount,
      month
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get aggregated payroll summary stats, optionally filtered by month.
 * @route GET /api/payrolls/summary
 */
const getPayrollSummary = async (req, res) => {
  try {
    const { month } = req.query;
    const where = month && month !== 'All' ? { month } : {};

    const payrolls = await prisma.payroll.findMany({ where });

    let totalExpense = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;

    payrolls.forEach(p => {
      const net = Number(p.netSalary) || 0;
      totalExpense += net;
      if (p.status === 'Paid') {
        totalPaid += net;
        paidCount++;
      } else {
        totalPending += net;
        pendingCount++;
      }
    });

    res.json({
      totalExpense,
      totalPaid,
      totalPending,
      paidCount,
      pendingCount,
      totalRecords: payrolls.length,
      month: month || 'All'
    });
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
  updatePayrollStatus,
  markAllMonthAsPaid,
  generateMonthlyPayroll,
  getPayrollSummary
};
