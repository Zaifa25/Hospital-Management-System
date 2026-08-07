const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getAuditLogs } = require('../controllers/auditController');

router.use(authMiddleware);

router.get('/logs', getAuditLogs);

module.exports = router;
