const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed Pakistan data...');

  // 1. Departments
  const deptCardio = await prisma.department.upsert({
    where: { name: 'Cardiology' },
    update: {},
    create: { name: 'Cardiology', status: 'active', displaySequence: 1 },
  });
  const deptOrtho = await prisma.department.upsert({
    where: { name: 'Orthopedics' },
    update: {},
    create: { name: 'Orthopedics', status: 'active', displaySequence: 2 },
  });

  // 2. Procedures
  const ecg = await prisma.procedure.create({
    data: {
      name: 'ECG',
      departmentId: deptCardio.id,
      cost: 1500.00,
      effectiveDate: new Date(),
      status: 'active',
      displaySequence: 1,
    }
  });
  const xRay = await prisma.procedure.create({
    data: {
      name: 'X-Ray Knee',
      departmentId: deptOrtho.id,
      cost: 2500.00,
      effectiveDate: new Date(),
      status: 'active',
      displaySequence: 1,
    }
  });

  // 3. Doctors
  const defaultPassword = await bcrypt.hash('password123', 10);
  const drAli = await prisma.doctor.upsert({
    where: { email: 'dr.ali@hospital.com.pk' },
    update: {},
    create: {
      name: 'Dr. Ali Khan',
      departmentId: deptCardio.id,
      email: 'dr.ali@hospital.com.pk',
      password: defaultPassword,
      status: 'active',
    }
  });
  const drFatima = await prisma.doctor.upsert({
    where: { email: 'dr.fatima@hospital.com.pk' },
    update: {},
    create: {
      name: 'Dr. Fatima Tariq',
      departmentId: deptOrtho.id,
      email: 'dr.fatima@hospital.com.pk',
      password: defaultPassword,
      status: 'active',
    }
  });

  // 4. Patients
  const patient1 = await prisma.patient.upsert({
    where: { mrNo: 'MR-LHR-001' },
    update: {},
    create: {
      mrNo: 'MR-LHR-001',
      registration: new Date(),
      fullName: 'Usman Ahmed',
      sex: 'male',
      age: 45,
      maritalStatus: 'married',
      phone: '03001234567',
      email: 'usman@gmail.com',
      occupation: 'Teacher',
      address: 'Gulberg III, Lahore',
      membership: 'Standard',
      status: 'active',
      fee: 2000.00,
    }
  });
  const patient2 = await prisma.patient.upsert({
    where: { mrNo: 'MR-KHI-002' },
    update: {},
    create: {
      mrNo: 'MR-KHI-002',
      registration: new Date(),
      fullName: 'Ayesha Malik',
      sex: 'female',
      age: 32,
      maritalStatus: 'single',
      phone: '03217654321',
      email: 'ayesha.m@yahoo.com',
      occupation: 'Software Engineer',
      address: 'DHA Phase 6, Karachi',
      membership: 'Premium',
      status: 'active',
      fee: 1500.00,
    }
  });

  // 5. Appointments
  const appt1 = await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: drAli.id,
      departmentId: deptCardio.id,
      type: 'Consultation',
      date: new Date(),
      time: '10:00',
      day: 'Monday',
      tokenNo: 1,
      appointNo: 1001,
      reason: 'Chest pain evaluation',
      status: 'confirmed',
    }
  });

  const appt2 = await prisma.appointment.create({
    data: {
      patientId: patient2.id,
      doctorId: drFatima.id,
      departmentId: deptOrtho.id,
      type: 'Follow-up',
      date: new Date(),
      time: '14:30',
      day: 'Tuesday',
      tokenNo: 2,
      appointNo: 1002,
      reason: 'Post-surgery check',
      status: 'scheduled',
    }
  });

  // 6. Payments
  await prisma.payment.create({
    data: {
      patientId: patient1.id,
      date: new Date(),
      method: 'cash',
      mrNo: patient1.mrNo,
      preBalance: 0,
      netTotal: 3500.00, // 2000 fee + 1500 ECG
      paid: 3500.00,
      xrayCharge: 0,
      xrayPaid: 0,
      status: 'paid',
    }
  });

  await prisma.payment.create({
    data: {
      patientId: patient2.id,
      date: new Date(),
      method: 'card',
      mrNo: patient2.mrNo,
      preBalance: 0,
      netTotal: 4000.00, // 1500 fee + 2500 XRay
      paid: 4000.00,
      xrayCharge: 2500.00,
      xrayPaid: 2500.00,
      status: 'paid',
    }
  });

  // 7. DSA Profile
  await prisma.dSAProfile.upsert({
    where: { cnic: '35202-1234567-1' },
    update: {},
    create: {
      name: 'Bilal Qureshi',
      fatherName: 'Tariq Qureshi',
      cnic: '35202-1234567-1',
      email: 'bilal.dsa@hospital.com.pk',
      password: defaultPassword,
      address: 'Johar Town, Lahore',
      qualification: 'BSc Nursing',
      joiningDate: new Date('2024-01-15'),
      contactNo: '03339876543',
      status: 'active',
    }
  });

  // 8. Receptionist
  await prisma.receptionist.upsert({
    where: { email: 'sara.rec@hospital.com.pk' },
    update: {},
    create: {
      name: 'Sara Ahmed',
      email: 'sara.rec@hospital.com.pk',
      password: defaultPassword,
      phone: '03115555555',
      address: 'F-8, Islamabad',
      status: 'Active',
    }
  });

  console.log('Successfully seeded Pakistan data!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
