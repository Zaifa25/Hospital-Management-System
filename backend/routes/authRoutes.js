/**
 * @file authRoutes.js
 * @description API router defining authentication endpoints (/register, /login, /logout, /changePassword).
 */

const express = require('express');
const { registerAdmin, adminLogin, logout, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

/** POST /api/auth/register - Register new administrator account */
router.post('/register', registerAdmin);

/** POST /api/auth/login - User authentication & JWT issuance */
router.post('/login', adminLogin);

/** POST /api/auth/logout - Invalidate user session */
router.post('/logout', logout);

/** PUT /api/auth/changePassword - Change user password (Requires JWT) */
router.put('/changePassword', authMiddleware, changePassword);

module.exports = router;

