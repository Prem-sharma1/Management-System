import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET Handler for Meta Webhook verification
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const localVerifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'my_verify_token';

    if (mode === 'subscribe' && token === localVerifyToken) {
      console.log('Meta Webhook verified successfully!');
      // Return challenge as a plain text response
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    console.warn('Meta Webhook verification failed: verify token mismatch.');
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  } catch (error) {
    console.error('Webhook Verification Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST Handler for incoming lead data (from Zapier, Make, or native Meta Webhooks)
export async function POST(request) {
  try {
    const body = await request.json();

    // Check if the payload is a native Meta webhook event
    if (body.object === 'page' && body.entry) {
      console.log('Received native Meta Lead Ad webhook event:', JSON.stringify(body));
      
      // Native Meta webhooks contain leadgen_id, page_id, etc.
      // We will parse the leadgen_id and create a placeholder lead
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const leadgenId = change?.value?.leadgen_id;
      const formId = change?.value?.form_id;

      if (leadgenId) {
        // Find any active SALES user to assign the lead
        const targetUser = await prisma.user.findFirst({
          where: { role: 'SALES', status: 'ACTIVE' }
        }) || await prisma.user.findFirst({
          where: { role: 'SALES' }
        });

        if (!targetUser) {
          return NextResponse.json({ error: 'No sales user found to assign lead' }, { status: 500 });
        }

        // Create a temporary placeholder (with leadgenId as identifier)
        // Note: Real apps fetch the actual values from Meta Graph API using the leadgenId
        const newLead = await prisma.callRecord.create({
          data: {
            clientName: `Meta Lead (ID: ${leadgenId.slice(-4)})`,
            phoneNumber: 'Fetching from Meta...',
            status: 'PENDING',
            notes: `[Campaign: Meta Ads] Native Meta lead imported. Leadgen ID: ${leadgenId}. Form ID: ${formId || 'N/A'}.`,
            salesPersonId: targetUser.id,
            leadSource: 'Meta Ads'
          }
        });

        return NextResponse.json({ success: true, message: 'Native lead logged', lead: newLead });
      }
    }

    // Standard JSON payload (from Zapier, Make, or direct triggers)
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
    
    // Manual fallback for case insensitivity if the exact match fails
    if (!targetUser) {
      const allUsers = await prisma.user.findMany();
      targetUser = allUsers.find(u => u.email.toLowerCase() === emailToSearch.toLowerCase());
    }

    if (!targetUser) {
      // Fallback to finding any SALES user
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
        salesPersonId: targetUser.id,
        leadSource: finalCampaign
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
