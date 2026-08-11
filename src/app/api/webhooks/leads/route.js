import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientName, phoneNumber, campaignName, notes, salesPersonEmail } = body;

    if (!clientName || !phoneNumber) {
      return NextResponse.json({ error: 'clientName and phoneNumber are required' }, { status: 400 });
    }

    // Default to Jennifer if no email is provided, or find the specified user
    const emailToSearch = salesPersonEmail || 'jennifer@aidigital.com';
    let targetUser = await prisma.user.findFirst({
      where: { 
        email: {
          equals: emailToSearch,
        }
      }
    });
    
    // Manual fallback for case insensitivity if the exact match fails (Postgres vs SQLite string rules)
    if (!targetUser) {
      const allUsers = await prisma.user.findMany();
      targetUser = allUsers.find(u => u.email.toLowerCase() === emailToSearch.toLowerCase());
    }

    if (!targetUser) {
      // Fallback to finding any SALES user if the target isn't found
      targetUser = await prisma.user.findFirst({
        where: { role: 'SALES' }
      });
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'No active sales personnel found in the system to assign the lead.' }, { status: 404 });
    }

    // Format the campaign into the notes so it works with the frontend
    const finalCampaign = campaignName || 'Facebook Campaign';
    const finalNotes = `[Campaign: ${finalCampaign}] ${notes || 'Lead imported via webhook.'}`;

    // Create the CallRecord
    const newLead = await prisma.callRecord.create({
      data: {
        clientName: clientName,
        phoneNumber: phoneNumber,
        status: 'PENDING',
        notes: finalNotes,
        salesPersonId: targetUser.id
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Lead imported successfully',
      lead: newLead 
    });

  } catch (error) {
    console.error('Webhook Lead Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
