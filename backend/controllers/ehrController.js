const prisma = require('../config/db');

/**
 * Record patient vitals (BP, Pulse, Temp, SpO2, Weight, Height)
 * @route POST /api/ehr/vitals
 */
const recordVitals = async (req, res) => {
  try {
    const { patientId, bpSystolic, bpDiastolic, pulse, temperature, spo2, weight, height, recordedBy } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    const vitals = await prisma.vitals.create({
      data: {
        patientId: Number(patientId),
        bpSystolic: bpSystolic ? Number(bpSystolic) : null,
        bpDiastolic: bpDiastolic ? Number(bpDiastolic) : null,
        pulse: pulse ? Number(pulse) : null,
        temperature: temperature ? Number(temperature) : null,
        spo2: spo2 ? Number(spo2) : null,
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        recordedBy: recordedBy || req.user?.name || 'Staff',
      },
    });

    res.status(201).json({ message: 'Vitals recorded successfully', vitals });
  } catch (err) {
    console.error('Error recording vitals:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get vitals history for a patient
 * @route GET /api/ehr/vitals/:patientId
 */
const getPatientVitals = async (req, res) => {
  try {
    const { patientId } = req.params;
    const vitals = await prisma.vitals.findMany({
      where: { patientId: Number(patientId) },
      orderBy: { recordedAt: 'desc' },
    });

    res.json(vitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create a Consultation / Clinical Note
 * @route POST /api/ehr/consultations
 */
const createConsultationNote = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, chiefComplaint, diagnosis, icd10Code, clinicalNotes } = req.body;

    if (!patientId || !doctorId || !chiefComplaint || !diagnosis) {
      return res.status(400).json({ message: 'Patient ID, Doctor ID, Chief Complaint, and Diagnosis are required' });
    }

    const note = await prisma.consultationNote.create({
      data: {
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        appointmentId: appointmentId ? Number(appointmentId) : null,
        chiefComplaint,
        diagnosis,
        icd10Code,
        clinicalNotes,
      },
      include: {
        doctor: { select: { id: true, name: true, qualification: true } },
        patient: { select: { id: true, fullName: true, mrNo: true } },
      },
    });

    res.status(201).json({ message: 'Consultation note created successfully', note });
  } catch (err) {
    console.error('Error creating consultation note:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get Consultation Notes for a patient
 * @route GET /api/ehr/consultations/:patientId
 */
const getPatientConsultations = async (req, res) => {
  try {
    const { patientId } = req.params;
    const notes = await prisma.consultationNote.findMany({
      where: { patientId: Number(patientId) },
      include: {
        doctor: { select: { id: true, name: true, qualification: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create a new Prescription
 * @route POST /api/ehr/prescriptions
 */
const createPrescription = async (req, res) => {
  try {
    const { patientId, doctorId, items } = req.body; // items: [{ medicineName, dosage, frequency, duration, instructions }]

    if (!patientId || !doctorId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Patient ID, Doctor ID, and prescription items are required' });
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        status: 'Active',
        items: {
          create: items.map((item) => ({
            medicineName: item.medicineName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions || '',
          })),
        },
      },
      include: {
        items: true,
        doctor: { select: { id: true, name: true, qualification: true } },
        patient: { select: { id: true, fullName: true, mrNo: true } },
      },
    });

    res.status(201).json({ message: 'Prescription issued successfully', prescription });
  } catch (err) {
    console.error('Error creating prescription:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get Prescriptions for a patient or all active prescriptions
 * @route GET /api/ehr/prescriptions
 */
const getPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.query;
    const where = patientId ? { patientId: Number(patientId) } : {};

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        items: true,
        doctor: { select: { id: true, name: true, qualification: true } },
        patient: { select: { id: true, fullName: true, mrNo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  recordVitals,
  getPatientVitals,
  createConsultationNote,
  getPatientConsultations,
  createPrescription,
  getPrescriptions,
};
