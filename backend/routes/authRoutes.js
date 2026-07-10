const express = require('express');
const { registerAdmin, adminLogin,logout,changePassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', adminLogin);
router.post('/logout',logout);
router.put('/changePassword',authMiddleware, changePassword);

module.exports = router;
