const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const dsaRoutes = require('./routes/dsaRoutes');
const procedureRoutes = require('./routes/procedureRoutes');

dotenv.config();
const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    try {
      const { hostname } = new URL(origin);
      const isPrivateDevIp = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.|100\.)/.test(hostname);
      if (hostname === 'localhost' || hostname === '127.0.0.1' || isPrivateDevIp) {
        return callback(null, true);
      }
    } catch (error) {
      // If origin cannot be parsed, reject it.
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/dsas', dsaRoutes);
app.use('/api/procedures', procedureRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 