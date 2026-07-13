import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

async function getRequester(cookieStore) {
  const userIdStr = cookieStore.get('userId')?.value;
  if (!userIdStr) return null;
  return await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
}

export async function PUT(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const cookieStore = await cookies();
    const requester = await getRequester(cookieStore);

    if (!requester || (requester.role !== 'CEO' && requester.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      clientId,
      businessName,
      clientName,
      joiningDate,
      services,
      packageName,
      packageAmount,
      contact,
      email,
      website,
      sector,
      requirement,
      accountReady,
      active,
      notes
    } = body;

    const targetClient = await prisma.client.findUnique({ where: { id } });
    if (!targetClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // If changing Client ID, make sure it is still unique
    if (clientId && clientId !== targetClient.clientId) {
      const existing = await prisma.client.findUnique({ where: { clientId } });
      if (existing) {
        return NextResponse.json({ error: 'New Client ID is already in use.' }, { status: 400 });
      }
    }

    const data = {};
    if (clientId) data.clientId = clientId;
    if (businessName) data.businessName = businessName;
    if (clientName !== undefined) data.clientName = clientName;
    if (joiningDate) data.joiningDate = joiningDate;
    if (services) data.services = services;
    if (packageName) data.packageName = packageName;
    if (packageAmount !== undefined) data.packageAmount = parseFloat(packageAmount) || 0;
    if (contact !== undefined) data.contact = contact;
    if (email !== undefined) data.email = email;
    if (website !== undefined) data.website = website;
    if (sector !== undefined) data.sector = sector;
    if (requirement !== undefined) data.requirement = requirement;
    if (accountReady !== undefined) data.accountReady = !!accountReady;
    if (active !== undefined) data.active = !!active;
    if (notes !== undefined) data.notes = notes;

    const updatedClient = await prisma.client.update({
      where: { id },
      data
    });

    await prisma.auditLog.create({
      data: {
        action: `Updated client profile: ${updatedClient.businessName} (${updatedClient.clientId})`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    console.error('Client PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const cookieStore = await cookies();
    const requester = await getRequester(cookieStore);

    if (!requester || (requester.role !== 'CEO' && requester.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const targetClient = await prisma.client.findUnique({ where: { id } });
    if (!targetClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    await prisma.client.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: `Deleted client account: ${targetClient.businessName} (${targetClient.clientId})`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Client DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
