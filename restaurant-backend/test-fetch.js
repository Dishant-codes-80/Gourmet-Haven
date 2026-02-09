const fetch = require('node-fetch');

const testReservation = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '9123456789',
        date: '2025-12-20',
        time: '19:00',
        guests: 4,
        table: 'A1'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
};

testReservation();
