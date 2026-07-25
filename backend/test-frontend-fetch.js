const axios = require('axios');

async function check() {
  try {
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@hospital.com',
      password: 'password123',
      role: 'admin'
    });
    const token = loginRes.data.token;
    
    const apptsRes = await axios.get('http://localhost:5001/api/appointments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const docsRes = await axios.get('http://localhost:5001/api/doctors', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const docId = docsRes.data[0].id; // test first doctor
    
    const appts = apptsRes.data;
    console.log(`Total appointments fetched: ${appts.length}`);
    const doctorAppts = appts.filter(a => String(a.doctorId) === String(docId));
    console.log(`Appointments for Doctor ${docId}: ${doctorAppts.length}`);
  } catch(e) {
    console.error(e.response?.data || e.message);
  }
}
check();
