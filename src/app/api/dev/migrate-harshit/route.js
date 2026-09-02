import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'This endpoint is deprecated and Harshit has been purged from the system.' }, { status: 410 });
}
