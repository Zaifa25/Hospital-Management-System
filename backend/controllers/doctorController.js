const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

const createDoctor = async (req, res) => {
  try {
    const { name, email, departmentId, status, password, phone, qualification, experience, address } = req.body;
    if (!name || !email || !departmentId || !status || !password) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let profilePicture = null;
    if (req.file) {
      profilePicture = `/uploads/profiles/${req.file.filename}`;
    }
    console.log("DATA", req.body);
    const doctor = await prisma.doctor.create({
      data: {
        name,
        email,
        departmentId: parseInt(departmentId),
        status,
        password: hashedPassword,
        phone,
        qualification,
        experience,
        address,
        profilePicture,
        roleId: 2 // Ensure Doctor roleId is set
      }
    });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await prisma.doctor.findUnique({ where: { id: parseInt(id) } });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const data = { ...req.body };
    if(data.password){
      data.password = await bcrypt.hash(data.password, 10);
    }
    if (data.departmentId) {
      data.departmentId = parseInt(data.departmentId);
    }
    if (req.file) {
      data.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }
    const updated = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDoctor = async (req, res) => {
  const { id } = req.params;
  const doctorId = parseInt(id);
  try {
    // Delete any appointments associated with this doctor first to satisfy foreign key constraints
    await prisma.appointment.deleteMany({ where: { doctorId } });

    await prisma.doctor.delete({ where: { id: doctorId } });
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor };
