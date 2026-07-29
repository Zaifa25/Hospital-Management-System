/**
 * @file receptionistRoutes.js
 * @description Express router for Receptionist staff account management endpoints.
 */

const express = require('express');
const { createReceptionist, getReceptionists, getReceptionistById, updateReceptionist, deleteReceptionist } = require('../controllers/receptionistController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Require JWT authentication for receptionist endpoints
router.use(authMiddleware);

/** POST /api/receptionists - Create receptionist user account */
router.post('/', createReceptionist);

/** GET /api/receptionists - Retrieve all active receptionist profiles */
router.get('/', getReceptionists);

/** GET /api/receptionists/:id - Fetch receptionist details by ID */
router.get('/:id', getReceptionistById);

/** PUT /api/receptionists/:id - Update receptionist profile by ID */
router.put('/:id', updateReceptionist);

/** DELETE /api/receptionists/:id - Delete receptionist account by ID */
router.delete('/:id', deleteReceptionist);

module.exports = router;

