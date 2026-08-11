export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
    max: 1 // only use 1 connection
  });
  
  try {
    const res = await pool.query('SELECT COUNT(*) as count FROM "CallRecord"');
    return NextResponse.json({ success: true, count: res.rows[0].count });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}
