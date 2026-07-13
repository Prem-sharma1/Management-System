import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'clients_master_list.tsv');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    // Skip header
    const dataLines = lines.slice(1);
    
    let imported = 0;
    const errors = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const cols = line.split('\t');
      if (cols.length < 2) continue; // Skip malformed lines

      const joiningDate = cols[0] || '';
      const businessName = cols[1] || 'Unknown Business';
      const contact = cols[2] || '';
      const packageName = cols[3] || 'Standard';
      
      // Parse billing amount
      let rawAmount = cols[4] || '0';
      rawAmount = rawAmount.replace(/[^0-9.]/g, ''); // Remove ₹ and commas
      const packageAmount = parseFloat(rawAmount) || 0;

      const dailyBudget = cols[5] || '';
      const paymentStatus = cols[6] || '';
      const sector = cols[7] || '';
      const requirement = cols[8] || '';
      const address = cols[9] || '';
      const emailRaw = cols[10] || '';

      // Clean email if it contains "Email:" or "Website:"
      let email = emailRaw;
      if (emailRaw.includes('Email:')) {
        const match = emailRaw.match(/Email:\s*([^\s]+)/);
        if (match) email = match[1];
      }

      // Generate a unique client ID if needed, or use AID format
      const count = await prisma.client.count();
      const clientId = `AID-${(count + 1000 + i).toString().padStart(4, '0')}`;

      // Notes combining extra info
      const notesParts = [];
      if (dailyBudget) notesParts.push(`Daily Budget: ${dailyBudget}`);
      if (paymentStatus) notesParts.push(`Payment: ${paymentStatus}`);
      if (address) notesParts.push(`Address: ${address}`);
      const notes = notesParts.join(' | ');

      try {
        await prisma.client.create({
          data: {
            clientId,
            businessName,
            clientName: businessName, // Fallback
            joiningDate,
            services: 'Digital Marketing', // Default
            packageName,
            packageAmount,
            contact,
            email,
            sector,
            requirement,
            notes
          }
        });
        imported++;
      } catch (err) {
        errors.push(`Failed to import ${businessName}: ${err.message}`);
      }
    }

    return NextResponse.json({ success: true, imported, errors });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
