const prisma = require('../config/db');

const createPayment = async (req, res) => {
  try {
    const payment = await prisma.payment.create({ data: req.body });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPaymentById = async (req, res) => {
  const { id } = req.params;
  try {
    const payment = await prisma.payment.findUnique({ where: { id: parseInt(id) } });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
