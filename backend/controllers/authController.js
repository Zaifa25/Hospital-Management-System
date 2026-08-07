const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { logAudit } = require('./auditController');

/**
 * Register a new Admin or Staff user account.
 * Requires administrator credentials if an initial admin already exists.
 * @route POST /api/auth/register
 */
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

/**
 * Authenticate Admin, HR, Doctor, Receptionist, or DSA user accounts.
 * Returns JWT bearer token upon successful verification.
 * @route POST /api/auth/login
 */
const adminLogin = async (req, res) => {
  const { email, password, role } = req.body;

  let user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  // Fallback to legacy tables if not found in User table
  if (!user) {
    if (role === 'admin') {
      user = await prisma.admin.findUnique({ where: { email } });
    } else if (role === 'doctor') {
      user = await prisma.doctor.findUnique({ where: { email } });
    } else if (role === 'receptionist') {
      user = await prisma.receptionist.findUnique({ where: { email } });
    } else if (role === 'hr') {
      user = await prisma.hRProfile.findUnique({ where: { email } });
    } else if (role === 'dsa') {
      user = await prisma.dSAProfile.findUnique({ where: { email } });
    } else if (role === 'employee') {
      user = await prisma.employee.findUnique({ where: { email } });
    } else {
      user = await prisma.admin.findUnique({ where: { email } }) ||
             await prisma.doctor.findUnique({ where: { email } }) ||
             await prisma.receptionist.findUnique({ where: { email } }) ||
             await prisma.hRProfile.findUnique({ where: { email } }) ||
             await prisma.dSAProfile.findUnique({ where: { email } }) ||
             await prisma.employee.findUnique({ where: { email } });
    }
  }

  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  if (!user.password) {
    return res.status(401).json({ message: 'Account does not have a password configured. Please contact HR.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

  const token = jwt.sign(
    { id: user.id, roleId: user.roleId || 6, roleName: user.role?.name || role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  // Record login audit event
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || null;
  await logAudit(user.id, user.email, 'LOGIN', `User #${user.id} (${user.email})`, `Role: ${user.role?.name || role}`, ip);

  res.json({ token, admin: user });
};

/**
 * Invalidate user session client-side.
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // Check if the token header exists
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(400).json({ message: "No token provided" })
    }

    // Respond with logout confirmation
    return res.json({ message: "Logout successful" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * Change authenticated user's account password.
 * @route POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const adminId = req.user.id; // Extracted from decoded JWT token in auth middleware

    // Get admin user from database
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password match
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password record in database
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

