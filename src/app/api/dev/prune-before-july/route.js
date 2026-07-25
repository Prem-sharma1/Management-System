import { NextResponse } from 'next/server';
import { pruneBeforeJulyData } from '@/lib/prune';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const results = await pruneBeforeJulyData();
    return NextResponse.json({
      success: true,
      message: 'Pruned database records before July 1, 2026 successfully!',
      results
    });
  } catch (error) {
    console.error('Pruning API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
