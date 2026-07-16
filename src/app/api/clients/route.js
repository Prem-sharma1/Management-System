import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

async function getRequester(cookieStore) {
  const userIdStr = cookieStore.get('userId')?.value;
  if (!userIdStr) return null;
  return await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const requester = await getRequester(cookieStore);

    if (!requester) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const clients = await prisma.client.findMany({
      orderBy: { id: 'desc' }
    });

    return NextResponse.json(
      { clients },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Clients GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
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

    if (!clientId || !businessName || !joiningDate || !services || !packageName) {
      return NextResponse.json({ error: 'Missing required client fields.' }, { status: 400 });
    }

    // Check if ID is unique
    const existing = await prisma.client.findUnique({ where: { clientId } });
    if (existing) {
      return NextResponse.json({ error: 'Client ID already exists.' }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        clientId,
        businessName,
        clientName: clientName || '',
        joiningDate,
        services,
        packageName,
        packageAmount: parseFloat(packageAmount) || 0,
        contact: contact || '',
        email: email || '',
        website: website || '',
        sector: sector || '',
        requirement: requirement || '',
        accountReady: !!accountReady,
        active: active !== false,
        notes: notes || ''
      }
    });

    // Automatically provision a client user account for portal login
    try {
      let clientEmail = email ? email.trim() : '';
      if (!clientEmail || !clientEmail.includes('@')) {
        const cleanName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
        clientEmail = `${cleanName || 'client' + clientId}@gmail.com`;
      }
      
      const numericPart = clientId.replace(/[^0-9]/g, '');
      const plainPassword = `Client@${numericPart || '123'}`;
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);
      
      await prisma.user.create({
        data: {
          email: clientEmail.toLowerCase(),
          name: businessName,
          password: hashedPassword,
          role: 'CLIENT',
          department: clientId,
          status: 'ACTIVE',
          avatar: '💼'
        }
      });

      // Update the Client record's email & password in the database
      try {
        await prisma.client.update({
          where: { id: client.id },
          data: {
            email: clientEmail.toLowerCase(),
            password: plainPassword
          }
        });
      } catch (colErr) {
        // Fallback if password column is not pushed yet
        await prisma.client.update({
          where: { id: client.id },
          data: {
            email: clientEmail.toLowerCase()
          }
        });
      }
    } catch (err) {
      console.error('Error creating client login profile:', err);
    }

    await prisma.auditLog.create({
      data: {
        action: `Added new client: ${businessName} (${clientId})`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    // --- AUTOMATED TASK QUEUE LOGIC ---
    const plan = await prisma.plan.findFirst({
      where: { name: packageName }
    });

    if (plan && plan.features && Array.isArray(plan.features)) {
      for (const feature of plan.features) {
        // Determine target departments
        let targetDepartments = [];
        const featureLower = feature.toLowerCase();
        if (featureLower.includes('meta ads') || featureLower.includes('google ads')) {
          targetDepartments = ['Digital Marketing Executive'];
        } else if (featureLower.includes('creative')) {
          targetDepartments = ['Graphic Designer'];
        } else if (featureLower.includes('ai video')) {
          targetDepartments = ['Ai Video Editor', 'Ai Video Lead'];
        } else if (featureLower.includes('reels') || featureLower.includes('shorts') || featureLower.includes('video')) {
          targetDepartments = ['Video Editor', 'Ai Video Editor'];
        }

        let assignedEmployee = null;

        if (targetDepartments.length > 0) {
          // Find employees in those departments
          const employees = await prisma.user.findMany({
            where: {
              department: { in: targetDepartments },
              status: 'ACTIVE',
              role: { in: ['EMPLOYEE', 'TL'] }
            }
          });

          if (employees.length > 0) {
            const employeeNames = employees.map(e => e.name);
            const activeTasks = await prisma.clientTask.groupBy({
              by: ['assignTo'],
              where: {
                assignTo: { in: employeeNames },
                status: { notIn: ['Completed', 'Done'] }
              },
              _count: {
                id: true
              }
            });

            const taskCounts = {};
            activeTasks.forEach(t => {
              if (t.assignTo) {
                taskCounts[t.assignTo] = t._count.id;
              }
            });

            // Filter employees with < 40 tasks and sort
            const availableEmployees = employees
              .map(e => ({
                name: e.name,
                tasks: taskCounts[e.name] || 0
              }))
              .filter(e => e.tasks < 40)
              .sort((a, b) => {
                if (a.tasks !== b.tasks) return a.tasks - b.tasks;
                return a.name.localeCompare(b.name);
              });

            if (availableEmployees.length > 0) {
              assignedEmployee = availableEmployees[0].name;
            }
          }
        }

        const taskIdStr = `TSK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        await prisma.clientTask.create({
          data: {
            taskId: taskIdStr,
            clientId,
            businessName,
            taskTitle: feature,
            date: new Date().toISOString().split('T')[0],
            assignTo: assignedEmployee,
            status: assignedEmployee ? "Assigned" : "Not Started",
            service: services,
            packageName,
            postType: feature
          }
        });
      }
    }
    // ----------------------------------

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('Clients POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
