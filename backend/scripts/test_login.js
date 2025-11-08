require('dotenv').config();
const fetch = require('node-fetch');

(async () => {
  try {
    const url = (process.env.API_BASE || 'http://localhost:3000') + '/api/login';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'secret' })
    });
    const data = await res.json();
    console.log('LOGIN RESPONSE:', data);
  } catch (e) {
    console.error('ERROR', e.message || e);
  }
})();
