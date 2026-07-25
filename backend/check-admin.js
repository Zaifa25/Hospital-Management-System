const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.admin.findMany({
    select: { id: true, email: true, name: true, roleId: true, createdAt: true }
  });

  if (admins.length === 0) {
    console.log('❌ No admin accounts found in the database.');
  } else {
    console.log(`✅ Found ${admins.length} admin account(s):\n`);
    admins.forEach(a => {
      console.log(`  ID     : ${a.id}`);
      console.log(`  Name   : ${a.name}`);
      console.log(`  Email  : ${a.email}`);
      console.log(`  RoleId : ${a.roleId}`);
      console.log(`  Created: ${a.createdAt}`);
      console.log('---');
    });
  }

  // Test login API
  const http = require('http');
  const body = JSON.stringify({ email: admins[0]?.email, password: 'test', role: 'admin' });

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  };

  console.log('\n🔌 Testing login endpoint at http://localhost:5001/api/auth/login ...');
  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 401) {
        console.log('✅ Endpoint reachable — got 401 (wrong password, but server is responding correctly)');
      } else {
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${data}`);
      }
      prisma.$disconnect();
    });
  });

  req.on('error', e => {
    console.log('❌ Backend NOT reachable:', e.message);
    prisma.$disconnect();
  });

  req.write(body);
  req.end();
}

main().catch(e => { console.log('ERR:', e.message); prisma.$disconnect(); });
