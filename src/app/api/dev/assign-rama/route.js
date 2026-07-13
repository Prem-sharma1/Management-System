import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawData = `AID-0005-ADS-RUN	AID-0005	A Siddhanatth Car's	Ads Run	08/02/2026	Ads Campaign Manager	Rama	Not Started	Meta Ads	Standard(Meta Ads)`;

    const lines = rawData.split('\n').filter(l => l.trim().length > 0);
    
    let importedCT = 0;
    let importedTask = 0;

    // Check if Rama exists
    let rama = await prisma.user.findFirst({
      where: { name: { contains: 'Rama' } }
    });

    if (!rama) {
      // Create Rama if not exists
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Rama@123', salt);
      
      rama = await prisma.user.create({
        data: {
          name: 'Rama',
          email: 'rama@aidigital.com',
          password: hashedPassword,
          role: 'EMPLOYEE',
          department: 'Ads Campaign Manager',
          salary: 30000,
          status: 'ACTIVE'
        }
      });
    }

    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const adminId = admin ? admin.id : rama.id;

    for (const line of lines) {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length < 10) continue;

      const [
        taskId, clientId, businessName, taskTitle,
        date, assignTo, workingOnRaw, status, service, packageRaw
      ] = parts;

      const postType = parts.length > 10 ? parts[10] : '';
      const notes = parts.length > 11 ? parts[11] : '';
      
      // Ensure the client exists
      let client = await prisma.client.findUnique({ where: { clientId } });
      if (!client) {
        client = await prisma.client.create({
          data: {
            clientId,
            businessName,
            clientName: businessName, // fallback
            email: `${clientId.toLowerCase()}@client.com`,
            phone: '0000000000',
            status: 'ACTIVE',
            joiningDate: '01/01/2026',
            services: 'Various',
            packageName: 'Standard',
            packageAmount: 1000
          }
        });
      }

      const workingOn = rama.name; // Use exact name from DB

      // Upsert into ClientTask
      await prisma.clientTask.upsert({
        where: { taskId },
        update: {
          clientId, businessName, taskTitle, date, assignTo, workingOn,
          status, service, packageName: packageRaw, postType, notes
        },
        create: {
          taskId, clientId, businessName, taskTitle, date, assignTo, workingOn,
          status, service, packageName: packageRaw, postType, notes
        }
      });
      importedCT++;

      // Create internal Task for "My Assigned Tasks" dashboard
      const existingTask = await prisma.task.findFirst({
        where: { title: taskTitle, assignedToId: rama.id }
      });

      if (!existingTask) {
        await prisma.task.create({
          data: {
            title: taskTitle,
            description: `Client: ${businessName} | Task ID: ${taskId} | Service: ${service}`,
            status: status === 'Complete Task' ? 'DONE' : 'TODO',
            assignedToId: rama.id,
            createdById: adminId,
            dueDate: date || "2026-05-01"
          }
        });
        importedTask++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Assigned ${importedCT} client tasks and ${importedTask} internal tasks to ${rama.name} successfully.`
    });
  } catch(e) {
    console.error('Error assigning to Rama:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
