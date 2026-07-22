const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding around 100 records for each module...');
  const defaultPassword = await bcrypt.hash('password123', 10);

  // Departments (Create 10 departments)
  const departments = [];
  const deptNames = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Dermatology', 'Psychiatry', 'Radiology', 'General Surgery', 'Urology'];
  for (let i = 0; i < deptNames.length; i++) {
    const dept = await prisma.department.upsert({
      where: { name: deptNames[i] },
      update: {},
      create: { name: deptNames[i], status: 'active', displaySequence: i + 1 },
    });
    departments.push(dept);
  }
  console.log(`Created ${departments.length} departments.`);

  // Procedures (100)
  const procedures = [];
  for (let i = 0; i < 100; i++) {
    const proc = await prisma.procedure.create({
      data: {
        name: faker.lorem.words(2),
        departmentId: departments[faker.number.int({ min: 0, max: departments.length - 1 })].id,
        cost: parseFloat(faker.commerce.price({ min: 500, max: 10000 })),
        effectiveDate: faker.date.past(),
        status: faker.helpers.arrayElement(['active', 'inactive']),
        displaySequence: i + 1,
      }
    });
    procedures.push(proc);
  }
  console.log('Created 100 procedures.');

  // Doctors (100)
  const doctors = [];
  for (let i = 0; i < 100; i++) {
    const doc = await prisma.doctor.create({
      data: {
        name: `Dr. ${faker.person.fullName()}`,
        departmentId: departments[faker.number.int({ min: 0, max: departments.length - 1 })].id,
        email: faker.internet.email() + i,
        password: defaultPassword,
        roleId: 2,
        status: faker.helpers.arrayElement(['active', 'inactive']),
        phone: faker.phone.number(),
        qualification: 'MBBS, FCPS',
        experience: `${faker.number.int({ min: 2, max: 30 })} Years`,
        address: faker.location.streetAddress(),
      }
    });
    doctors.push(doc);
  }
  console.log('Created 100 doctors.');

  // Patients (100)
  const patients = [];
  for (let i = 0; i < 100; i++) {
    const pat = await prisma.patient.create({
      data: {
        mrNo: `MR-${faker.string.alphanumeric(6).toUpperCase()}-${i}`,
        registration: faker.date.past(),
        fullName: faker.person.fullName(),
        sex: faker.helpers.arrayElement(['male', 'female']),
        age: faker.number.int({ min: 1, max: 90 }),
        maritalStatus: faker.helpers.arrayElement(['single', 'married']),
        phone: faker.phone.number(),
        email: faker.internet.email() + i,
        occupation: faker.person.jobTitle(),
        address: faker.location.streetAddress(),
        membership: faker.helpers.arrayElement(['Standard', 'Premium']),
        status: faker.helpers.arrayElement(['active', 'inactive']),
        fee: parseFloat(faker.commerce.price({ min: 1000, max: 5000 })),
      }
    });
    patients.push(pat);
  }
  console.log('Created 100 patients.');

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
        time: `${faker.number.int({ min: 8, max: 18 })}:00`,
        day: faker.helpers.arrayElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        tokenNo: faker.number.int({ min: 1, max: 50 }),
        appointNo: 2000 + i,
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

  // DSA Profiles (100)
  for (let i = 0; i < 100; i++) {
    await prisma.dSAProfile.create({
      data: {
        name: faker.person.fullName(),
        fatherName: faker.person.firstName('male'),
        cnic: `${faker.string.numeric(5)}-${faker.string.numeric(7)}-${faker.string.numeric(1)}${i}`,
        email: faker.internet.email() + i,
        password: defaultPassword,
        address: faker.location.streetAddress(),
        qualification: 'BSc Nursing',
        joiningDate: faker.date.past(),
        contactNo: faker.string.numeric(11),
        status: faker.helpers.arrayElement(['active', 'inactive']),
        roleId: 3
      }
    });
  }
  console.log('Created 100 DSA Profiles.');

  // Receptionists (100)
  for (let i = 0; i < 100; i++) {
    await prisma.receptionist.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email() + i,
        password: defaultPassword,
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        status: faker.helpers.arrayElement(['Active', 'Inactive']),
        roleId: 4
      }
    });
  }
  console.log('Created 100 Receptionists.');

  console.log('Finished seeding 100 records for each module!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
