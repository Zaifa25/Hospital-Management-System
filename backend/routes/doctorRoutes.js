const express = require('express');
const multer = require('multer');
const path = require('path');
const { createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/profiles/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.use(authMiddleware);

router.post('/', upload.single('profilePicture'), createDoctor);
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', upload.single('profilePicture'), updateDoctor);
router.delete('/:id', deleteDoctor);

module.exports = router;
