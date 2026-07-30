import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

// Helper to parse onboarding JSON from client notes/requirement field
function parseOnboardingData(client) {
  if (!client) return null;
  let onboarding = null;
  if (client.notes) {
    try {
      if (client.notes.trim().startsWith('{')) {
        onboarding = JSON.parse(client.notes);
      }
    } catch (e) {
      // Ignore parse failure
    }
  }
  if (!onboarding && client.requirement) {
    try {
      if (client.requirement.trim().startsWith('{')) {
        onboarding = JSON.parse(client.requirement);
      }
    } catch (e) {
      // Ignore
    }
  }
  return onboarding;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paramClientId = searchParams.get('clientId');

    const cookieStore = await cookies();
    const sessionClientId = cookieStore.get('clientId')?.value;

    const targetClientId = paramClientId || sessionClientId;

    if (!targetClientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { clientId: targetClientId }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const onboardingData = parseOnboardingData(client);

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        clientId: client.clientId,
        businessName: client.businessName,
        clientName: client.clientName,
        services: client.services,
        packageName: client.packageName,
        packageAmount: client.packageAmount,
        contact: client.contact,
        email: client.email,
        website: client.website,
        sector: client.sector,
        accountReady: client.accountReady,
        notes: client.notes,
        requirement: client.requirement
      },
      onboardingData
    });
  } catch (error) {
    console.error('Fetch onboarding error:', error);
    return NextResponse.json({ error: 'Failed to fetch onboarding data', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const sessionClientId = cookieStore.get('clientId')?.value;

    const targetClientId = body.clientId || sessionClientId;

    if (!targetClientId) {
      return NextResponse.json({ error: 'Unauthorized: missing Client ID' }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { clientId: targetClientId }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client record not found' }, { status: 404 });
    }

    const formData = body.formData || {};
    formData.submittedAt = new Date().toISOString();

    const jsonString = JSON.stringify(formData, null, 2);

    // Save json string in client notes field
    const updatedClient = await prisma.client.update({
      where: { clientId: targetClientId },
      data: {
        notes: jsonString,
        requirement: formData.generalInfo?.requirementSummary || client.requirement,
        website: formData.generalInfo?.website || client.website,
        sector: formData.generalInfo?.sector || client.sector,
        accountReady: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Brand onboarding details saved successfully!',
      client: updatedClient,
      onboardingData: formData
    });
  } catch (error) {
    console.error('Save onboarding error:', error);
    return NextResponse.json({ error: 'Failed to save onboarding data', details: error.message }, { status: 500 });
  }
}
