const http = require('http');

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=---123456789'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', data.substring(0, 200));
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write('-----123456789\r\n');
req.write('Content-Disposition: form-data; name="file"; filename="test.txt"\r\n');
req.write('Content-Type: text/plain\r\n\r\n');
req.write('test file content\r\n');
req.write('-----123456789--\r\n');
req.end();
