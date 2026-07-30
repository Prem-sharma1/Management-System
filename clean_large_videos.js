const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  console.log('uploads directory does not exist.');
  process.exit(0);
}

const files = fs.readdirSync(uploadsDir);
let count = 0;
let totalBytes = 0;

for (const file of files) {
  if (file.endsWith('.mp4') || file.endsWith('.mov') || file.endsWith('.avi') || file.endsWith('.mkv')) {
    const filePath = path.join(uploadsDir, file);
    try {
      const stat = fs.statSync(filePath);
      totalBytes += stat.size;
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${file} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
      count++;
    } catch (err) {
      console.error(`Failed to delete ${file}:`, err.message);
    }
  }
}

console.log(`\nDone! Deleted ${count} video files, freed ${(totalBytes / (1024 * 1024)).toFixed(2)} MB.`);
