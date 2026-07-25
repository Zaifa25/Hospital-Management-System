const axios = require('axios');
const jwt = require('jsonwebtoken'); // to simulate if needed, or we just bypass auth if we remove middleware temporarily

// Actually, I can just use prisma to get the exact data for doctor ID 13
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const allAppts = await prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: true,
        department: true
      }
    });
  
  const id = '13';
  const doctorAppts = allAppts
          .filter((a) => String(a.doctorId) === String(id))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
  console.log(`Doctor 13 has ${doctorAppts.length} appointments.`);
  if (doctorAppts.length > 0) {
    console.log("Sample appointment day:", doctorAppts[0].day);
    console.log("Sample appointment date:", doctorAppts[0].date);
  }
}
test().finally(() => prisma.$disconnect());
