import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://localhost:3000/api/seed-deliveries');
    const text = await res.text();
    return new NextResponse(text, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (e) {
    return new NextResponse(e.message, { status: 200 });
  }
}
