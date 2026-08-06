const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'public', 'uploads');
console.log('Dir:', dir);

fs.readdir(dir, (err, files) => {
  if (err) {
    console.error('Error reading dir:', err);
    return;
  }
  console.log('Files:', files.slice(0, 5));
  if (files.length > 0) {
    const filePath = path.join(dir, files[files.length - 1]);
    console.log('Testing file:', filePath);
    fs.access(filePath, (err) => {
      console.log('Access result:', err ? err.message : 'Success');
    });
  }
});
