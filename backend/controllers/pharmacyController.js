const prisma = require('../config/db');

/**
 * Get all medicines in stock
 * @route GET /api/pharmacy/medicines
 */
const getMedicines = async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Add a new medicine stock item
 * @route POST /api/pharmacy/medicines
 */
const addMedicine = async (req, res) => {
  try {
    const { name, genericName, category, batchNo, stockQuantity, unitPrice, expiryDate } = req.body;

    if (!name || !category || !batchNo || !unitPrice || !expiryDate) {
      return res.status(400).json({ message: 'Name, Category, Batch No, Unit Price, and Expiry Date are required' });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        genericName,
        category,
        batchNo,
        stockQuantity: Number(stockQuantity || 0),
        unitPrice: parseFloat(unitPrice),
        expiryDate: new Date(expiryDate),
        status: Number(stockQuantity) > 0 ? 'Available' : 'Out of Stock',
      },
    });

    res.status(201).json({ message: 'Medicine added successfully', medicine });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Record a Pharmacy Sale
 * @route POST /api/pharmacy/sales
 */
const recordPharmacySale = async (req, res) => {
  try {
    const { patientId, prescriptionId, totalAmount, paidAmount } = req.body;

    if (!patientId || !totalAmount) {
      return res.status(400).json({ message: 'Patient ID and Total Amount are required' });
    }

    const sale = await prisma.pharmacySale.create({
      data: {
        patientId: Number(patientId),
        prescriptionId: prescriptionId ? Number(prescriptionId) : null,
        totalAmount: parseFloat(totalAmount),
        paidAmount: parseFloat(paidAmount || totalAmount),
        status: 'Completed',
      },
      include: {
        patient: { select: { id: true, fullName: true, mrNo: true } },
      },
    });

    res.status(201).json({ message: 'Pharmacy sale completed', sale });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMedicines,
  addMedicine,
  recordPharmacySale,
};
