import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawData = `AID-0007-SM-GRAPHIC-1	AID-0007	Shree Renuka Opticals	SM Graphic 1	05/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Graphic															
AID-0007-WEEKLY-REPORT-1	AID-0007	Shree Renuka Opticals	Weekly Report 1	05/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)																
AID-0006-SM-REELS-2	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	SM Reels 2	07/03/2026	Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Reel															
AID-0007-SM-REELS-1	AID-0007	Shree Renuka Opticals	SM Reels 1	07/03/2026	Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Reel															
AID-0006-SM-GRAPHIC-4	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	SM Graphic 4	09/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Graphic															
AID-0007-SM-GRAPHIC-2	AID-0007	Shree Renuka Opticals	SM Graphic 2	09/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Graphic															
AID-0008-LOGIN	AID-0008	Vidhivihan Agro Product	Client Login / Access Collection	11/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Basic(Meta Ads)																
AID-0006-WEEKLY-REPORT-3	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	Weekly Report 3	11/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)																
AID-0008-CREATE-ACCOUNTS	AID-0008	Vidhivihan Agro Product	Create Accounts	12/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Basic(Meta Ads)																
AID-0008-ADS-GRAPHIC	AID-0008	Vidhivihan Agro Product	Ads Graphic	12/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Basic(Meta Ads)	Graphic															
AID-0009-SM-CALENDAR-ANALYSIS	AID-0009	Prash Ayurveda	Analyse client business and make content calendar	12/03/2026	Social Media Executive	Harshit	Not Started	Social media Posts	Social media post 10																
AID-0009-SM-CALENDAR-APPROVAL	AID-0009	Prash Ayurveda	Share calendar to client and get approval/changes	12/03/2026	Social Media Executive	Harshit	Not Started	Social media Posts	Social media post 10																
AID-0006-SM-AI-VIDEOS-2	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	SM AI Video 2 - Work on AI Video	12/03/2026	AI Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	AI Video															
AID-0007-SM-AI-VIDEOS-1	AID-0007	Shree Renuka Opticals	SM AI Video 1 - Work on AI Video	12/03/2026	AI Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	AI Video															
AID-0007-WEEKLY-REPORT-2	AID-0007	Shree Renuka Opticals	Weekly Report 2	12/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)																
AID-0008-ADS-AI-VIDEO	AID-0008	Vidhivihan Agro Product	Work on 1st Ads AI Video	13/03/2026	AI Video Editor	Harshit	Not Started	Meta Ads	Basic(Meta Ads)	AI Video															
AID-0008-CREATE-PAGE	AID-0008	Vidhivihan Agro Product	Create Page	13/03/2026	Social Media Executive	Harshit	Not Started	Meta Ads	Basic(Meta Ads)																
AID-0008-ADS-RUN	AID-0008	Vidhivihan Agro Product	Ads Run	13/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Basic(Meta Ads)																
AID-0009-SM-DESIGN-1	AID-0009	Prash Ayurveda	According to Calendar make 1st Graphic design	13/03/2026	Graphic Designer	Harshit	Not Started	Social media Posts	Social media post 10	Graphic															
AID-0009-SM-APPROVAL-1	AID-0009	Prash Ayurveda	Share 1st Graphic design with client and get approval	13/03/2026	Graphic Designer	Harshit	Not Started	Social media Posts	Social media post 10	Graphic															
AID-0006-SM-GRAPHIC-5	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	SM Graphic 5	13/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Graphic															
AID-0007-SM-GRAPHIC-3	AID-0007	Shree Renuka Opticals	SM Graphic 3	13/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Graphic															
AID-0009-SM-POST-1	AID-0009	Prash Ayurveda	Posting 1st Graphic on Social Media Platforms	14/03/2026	Social Media Executive	Harshit	Not Started	Social media Posts	Social media post 10	Graphic															
AID-0010-SM-CALENDAR-ANALYSIS	AID-0010	Socio-Political	Analyse client business and make content calendar	14/03/2026	Social Media Executive	Harshit	Not Started	Social media Posts	Social media post 20																
AID-0010-SM-CALENDAR-APPROVAL	AID-0010	Socio-Political	Share calendar to client and get approval/changes	14/03/2026	Social Media Executive	Harshit	Not Started	Social media Posts	Social media post 20																
AID-0011-LOGIN	AID-0011	Sanskruti Pre School	Client Login / Access Collection	14/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)																
AID-0009-SM-DESIGN-2	AID-0009	Prash Ayurveda	According to Calendar make 2nd Graphic design	15/03/2026	Graphic Designer	Harshit	Not Started	Social media Posts	Social media post 10	Graphic															
AID-0009-SM-APPROVAL-2	AID-0009	Prash Ayurveda	Share 2nd Graphic design with client and get approval	15/03/2026	Graphic Designer	Harshit	Not Started	Social media Posts	Social media post 10	Graphic															
AID-0010-SM-DESIGN-1	AID-0010	Socio-Political	According to Calendar make 1st Graphic design	15/03/2026	Graphic Designer	Harshit	Not Started	Social media Posts	Social media post 20	Graphic															
AID-0010-SM-APPROVAL-1	AID-0010	Socio-Political	Share 1st Graphic design with client and get approval	15/03/2026	Graphic Designer	Harshit	Not Started	Social media Posts	Social media post 20	Graphic															
AID-0011-CREATE-ACCOUNTS	AID-0011	Sanskruti Pre School	Create Accounts	15/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)																
AID-0011-ADS-GRAPHIC	AID-0011	Sanskruti Pre School	Ads Graphic	15/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Graphic															
AID-0006-SM-REELS-3	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	SM Reels 3	15/03/2026	Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Reel															
AID-0007-SM-REELS-2	AID-0007	Shree Renuka Opticals	SM Reels 2	15/03/2026	Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Reel															
AID-0009-SM-POST-2	AID-0009	Prash Ayurveda	Posting 2nd Graphic on Social Media Platforms	16/03/2026	Social Media Executive	Harshit	Not Started	Social media Posts	Social media post 10	Graphic															
AID-0011-ADS-AI-VIDEO	AID-0011	Sanskruti Pre School	Work on 1st Ads AI Video	16/03/2026	AI Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	AI Video															
AID-0053-ADS-AI-SCRIPT-1	AID-0053	Aarya Consruction	Prepare 1st Ads AI Video Script	16/05/2026	AI Video Lead	Harshit	Not Started	Meta Ads	Standard(Meta Ads)																
AID-0053-SM-AI-SCRIPT-1	AID-0053	Aarya Consruction	Prepare 1st SM AI Video Script	27/05/2026	AI Video Lead	Harshit	Not Started	Meta Ads	Standard(Meta Ads)																
AID-0079-AI-SCRIPT-1	AID-0079	Sharda Orthopedic	Prepare 1st AI Video Script	03/06/2026	AI Video Lead	Harshit	Complete Task	AI Videos	AI Videos 5`;

    const lines = rawData.split('\n').filter(l => l.trim().length > 0);
    
    let importedCT = 0;
    
    // Check if Harshit exists
    let harshit = await prisma.user.findFirst({
      where: { name: { contains: 'Harshit' } }
    });

    if (!harshit) {
      // Create Harshit if not exists
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Harshit@123', salt);
      
      harshit = await prisma.user.create({
        data: {
          name: 'Harshit',
          email: 'harshit@aidigital.com',
          password: hashedPassword,
          role: 'EMPLOYEE',
          department: 'Graphic Designer',
          salary: 30000,
          status: 'ACTIVE'
        }
      });
    }

    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const adminId = admin ? admin.id : harshit.id;

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
            clientName: businessName,
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

      const workingOn = harshit.name; // exact match

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
    }

    // Now bulk migrate ALL ClientTasks for Harshit to internal Task model
    const allHarshitTasks = await prisma.clientTask.findMany({
      where: { workingOn: harshit.name }
    });

    let importedTask = 0;
    for (const task of allHarshitTasks) {
      const existing = await prisma.task.findFirst({
        where: { title: task.taskTitle, assignedToId: harshit.id }
      });
      if (!existing) {
        await prisma.task.create({
          data: {
            title: task.taskTitle,
            description: `Client: ${task.businessName} | Task ID: ${task.taskId} | Service: ${task.service}`,
            status: task.status === 'Complete Task' || task.status === 'DONE' ? 'DONE' : 'TODO',
            assignedToId: harshit.id,
            createdById: adminId,
            dueDate: task.date || "2026-05-01"
          }
        });
        importedTask++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Assigned ${importedCT} new client tasks and synced a total of ${importedTask} internal tasks to ${harshit.name} successfully.`
    });
  } catch(e) {
    console.error('Error assigning to Harshit:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
