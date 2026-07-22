const { PrismaClient } = require('@prisma/client');
const passwordsToTry = ['postgres', 'admin', 'root', '123456', '', 'password'];

async function testPasswords() {
  for (const pwd of passwordsToTry) {
    const pwdPart = pwd ? `:${pwd}` : '';
    const dbUrl = `postgresql://postgres${pwdPart}@localhost:5432/postgres?sslmode=disable`;
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });

    try {
      await prisma.$connect();
      console.log(`SUCCESS! The correct password is: "${pwd}"`);
      await prisma.$disconnect();
      return;
    } catch (e) {
      if (e.message.includes('Authentication failed')) {
        console.log(`Failed with password: "${pwd}"`);
      } else {
        console.log(`Error with password: "${pwd}" - ${e.message.split('\n')[0]}`);
      }
    } finally {
      await prisma.$disconnect();
    }
  }
  console.log("None of the default passwords worked.");
}

testPasswords();
