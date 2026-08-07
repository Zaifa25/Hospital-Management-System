const prisma = require('../config/db');

/**
 * Get all Wards and their Beds
 * @route GET /api/ipd/wards
 */
const getWards = async (req, res) => {
  try {
    const wards = await prisma.ward.findMany({
      include: {
        beds: {
          include: {
            admissions: {
              where: { status: 'Admitted' },
              include: {
                patient: { select: { id: true, fullName: true, mrNo: true } },
                admittingDoctor: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(wards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create a new Ward
 * @route POST /api/ipd/wards
 */
const createWard = async (req, res) => {
  try {
    const { name, type, totalBeds, dailyRate } = req.body;

    if (!name || !type || !totalBeds || !dailyRate) {
      return res.status(400).json({ message: 'Name, Type, Total Beds, and Daily Rate are required' });
    }

    const ward = await prisma.ward.create({
      data: {
        name,
        type,
        totalBeds: Number(totalBeds),
        dailyRate: parseFloat(dailyRate),
      },
    });

    // Auto-create beds for this ward
    const bedCount = Number(totalBeds);
    const bedData = [];
    for (let i = 1; i <= bedCount; i++) {
      bedData.push({
        wardId: ward.id,
        bedNumber: `${name.substring(0, 3).toUpperCase()}-${String(i).padStart(2, '0')}`,
        status: 'Available',
      });
    }

    await prisma.bed.createMany({ data: bedData });

    res.status(201).json({ message: 'Ward and Beds created successfully', ward });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Admit a patient to a bed
 * @route POST /api/ipd/admit
 */
const admitPatient = async (req, res) => {
  try {
    const { patientId, bedId, admittingDoctorId } = req.body;

    if (!patientId || !bedId || !admittingDoctorId) {
      return res.status(400).json({ message: 'Patient ID, Bed ID, and Admitting Doctor ID are required' });
    }

    // Check if bed is available
    const bed = await prisma.bed.findUnique({ where: { id: Number(bedId) } });
    if (!bed || bed.status !== 'Available') {
      return res.status(400).json({ message: 'Selected bed is not available for admission' });
    }

    // Create Admission and update Bed status
    const admission = await prisma.admission.create({
      data: {
        patientId: Number(patientId),
        bedId: Number(bedId),
        admittingDoctorId: Number(admittingDoctorId),
        status: 'Admitted',
      },
      include: {
        patient: { select: { id: true, fullName: true, mrNo: true } },
        bed: { include: { ward: true } },
        admittingDoctor: { select: { id: true, name: true } },
      },
    });

    await prisma.bed.update({
      where: { id: Number(bedId) },
      data: { status: 'Occupied' },
    });

    res.status(201).json({ message: 'Patient admitted successfully', admission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Discharge an admitted patient
 * @route POST /api/ipd/discharge/:admissionId
 */
const dischargePatient = async (req, res) => {
  try {
    const { admissionId } = req.params;
    const { dischargeSummary } = req.body;

    const admission = await prisma.admission.findUnique({
      where: { id: Number(admissionId) },
    });

    if (!admission || admission.status !== 'Admitted') {
      return res.status(400).json({ message: 'Active admission not found' });
    }

    // Update Admission status and free the bed
    const updatedAdmission = await prisma.admission.update({
      where: { id: Number(admissionId) },
      data: {
        dischargeDate: new Date(),
        dischargeSummary: dischargeSummary || 'Discharged in stable condition.',
        status: 'Discharged',
      },
    });

    await prisma.bed.update({
      where: { id: admission.bedId },
      data: { status: 'Available' },
    });

    res.json({ message: 'Patient discharged successfully', admission: updatedAdmission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getWards,
  createWard,
  admitPatient,
  dischargePatient,
};
