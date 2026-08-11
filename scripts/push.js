const { exec } = require('child_process');

exec('npx prisma db push', (err, stdout, stderr) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
});
