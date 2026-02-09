const base = 'http://localhost:5000';
const adminEmail = 'dishantmahawar0019@gmail.com';
const adminPassword = 'Dattowal';

async function run() {
  try {
    console.log('=== Create Reservation (public) ===');
    let res = await fetch(base + '/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Automated Tester', email: 'auto@test.local', phone: '', date: '2025-12-21', time: '19:00', guests: 2 })
    });
    let json = await res.json().catch(() => ({}));
    console.log('Reservation response:', json);

    console.log('\n=== Admin Login ===');
    res = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });
    const login = await res.json().catch(() => ({}));
    if (!login.token) {
      console.error('Login failed:', login);
      process.exitCode = 2;
      return;
    }
    const token = login.token;
    console.log('Login succeeded, token length:', token.length);

    console.log('\n=== GET Reservations (admin) ===');
    res = await fetch(base + '/api/reservations', { headers: { Authorization: `Bearer ${token}` } });
    const reservations = await res.json().catch(() => ({}));
    console.log('Reservations list:', reservations);

    console.log('\n=== Create Ingredient (admin) ===');
    res = await fetch(base + '/api/ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'Auto Ingredient', quantity: 12, unit: 'pcs', threshold: 5 })
    });
    const ing = await res.json().catch(() => ({}));
    console.log('Ingredient response:', ing);

    console.log('\n=== Create Order (public) ===');
    res = await fetch(base + '/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ name: 'Auto Dish', price: 99, qty: 1 }], total: 99, status: 'Pending', paymentStatus: 'Pending' })
    });
    const order = await res.json().catch(() => ({}));
    console.log('Order response:', order);

    console.log('\n=== API tests complete ===');
  } catch (err) {
    console.error('Test script error:', err);
    process.exitCode = 3;
  }
}

run();
