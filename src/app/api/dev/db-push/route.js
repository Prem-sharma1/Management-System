import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

export const dynamic = 'force-dynamic';

const execPromise = util.promisify(exec);

export async function GET() {
  try {
    const { stdout, stderr } = await execPromise('node fetch-tasks.js', { cwd: process.cwd() });

    return NextResponse.json({ 
      message: 'Seed executed',
      stdout,
      stderr
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Command failed', details: error.message, stack: error.stack });
  }
}
