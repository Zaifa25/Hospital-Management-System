const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.appointment.findMany({take: 5}).then(console.log).finally(()=>prisma.$disconnect());
