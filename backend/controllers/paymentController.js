const prisma = require('../config/db');

/**
 * Record a new patient transaction or billing payment entry.
 * @route POST /api/payments
 */
const createPayment = async (req, res) => {
  try {
    const payment = await prisma.payment.create({ data: req.body });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Retrieve all billing payments with associated patient details.
 * @route GET /api/payments
 */
const getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { patient: true }
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get payment receipt record details by ID.
 * @route GET /api/payments/:id
 */
const getPaymentById = async (req, res) => {
  const { id } = req.params;
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: { patient: true }
    });
    if (!payment) {
      return res.status(404).json({ message: 'Payment receipt not found' });
    }
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update an existing payment transaction record.
 * @route PUT /api/payments/:id
 */
const updatePayment = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete a payment record from system.
 * @route DELETE /api/payments/:id
 */
const deletePayment = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.payment.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPayment, getPayments, getPaymentById, updatePayment, deletePayment };
