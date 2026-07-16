const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.dSAProfile.deleteMany({});
  console.log('Deleted DSAs');
}
main().catch(console.error).finally(() => prisma.$disconnect());
