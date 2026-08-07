const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateUsers() {
  console.log('Starting migration to unified User table...');

  try {
    // 1. Ensure Roles exist
    const defaultRoles = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'Doctor' },
      { id: 3, name: 'DSA' },
      { id: 4, name: 'Receptionist' },
      { id: 5, name: 'HR' },
      { id: 6, name: 'Employee' },
    ];

    for (const role of defaultRoles) {
      await prisma.role.upsert({
        where: { id: role.id },
        update: { name: role.name },
        create: { id: role.id, name: role.name },
      });
    }
    console.log('Roles verified/seeded.');

    // 2. Migrate Admins
    const admins = await prisma.admin.findMany();
    for (const a of admins) {
      await prisma.user.upsert({
        where: { email: a.email },
        update: { password: a.password, name: a.name, roleId: 1 },
        create: { email: a.email, password: a.password, name: a.name, roleId: 1 },
      });
    }
    console.log(`Migrated ${admins.length} Admin records.`);

    // 3. Migrate Doctors
    const doctors = await prisma.doctor.findMany();
    for (const d of doctors) {
      await prisma.user.upsert({
        where: { email: d.email },
        update: { password: d.password, name: d.name, phone: d.phone, roleId: 2 },
        create: { email: d.email, password: d.password, name: d.name, phone: d.phone, roleId: 2 },
      });
    }
    console.log(`Migrated ${doctors.length} Doctor records.`);

    // 4. Migrate DSA Profiles
    const dsas = await prisma.dSAProfile.findMany();
    for (const dsa of dsas) {
      await prisma.user.upsert({
        where: { email: dsa.email },
        update: { password: dsa.password, name: dsa.name, phone: dsa.contactNo, roleId: 3 },
        create: { email: dsa.email, password: dsa.password, name: dsa.name, phone: dsa.contactNo, roleId: 3 },
      });
    }
    console.log(`Migrated ${dsas.length} DSA records.`);

    // 5. Migrate Receptionists
    const receptionists = await prisma.receptionist.findMany();
    for (const r of receptionists) {
      await prisma.user.upsert({
        where: { email: r.email },
        update: { password: r.password, name: r.name, phone: r.phone, roleId: 4 },
        create: { email: r.email, password: r.password, name: r.name, phone: r.phone, roleId: 4 },
      });
    }
    console.log(`Migrated ${receptionists.length} Receptionist records.`);

    // 6. Migrate HR Profiles
    const hrs = await prisma.hRProfile.findMany();
    for (const h of hrs) {
      await prisma.user.upsert({
        where: { email: h.email },
        update: { password: h.password, name: h.name, phone: h.phone, roleId: 5 },
        create: { email: h.email, password: h.password, name: h.name, phone: h.phone, roleId: 5 },
      });
    }
    console.log(`Migrated ${hrs.length} HR records.`);

    // 7. Migrate Employees (if password exists)
    const employees = await prisma.employee.findMany();
    for (const emp of employees) {
      if (emp.email && emp.password) {
        await prisma.user.upsert({
          where: { email: emp.email },
          update: { password: emp.password, name: emp.name, phone: emp.phone, roleId: emp.roleId || 6 },
          create: { email: emp.email, password: emp.password, name: emp.name, phone: emp.phone, roleId: emp.roleId || 6 },
        });
      }
    }
    console.log(`Migrated ${employees.length} Employee records.`);

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Error migrating users:', err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsers();
