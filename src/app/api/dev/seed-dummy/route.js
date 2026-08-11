export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder' });

export async function GET() {
  try {
    const userRes = await pool.query('SELECT id FROM "User"');
    const users = userRes.rows;
    if (users.length === 0) {
      return NextResponse.json({ message: 'No users found to assign data to.' }, { status: 400 });
    }

    // Clear existing records
    await pool.query('DELETE FROM "CallRecord"');

    const campaigns = [
      { name: 'Facebook Campaign', source: 'Facebook' },
      { name: 'LinkedIn Campaign', source: 'LinkedIn' },
      { name: 'Google Campaign', source: 'Google Ads' }
    ];

    const statuses = ['ANSWERED', 'NOT_ANSWERED', 'RINGING', 'INTERESTED', 'CALLBACK', 'NOT_INTERESTED'];
    let count = 0;

    for (const user of users) {
      for (const [index, camp] of campaigns.entries()) {
        for (let i = 1; i <= 5; i++) {
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const clientName = `Test Lead ${index * 5 + i} - ${camp.name.split(' ')[0]}`;
          const phoneNumber = `+1 (555) 000-${1000 + index * 5 + i}`;
          const notes = `[Campaign: ${camp.name}] Auto-generated lead`;
          
          await pool.query(
            `INSERT INTO "CallRecord" ("clientName", "phoneNumber", "status", "notes", "salesPersonId", "callDate") VALUES ($1, $2, $3, $4, $5, $6)`,
            [clientName, phoneNumber, status, notes, user.id, new Date(Date.now() - Math.random() * 10000000000)]
          );
          count++;
        }
      }
    }

    return NextResponse.json({ message: `Successfully inserted ${count} dummy call records across ${users.length} users using pg directly.` });
  } catch (error) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}
