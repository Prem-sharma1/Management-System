import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ error: 'Unauthorized development route' }, { status: 401 });
}
