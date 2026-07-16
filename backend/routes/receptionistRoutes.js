const express = require('express');
const { createReceptionist, getReceptionists, getReceptionistById, updateReceptionist, deleteReceptionist } = require('../controllers/receptionistController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', createReceptionist);
router.get('/', getReceptionists);
router.get('/:id', getReceptionistById);
router.put('/:id', updateReceptionist);
router.delete('/:id', deleteReceptionist);

module.exports = router;
