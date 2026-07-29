/**
 * @file doctorRoutes.js
 * @description Express router for Doctor management, profile picture file upload, and CRUD endpoints.
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Multer storage configuration for doctor profile avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/profiles/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Require JWT authentication for all doctor API routes
router.use(authMiddleware);

/** POST /api/doctors - Create new doctor profile (supports avatar upload) */
router.post('/', upload.single('profilePicture'), createDoctor);

/** GET /api/doctors - Retrieve all active doctor profiles */
router.get('/', getDoctors);

/** GET /api/doctors/:id - Retrieve doctor details by ID */
router.get('/:id', getDoctorById);

/** PUT /api/doctors/:id - Update doctor profile & avatar image by ID */
router.put('/:id', upload.single('profilePicture'), updateDoctor);

/** DELETE /api/doctors/:id - Delete doctor profile and cascade appointments by ID */
router.delete('/:id', deleteDoctor);

module.exports = router;

