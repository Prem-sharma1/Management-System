import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const tasks = await prisma.clientTask.findMany();
    
    // Group tasks by Month-Year
    const monthMap = {};
    const parseToISO = (dateStr) => {
      if (!dateStr || typeof dateStr !== 'string') return null;
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10);
      const months = { jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',
                         jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12' };
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const [dd, mon, yyyy] = parts;
        const mm = months[mon.toLowerCase()];
        if (mm && dd && yyyy) return `${yyyy}-${mm}-${dd.padStart(2, '0')}`;
      }
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
    };

    tasks.forEach(t => {
      const iso = parseToISO(t.date);
      if (iso) {
        const monthStr = iso.slice(0, 7); // e.g. "2026-07"
        monthMap[monthStr] = (monthMap[monthStr] || 0) + 1;
      } else {
        monthMap['Invalid/Missing'] = (monthMap['Invalid/Missing'] || 0) + 1;
      }
    });

    return NextResponse.json({
      totalTasksCount: tasks.length,
      tasksPerMonth: monthMap
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
