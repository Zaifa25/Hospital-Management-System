const prisma = require('../config/db');

/**
 * Log a user action in Audit Log
 */
const logAudit = async (userId, userEmail, action, resource, details, ipAddress) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || null,
        action,
        resource,
        details,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

/**
 * Get Audit Logs
 * @route GET /api/audit/logs
 */
const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  logAudit,
  getAuditLogs,
};
