const express = require('express');
const { createDSA, getDSAs, getDSAById, updateDSA, deleteDSA } = require('../controllers/dsaController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', createDSA);
router.get('/', getDSAs);
router.get('/:id', getDSAById);
router.put('/:id', updateDSA);
router.delete('/:id', deleteDSA);

module.exports = router;
