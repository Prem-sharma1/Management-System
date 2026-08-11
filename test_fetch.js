const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const fs = require('fs');
    fs.writeFileSync('fetch_error.html', data);
    console.log('Status:', res.statusCode);
  });
});

req.on('error', e => {
  const fs = require('fs');
  fs.writeFileSync('fetch_error.html', 'Network error: ' + e.message);
});

req.write(JSON.stringify({ email: 'nikhil@aidigital.com', password: 'password' }));
req.end();
