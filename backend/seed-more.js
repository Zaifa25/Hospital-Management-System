const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 1 Receptionist, 100 Appointments, and 100 Payments...');
  const defaultPassword = await bcrypt.hash('password123', 10);

  // Receptionist (1)
  const receptionistCount = await prisma.receptionist.count({ where: { email: 'receptionist@hospital.com' } });
  if (receptionistCount === 0) {
    await prisma.receptionist.create({
      data: {
        name: 'Sarah Jenkins (Receptionist)',
        email: 'receptionist@hospital.com',
        password: defaultPassword,
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        status: 'Active',
        roleId: 4
      }
    });
    console.log('Created 1 Receptionist (receptionist@hospital.com).');
  } else {
    console.log('Receptionist already exists.');
  }

  // Fetch existing Doctors and Patients
  const doctors = await prisma.doctor.findMany();
  const patients = await prisma.patient.findMany();

  if (doctors.length === 0 || patients.length === 0) {
    console.error('No doctors or patients found in the database. Please run the previous seed script first.');
    return;
  }

  // Appointments (100)
  const appointments = [];
  for (let i = 0; i < 100; i++) {
    const doc = doctors[faker.number.int({ min: 0, max: doctors.length - 1 })];
    const pat = patients[faker.number.int({ min: 0, max: patients.length - 1 })];
    const appt = await prisma.appointment.create({
      data: {
        patientId: pat.id,
        doctorId: doc.id,
        departmentId: doc.departmentId,
        type: faker.helpers.arrayElement(['Consultation', 'Follow-up', 'Emergency']),
        date: faker.date.soon(),
        time: `${faker.number.int({ min: 8, max: 18 }).toString().padStart(2, '0')}:${faker.helpers.arrayElement(['00', '15', '30', '45'])}`,
        day: faker.helpers.arrayElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        tokenNo: faker.number.int({ min: 1, max: 50 }),
        appointNo: 3000 + i,
        reason: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(['scheduled', 'confirmed', 'completed', 'cancelled']),
      }
    });
    appointments.push(appt);
  }
  console.log('Created 100 appointments.');

  // Payments (100)
  for (let i = 0; i < 100; i++) {
    const pat = patients[faker.number.int({ min: 0, max: patients.length - 1 })];
    await prisma.payment.create({
      data: {
        patientId: pat.id,
        date: faker.date.recent(),
        method: faker.helpers.arrayElement(['cash', 'card', 'online']),
        mrNo: pat.mrNo,
        preBalance: 0,
        netTotal: parseFloat(faker.commerce.price({ min: 1000, max: 5000 })),
        paid: parseFloat(faker.commerce.price({ min: 1000, max: 5000 })),
        xrayCharge: 0,
        xrayPaid: 0,
        status: faker.helpers.arrayElement(['paid', 'unpaid', 'partial']),
      }
    });
  }
  console.log('Created 100 payments.');

  console.log('Finished seeding!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
