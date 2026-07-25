const http = require('http');

http.get('http://localhost:5001/api/appointments', (res) => {
  console.log('Appointments Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Appointments Response prefix:', data.substring(0, 100));
  });
}).on('error', console.error);

http.get('http://localhost:5001/api/doctors/13', (res) => {
  console.log('Doctors Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Doctors Response prefix:', data.substring(0, 100));
  });
}).on('error', console.error);
