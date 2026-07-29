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

router.use(authMiddleware);

router.get('/summary', getPayrollSummary);
router.post('/generate', generateMonthlyPayroll);
router.post('/mark-all-paid', markAllMonthAsPaid);
router.put('/:id/pay', markAsPaid);
router.put('/:id/status', updatePayrollStatus);

router.get('/', getPayrolls);
router.get('/:id', getPayrollById);
router.post('/', createPayroll);
router.put('/:id', updatePayroll);
router.delete('/:id', deletePayroll);

module.exports = router;
