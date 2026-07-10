const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Register Admin/Staff (initial setup, or admin creating staff)
const registerAdmin = async (req, res) => {
  const { email, password, name, roleId } = req.body;

  const adminExists = await prisma.admin.findFirst();
  if (adminExists) {
    // Only logged-in Admins can create more accounts
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ message: 'Admin already exists. Only authorized admins can register more accounts.' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.roleId !== 1) {
        return res.status(403).json({ message: 'Only administrators can create new accounts.' });
      }
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired session token.' });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId: roleId ? Number(roleId) : 1, // Default to 1 (Admin)
      },
    });
    const token = jwt.sign({ id: admin.id, roleId: admin.roleId }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login checking both Admin and Doctor tables
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  let user = await prisma.admin.findUnique({ where: { email } });
  if (!user) {
    // Check doctor table
    user = await prisma.doctor.findUnique({ where: { email } });
  }

  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

  const token = jwt.sign({ id: user.id, roleId: user.roleId }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.json({ token, admin: user });
};

const logout = async (req, res) => {
  try {
    // You can still check if the token exists (optional)
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(400).json({ message: "No token provided" })
    }

    // Nothing else needed — just respond success
    return res.json({ message: "Logout successful" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    console.log(req.body);
    
    const adminId = req.user.id; // This comes from auth middleware
    console.log("adminid",adminId);

    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { registerAdmin, adminLogin, logout, changePassword }

