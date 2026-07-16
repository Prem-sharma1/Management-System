import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    console.log('Running npx prisma generate...');
    // Use the workspace root path
    const cwd = process.cwd();
    const output = execSync('npx prisma generate', { 
      cwd,
      encoding: 'utf8',
      env: { ...process.env }
    });
    console.log('Prisma generate output:', output);

    return NextResponse.json({ success: true, message: 'Prisma generate completed.', output });
  } catch (err) {
    console.error('Prisma generate failed:', err.message);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
