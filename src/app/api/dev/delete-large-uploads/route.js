import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    return NextResponse.json({ message: 'Uploads dir does not exist' });
  }

  const files = fs.readdirSync(uploadsDir);
  const deleted = [];
  const errors = [];

  for (const file of files) {
    if (file.endsWith('.mp4') || file.endsWith('.mov') || file.endsWith('.avi') || file.endsWith('.mkv')) {
      try {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        fs.unlinkSync(filePath);
        deleted.push({ file, sizeMB: (stats.size / (1024 * 1024)).toFixed(2) });
      } catch (err) {
        errors.push({ file, error: err.message });
      }
    }
  }

  return NextResponse.json({ success: true, deletedCount: deleted.length, deleted, errors });
}
