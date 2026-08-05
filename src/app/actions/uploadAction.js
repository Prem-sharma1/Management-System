'use server';

import { promises as fs } from 'fs';
import path from 'path';

export async function uploadFileAction(formData) {
  try {
    const file = formData.get('file');

    if (!file) {
      return { error: 'No file uploaded' };
    }

    const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB limit
    if (file.size && file.size > MAX_FILE_SIZE) {
      return { error: 'File size exceeds maximum allowed limit of 1GB' };
    }

    // Generate a unique filename using timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalName = (file.name || 'upload.ext').replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${uniqueSuffix}-${originalName}`;
    
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Ensure directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    
    // Write the file to disk using streams to avoid running out of memory
    const { createWriteStream } = await import('fs');
    const writeStream = createWriteStream(filePath);
    
    for await (const chunk of file.stream()) {
      writeStream.write(chunk);
    }
    writeStream.end();
    
    // Wait for the file to finish writing
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const fileUrl = `/uploads/${filename}`;

    return { success: true, fileUrl };
  } catch (error) {
    console.error('Server Action Upload Error:', error);
    return { error: `Failed to upload file: ${error.message}` };
  }
}
