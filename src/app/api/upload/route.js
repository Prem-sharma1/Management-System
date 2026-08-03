import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes execution limit for large uploads

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB limit

async function getRequester(cookieStore) {
  const userIdStr = cookieStore.get('userId')?.value;
  if (!userIdStr) return null;
  return await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const requester = await getRequester(cookieStore);

    if (!requester) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size && file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum allowed limit of 500MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename using timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${uniqueSuffix}-${originalName}`;
    
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Ensure directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, fileUrl, url: fileUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
