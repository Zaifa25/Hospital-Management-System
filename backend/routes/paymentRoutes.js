/**
 * @file paymentRoutes.js
 * @description Express router for Patient Billing transactions & invoice payment endpoints.
 */

const express = require('express');
const { createPayment, getPayments, getPaymentById, updatePayment, deletePayment } = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Require JWT authentication for billing & payment routes
router.use(authMiddleware);

/** POST /api/payments - Process & record payment transaction */
router.post('/', createPayment);

/** GET /api/payments - Fetch payment ledger transactions */
router.get('/', getPayments);

/** GET /api/payments/:id - Fetch payment invoice details by ID */
router.get('/:id', getPaymentById);

/** PUT /api/payments/:id - Update payment record by ID */
router.put('/:id', updatePayment);

/** DELETE /api/payments/:id - Delete payment record by ID */
router.delete('/:id', deletePayment);

module.exports = router;

