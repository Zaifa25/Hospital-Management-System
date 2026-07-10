const prisma = require('./config/db');

async function seedRoles() {
  try {
    await prisma.role.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, name: 'Admin' },
    });
    await prisma.role.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, name: 'Doctor' },
    });
    await prisma.role.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, name: 'DSA' },
    });
    console.log('Roles seeded successfully.');
  } catch (err) {
    console.error('Error seeding roles:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedRoles();
