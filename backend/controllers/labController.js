const prisma = require('../config/db');

/**
 * Get catalog of Lab Tests
 * @route GET /api/lab/tests
 */
const getLabTests = async (req, res) => {
  try {
    const tests = await prisma.labTest.findMany({
      include: { department: { select: { id: true, name: true } } },
      orderBy: { testName: 'asc' },
    });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create a new Lab Test catalog item
 * @route POST /api/lab/tests
 */
const createLabTest = async (req, res) => {
  try {
    const { testCode, testName, departmentId, price, referenceRange } = req.body;

    if (!testCode || !testName || !departmentId || !price) {
      return res.status(400).json({ message: 'Test Code, Test Name, Department ID, and Price are required' });
    }

    const labTest = await prisma.labTest.create({
      data: {
        testCode,
        testName,
        departmentId: Number(departmentId),
        price: parseFloat(price),
        referenceRange,
      },
    });

    res.status(201).json({ message: 'Lab Test created successfully', labTest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Order a Lab Test for a patient
 * @route POST /api/lab/orders
 */
const orderLabTest = async (req, res) => {
  try {
    const { patientId, doctorId, testId } = req.body;

    if (!patientId || !doctorId || !testId) {
      return res.status(400).json({ message: 'Patient ID, Doctor ID, and Test ID are required' });
    }

    const order = await prisma.labOrder.create({
      data: {
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        testId: Number(testId),
        sampleStatus: 'Pending',
        status: 'Ordered',
      },
      include: {
        test: true,
        patient: { select: { id: true, fullName: true, mrNo: true } },
        doctor: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ message: 'Lab test ordered successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get all Lab Orders
 * @route GET /api/lab/orders
 */
const getLabOrders = async (req, res) => {
  try {
    const { patientId } = req.query;
    const where = patientId ? { patientId: Number(patientId) } : {};

    const orders = await prisma.labOrder.findMany({
      where,
      include: {
        test: true,
        patient: { select: { id: true, fullName: true, mrNo: true } },
        doctor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update Lab Order Result
 * @route PUT /api/lab/orders/:id/result
 */
const updateLabResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { sampleStatus, resultSummary, reportUrl, status } = req.body;

    const order = await prisma.labOrder.update({
      where: { id: Number(id) },
      data: {
        sampleStatus: sampleStatus || undefined,
        resultSummary: resultSummary || undefined,
        reportUrl: reportUrl || undefined,
        status: status || 'Completed',
      },
    });

    res.json({ message: 'Lab result updated successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getLabTests,
  createLabTest,
  orderLabTest,
  getLabOrders,
  updateLabResult,
};
