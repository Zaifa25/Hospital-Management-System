/**
 * @file employeeRoutes.js
 * @description Express router for HR & Hospital Employee staff directory endpoints.
 */

const express = require('express');
const { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Require JWT authentication for employee management routes
router.use(authMiddleware);

/** GET /api/employees - Fetch hospital staff directory */
router.get('/', getEmployees);

/** GET /api/employees/:id - Retrieve employee details by ID */
router.get('/:id', getEmployeeById);

/** POST /api/employees - Register new employee staff record */
router.post('/', createEmployee);

/** PUT /api/employees/:id - Update employee record by ID */
router.put('/:id', updateEmployee);

/** DELETE /api/employees/:id - Delete employee record by ID */
router.delete('/:id', deleteEmployee);

module.exports = router;

