// Meta Graph API Client
const GRAPH_VERSION = 'v20.0';

export async function fetchMetaCampaigns() {
  const token = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;

  if (!token || !adAccountId) {
    console.log('Meta credentials missing in .env. Returning fallback campaign data.');
    return [
      { id: 'meta_camp_1', name: 'Meta Leads Campaign - Real Estate', status: 'ACTIVE', objective: 'LEAD_GENERATION' },
      { id: 'meta_camp_2', name: 'Facebook Conversions - Soap Sales', status: 'ACTIVE', objective: 'OUTCOME_SALES' },
      { id: 'meta_camp_3', name: 'Meta Retargeting - Website Traffic', status: 'PAUSED', objective: 'OUTCOME_TRAFFIC' }
    ];
  }

  try {
    // Format ad account ID to ensure it starts with "act_"
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${formattedId}/campaigns?fields=id,name,status,objective,effective_status&access_token=${token}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error('Meta API campaigns fetch failed:', data.error);
      throw new Error(data.error.message || 'Failed to fetch campaigns from Meta');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error fetching Meta campaigns:', error);
    return [];
  }
}

export async function fetchCampaignInsights(campaignId) {
  const token = process.env.META_ACCESS_TOKEN;

  if (!token || campaignId.startsWith('meta_camp_')) {
    // Fallback/mock metrics depending on the fallback campaign ID
    const mockInsights = {
      meta_camp_1: { spend: 1250.50, impressions: 45000, clicks: 1800, reach: 35000 },
      meta_camp_2: { spend: 850.00, impressions: 32000, clicks: 1250, reach: 24000 },
      meta_camp_3: { spend: 320.00, impressions: 15000, clicks: 620, reach: 11000 }
    };
    return mockInsights[campaignId] || { spend: 0, impressions: 0, clicks: 0, reach: 0 };
  }

  try {
    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${campaignId}/insights?fields=spend,impressions,clicks,reach&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error(`Meta API insights fetch failed for campaign ${campaignId}:`, data.error);
      throw new Error(data.error.message || 'Failed to fetch insights from Meta');
    }

    // Graph API insights returns an array (usually with one item representing the requested time window)
    const insights = data.data?.[0] || {};
    return {
      spend: parseFloat(insights.spend || 0),
      impressions: parseInt(insights.impressions || 0, 10),
      clicks: parseInt(insights.clicks || 0, 10),
      reach: parseInt(insights.reach || 0, 10)
    };
  } catch (error) {
    console.error(`Error fetching Meta insights for campaign ${campaignId}:`, error);
    return { spend: 0, impressions: 0, clicks: 0, reach: 0 };
  }
}
