/**
 * @file payrollRoutes.js
 * @description Express router for Monthly HR Payroll generation, payouts, and salary slips.
 */

const express = require('express');
const { 
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
} = require('../controllers/payrollController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Require JWT authentication for all payroll management endpoints
router.use(authMiddleware);

/** GET /api/payrolls/summary - Monthly payroll summary metrics */
router.get('/summary', getPayrollSummary);

/** POST /api/payrolls/generate - Bulk generate monthly payroll sheet */
router.post('/generate', generateMonthlyPayroll);

/** POST /api/payrolls/mark-all-paid - Approve payouts for entire month */
router.post('/mark-all-paid', markAllMonthAsPaid);

/** PUT /api/payrolls/:id/pay - Mark individual payroll item as paid */
router.put('/:id/pay', markAsPaid);

/** PUT /api/payrolls/:id/status - Update individual payroll approval status */
router.put('/:id/status', updatePayrollStatus);

/** GET /api/payrolls - Fetch payroll ledger entries */
router.get('/', getPayrolls);

/** GET /api/payrolls/:id - Retrieve payroll item & salary slip by ID */
router.get('/:id', getPayrollById);

/** POST /api/payrolls - Manual creation of salary entry */
router.post('/', createPayroll);

/** PUT /api/payrolls/:id - Update payroll entry by ID */
router.put('/:id', updatePayroll);

/** DELETE /api/payrolls/:id - Remove payroll record by ID */
router.delete('/:id', deletePayroll);

module.exports = router;

