const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const fs = require('fs');
const path = require('path');

// Manually load .env since this is a raw node script
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#\s]+)\s*=\s*(.*)$/);
    if (match) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  });
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function main() {
  console.log("Fetching emails from the database...");
  
  // Fetch from database
  const clients = await prisma.client.findMany({
    select: { clientName: true, businessName: true, email: true }
  });
  
  const users = await prisma.user.findMany({
    select: { name: true, role: true, email: true }
  });

  // Prepare CSV content
  let csvContent = "Type,Name/Business,Email\n";
  
  clients.forEach(client => {
    const name = client.businessName || client.clientName || 'Unknown';
    if (client.email) {
      csvContent += `Client,"${name}","${client.email}"\n`;
    }
  });

  users.forEach(user => {
    if (user.email) {
      csvContent += `Staff (${user.role}),"${user.name}","${user.email}"\n`;
    }
  });

  // Write to file
  const filePath = path.join(process.cwd(), 'database_emails.csv');
  fs.writeFileSync(filePath, csvContent);
  
  console.log(`\n✅ Success! All emails have been successfully exported and stored in:`);
  console.log(`👉 ${filePath}`);
}

main()
  .catch(e => {
    console.error("Error fetching emails:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
