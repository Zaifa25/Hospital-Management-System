const express = require('express');
const { createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', createDepartment);
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

module.exports = router;
