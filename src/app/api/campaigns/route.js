import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchMetaCampaigns, fetchCampaignInsights } from '@/lib/meta';

export async function GET(req) {
  try {
    // 1. Fetch campaigns (either from Meta API or fallback)
    const campaigns = await fetchMetaCampaigns();

    // 2. Fetch insights and local DB stats for each campaign
    const detailedCampaigns = await Promise.all(
      campaigns.map(async (camp) => {
        // Fetch live Meta API insights (or mocks if offline)
        const insights = await fetchCampaignInsights(camp.id);

        // Fetch local database leads stats for this campaign
        // Check for matching leadSource or notes matching "[Campaign: <Name>]"
        const leads = await prisma.callRecord.findMany({
          where: {
            OR: [
              { leadSource: camp.name },
              { notes: { contains: `[Campaign: ${camp.name}]` } }
            ]
          }
        });

        const totalLeads = leads.length;
        const hotLeads = leads.filter(l => l.status === 'INTERESTED').length;
        const convertedLeads = leads.filter(l => l.status === 'ANSWERED').length;
        const ringingLeads = leads.filter(l => l.status === 'RINGING' || l.status === 'CALLBACK').length;

        // Calculate Cost Per Lead (CPL)
        const costPerLead = totalLeads > 0 ? (insights.spend / totalLeads) : 0;

        return {
          id: camp.id,
          name: camp.name,
          status: camp.status,
          objective: camp.objective,
          ...insights,
          totalLeads,
          hotLeads,
          convertedLeads,
          ringingLeads,
          costPerLead: parseFloat(costPerLead.toFixed(2))
        };
      })
    );

    return NextResponse.json({ campaigns: detailedCampaigns });
  } catch (error) {
    console.error('Fetch campaigns error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
