const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 100 patients and 15 doctors...');
  const defaultPassword = await bcrypt.hash('password123', 10);

  // Departments (Create 5 departments if they don't exist)
  const departments = [];
  const deptNames = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Surgery'];
  for (let i = 0; i < deptNames.length; i++) {
    const dept = await prisma.department.upsert({
      where: { name: deptNames[i] },
      update: {},
      create: { name: deptNames[i], status: 'active', displaySequence: i + 1 },
    });
    departments.push(dept);
  }
  console.log(`Created/Verified ${departments.length} departments.`);

  // Doctors (15)
  const doctors = [];
  for (let i = 0; i < 15; i++) {
    const doc = await prisma.doctor.create({
      data: {
        name: `Dr. ${faker.person.fullName()}`,
        departmentId: departments[faker.number.int({ min: 0, max: departments.length - 1 })].id,
        email: faker.internet.email() + i,
        password: defaultPassword,
        roleId: 2,
        status: faker.helpers.arrayElement(['active', 'inactive']),
        phone: faker.phone.number(),
        qualification: faker.helpers.arrayElement(['MBBS, FCPS', 'MD, PhD', 'BDS, MDS', 'MBBS, MS']),
        experience: `${faker.number.int({ min: 2, max: 30 })} Years`,
        address: faker.location.streetAddress(),
        description: faker.lorem.paragraph(),
      }
    });
    doctors.push(doc);
  }
  console.log('Created 15 doctors.');

  // Patients (100)
  const patients = [];
  for (let i = 0; i < 100; i++) {
    const pat = await prisma.patient.create({
      data: {
        mrNo: `MR-${faker.string.alphanumeric(6).toUpperCase()}-${Date.now().toString().slice(-4)}${i}`,
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
