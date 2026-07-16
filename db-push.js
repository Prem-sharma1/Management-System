const { execSync } = require('child_process');

try {
  console.log('Running prisma db push...');
  const output = execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('Successfully pushed database schema!');
} catch (err) {
  console.error('Error pushing schema:', err.message);
  process.exit(1);
}
