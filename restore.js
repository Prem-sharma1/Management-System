const { execSync } = require('child_process');
try {
  execSync('git checkout prisma/schema.prisma', { stdio: 'inherit' });
  console.log("Git checkout successful.");
} catch (e) {
  console.error("Failed:", e.message);
}
