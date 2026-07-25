const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@hospital.com',
      password: 'password123',
      role: 'admin'
    });
    const token = loginRes.data.token;
    const headers = { Authorization: 'Bearer ' + token };

    const empRes = await axios.get('http://localhost:5001/api/employees', { headers });
    const attRes = await axios.get('http://localhost:5001/api/attendance', { headers });
    const payRes = await axios.get('http://localhost:5001/api/payrolls', { headers });

    console.log(`Employees: ${empRes.data.length}`);
    console.log(`Attendance Records: ${attRes.data.length}`);
    console.log(`Payrolls: ${payRes.data.length}`);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
test();
