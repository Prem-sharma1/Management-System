const { Pool } = require('pg');
require('dotenv').config(); // Need dotenv if we run it directly via node

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  try {
    console.log('Connecting to database...');
    const userRes = await pool.query('SELECT id FROM "User"');
    const users = userRes.rows;
    if (users.length === 0) {
      console.log('No users found.');
      process.exit(1);
    }
    
    console.log(`Found ${users.length} users. Clearing existing CallRecord data...`);
    await pool.query('DELETE FROM "CallRecord"');

    const campaigns = [
      { name: 'Facebook Campaign' },
      { name: 'LinkedIn Campaign' },
      { name: 'Google Campaign' }
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
    console.log(`Successfully inserted ${count} dummy call records.`);
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
}

seed();
