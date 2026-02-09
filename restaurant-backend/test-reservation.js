const http = require('http');

const testReservation = () => {
  const data = JSON.stringify({
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '9123456789',
    date: '2025-12-20',
    time: '19:00',
    guests: 4,
    table: 'A1'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/reservations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', body);
      try {
        const parsed = JSON.parse(body);
        console.log('✓ Reservation created successfully!');
        console.log('ID:', parsed._id);
        console.log('Table:', parsed.table);
      } catch (e) {
        console.log('Error parsing response');
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request failed:', e.message);
    console.error('Full error:', e);
  });

  req.write(data);
  req.end();
};

console.log('Testing reservation creation...\n');
testReservation();
