/**
 * @file departmentRoutes.js
 * @description Express router for Hospital Department management endpoints.
 */

const express = require('express');
const { createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Require JWT authentication for department endpoints
router.use(authMiddleware);

/** POST /api/departments - Create new hospital department */
router.post('/', createDepartment);

/** GET /api/departments - Retrieve list of all departments */
router.get('/', getDepartments);

/** GET /api/departments/:id - Fetch department profile by ID */
router.get('/:id', getDepartmentById);

/** PUT /api/departments/:id - Update department details by ID */
router.put('/:id', updateDepartment);

/** DELETE /api/departments/:id - Remove department record by ID */
router.delete('/:id', deleteDepartment);

module.exports = router;

