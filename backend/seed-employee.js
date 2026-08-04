const bcrypt = require('bcryptjs');
const prisma = require('./config/db');

async function seedEmployee() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const emp = await prisma.employee.upsert({
      where: { email: 'employee@hms.com' },
      update: {
        password: hashedPassword,
        roleId: 6,
      },
      create: {
        name: 'Sarah Connor',
        email: 'employee@hms.com',
        password: hashedPassword,
        roleId: 6,
        phone: '+92 300 1234567',
        cnic: '35202-1234567-1',
        type: 'Staff',
        designation: 'Lab Technician',
        salary: 65000,
        status: 'active',
        address: 'Lahore, Pakistan',
      },
    });

    console.log('Sample Employee created/updated successfully:');
    console.log('Email:', emp.email);
    console.log('Password: password123');
    console.log('Role ID:', emp.roleId);
  } catch (err) {
    console.error('Error seeding sample employee:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedEmployee();
