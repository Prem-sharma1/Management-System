import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  try {
    const output = execSync('node scripts/seed-dummy-data.js', { encoding: 'utf-8' });
    return NextResponse.json({ message: 'Success', output });
  } catch (error) {
    return NextResponse.json({ error: error.message, output: error.stdout?.toString() }, { status: 500 });
  }
}
