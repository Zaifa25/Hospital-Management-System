const express = require('express');
const { createProcedure, getProcedures, getProcedureById, updateProcedure, deleteProcedure } = require('../controllers/procedureController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', createProcedure);
router.get('/', getProcedures);
router.get('/:id', getProcedureById);
router.put('/:id', updateProcedure);
router.delete('/:id', deleteProcedure);

module.exports = router;
