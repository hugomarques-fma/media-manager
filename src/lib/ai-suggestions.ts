import { createServiceRoleClient } from '@/lib/supabase-server';

interface CampaignData {
  id: string;
  name: string;
  status: string;
  daily_budget: number;
  objective: string;
  metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    cpm: number;
    roas: number;
    cpa: number;
  };
}

interface Suggestion {
  id?: string;
  campaign_id: string;
  type: 'budget_increase' | 'budget_decrease' | 'pause' | 'resume' | 'creative' | 'audience' | 'bid_strategy' | 'general';
  title: string;
  description: string;
  recommendation: string;
  estimated_impact: {
    metric: string;
    change_percentage: number;
  };
  confidence_score: number;
  priority: 'low' | 'medium' | 'high';
  action_type?: string;
  action_params?: Record<string, any>;
}

/**
 * Analyze campaigns and generate AI-powered suggestions
 */
export async function generateSuggestions(
  accountId: string,
  campaigns: CampaignData[]
): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];

  for (const campaign of campaigns) {
    // Rule-based analysis (no external API needed for MVP)
    const campaignSuggestions = analyzeMetrics(campaign);
    suggestions.push(...campaignSuggestions);
  }

  return suggestions;
}

/**
 * Analyze individual campaign metrics and generate suggestions
 */
function analyzeMetrics(campaign: CampaignData): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const metrics = campaign.metrics;

  // 1. Budget optimization
  if (metrics.roas > 2.5 && metrics.roas < 5) {
    suggestions.push({
      campaign_id: campaign.id,
      type: 'budget_increase',
      title: 'Increase Daily Budget - High Performer',
      description: `${campaign.name} has a strong ROAS of ${metrics.roas.toFixed(2)}x. Increasing budget could scale this success.`,
      recommendation: `Increase daily budget by 20-30% to capitalize on good performance.`,
      estimated_impact: {
        metric: 'conversions',
        change_percentage: 25,
      },
      confidence_score: 0.85,
      priority: 'high',
      action_type: 'update_budget',
      action_params: {
        increase_percentage: 25,
      },
    });
  }

  // 2. Pause low-performing campaigns
  if (metrics.roas < 1 && metrics.spend > 500) {
    suggestions.push({
      campaign_id: campaign.id,
      type: 'pause',
      title: 'Pause Low-ROAS Campaign',
      description: `${campaign.name} has a poor ROAS of ${metrics.roas.toFixed(2)}x despite spending $${metrics.spend.toFixed(2)}.`,
      recommendation: `Consider pausing this campaign and reallocating budget to better performers.`,
      estimated_impact: {
        metric: 'spend_efficiency',
        change_percentage: -100,
      },
      confidence_score: 0.75,
      priority: 'high',
      action_type: 'pause_campaign',
    });
  }

  // 3. CTR optimization
  if (metrics.ctr < 1.5 && campaign.status === 'active') {
    suggestions.push({
      campaign_id: campaign.id,
      type: 'creative',
      title: 'Test New Creatives - Low CTR',
      description: `${campaign.name} has low click-through rate of ${metrics.ctr.toFixed(2)}%. Testing new creative variations could improve performance.`,
      recommendation: `Launch A/B test with new creative variations. Focus on headlines and visuals that resonate better with your audience.`,
      estimated_impact: {
        metric: 'ctr',
        change_percentage: 30,
      },
      confidence_score: 0.7,
      priority: 'medium',
    });
  }

  // 4. CPC optimization
  if (metrics.cpc > 2 && metrics.ctr < 2) {
    suggestions.push({
      campaign_id: campaign.id,
      type: 'bid_strategy',
      title: 'Adjust Bid Strategy - High CPC',
      description: `${campaign.name} has high cost-per-click (${metrics.cpc.toFixed(2)}) with low CTR (${metrics.ctr.toFixed(2)}%).`,
      recommendation: `Switch to manual CPC bidding and reduce bids by 10-15%. Also review audience targeting and creative relevance.`,
      estimated_impact: {
        metric: 'cpc',
        change_percentage: -15,
      },
      confidence_score: 0.65,
      priority: 'medium',
    });
  }

  // 5. Paused campaign resurrection
  if (campaign.status === 'paused' && metrics.roas > 1.5) {
    suggestions.push({
      campaign_id: campaign.id,
      type: 'resume',
      title: 'Resume Paused High-Performer',
      description: `${campaign.name} is paused but had strong historical ROAS of ${metrics.roas.toFixed(2)}x.`,
      recommendation: `Resume this campaign with a conservative daily budget and monitor performance closely.`,
      estimated_impact: {
        metric: 'conversions',
        change_percentage: 20,
      },
      confidence_score: 0.78,
      priority: 'medium',
      action_type: 'resume_campaign',
    });
  }

  // 6. Audience expansion
  if (metrics.impressions > 100000 && metrics.ctr > 2.5) {
    suggestions.push({
      campaign_id: campaign.id,
      type: 'audience',
      title: 'Expand Audience Targeting',
      description: `${campaign.name} is performing well with high impressions (${metrics.impressions.toLocaleString()}) and good CTR.`,
      recommendation: `Test audience expansion or lookalike audiences to reach more potential customers with similar quality.`,
      estimated_impact: {
        metric: 'impressions',
        change_percentage: 40,
      },
      confidence_score: 0.72,
      priority: 'low',
    });
  }

  // 7. CPA alert
  if (metrics.cpa > 50 && metrics.conversions > 10) {
    suggestions.push({
      campaign_id: campaign.id,
      type: 'general',
      title: 'High Cost Per Acquisition Alert',
      description: `${campaign.name} shows high CPA of $${metrics.cpa.toFixed(2)}, which may impact profitability.`,
      recommendation: `Review your conversion value tracking. Consider optimizing landing page experience and audience targeting.`,
      estimated_impact: {
        metric: 'cpa',
        change_percentage: -20,
      },
      confidence_score: 0.68,
      priority: 'high',
    });
  }

  return suggestions;
}

/**
 * Save suggestions to database
 */
export async function saveSuggestions(
  accountId: string,
  suggestions: Suggestion[]
): Promise<void> {
  const supabase = createServiceRoleClient();

  // Insert suggestions
  const { error } = await supabase.from('ai_suggestions').insert(
    suggestions.map((s) => ({
      account_id: accountId,
      campaign_id: s.campaign_id,
      type: s.type,
      title: s.title,
      description: s.description,
      recommendation: s.recommendation,
      estimated_impact: s.estimated_impact,
      confidence_score: s.confidence_score,
      priority: s.priority,
      status: 'pending',
      action_type: s.action_type,
      action_params: s.action_params,
    }))
  );

  if (error) {
    console.error('Failed to save suggestions:', error);
    throw error;
  }
}

/**
 * Calculate anomaly score for a metric
 */
export function calculateAnomalyScore(
  currentValue: number,
  historicalValues: number[]
): number {
  if (historicalValues.length === 0) return 0;

  const mean = historicalValues.reduce((a, b) => a + b) / historicalValues.length;
  const variance =
    historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    historicalValues.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  // Z-score
  const zScore = Math.abs((currentValue - mean) / stdDev);

  // Convert to 0-1 scale
  return Math.min(zScore / 3, 1);
}

/**
 * Detect anomalies in campaign performance
 */
export function detectAnomalies(
  campaign: CampaignData,
  historicalData: Array<{ date: string; metrics: CampaignData['metrics'] }>
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (historicalData.length < 3) return suggestions;

  // Extract historical values for each metric
  const historicalMetrics = {
    ctr: historicalData.map((d) => d.metrics.ctr),
    cpc: historicalData.map((d) => d.metrics.cpc),
    roas: historicalData.map((d) => d.metrics.roas),
    conversions: historicalData.map((d) => d.metrics.conversions),
  };

  // Check for anomalies
  const ctrAnomaly = calculateAnomalyScore(
    campaign.metrics.ctr,
    historicalMetrics.ctr
  );
  const cpcAnomaly = calculateAnomalyScore(
    campaign.metrics.cpc,
    historicalMetrics.cpc
  );
  const roasAnomaly = calculateAnomalyScore(
    campaign.metrics.roas,
    historicalMetrics.roas
  );
  const conversionAnomaly = calculateAnomalyScore(
    campaign.metrics.conversions,
    historicalMetrics.conversions
  );

  // Generate suggestion if significant anomaly detected
  if (ctrAnomaly > 0.7) {
    suggestions.push({
      campaign_id: campaign.id,
      type: 'general',
      title: 'Unusual CTR Change Detected',
      description: `${campaign.name} shows unexpected change in CTR. Current: ${campaign.metrics.ctr.toFixed(2)}%, Historical avg: ${(historicalMetrics.ctr.reduce((a, b) => a + b) / historicalMetrics.ctr.length).toFixed(2)}%`,
      recommendation: `Investigate recent changes. Check if ads are still active, budget wasn't reduced unexpectedly, or audience targeting changed.`,
      estimated_impact: {
        metric: 'ctr',
        change_percentage: 0,
      },
      confidence_score: ctrAnomaly,
      priority: 'high',
    });
  }

  if (roasAnomaly > 0.7) {
    suggestions.push({
      campaign_id: campaign.id,
      type: 'general',
      title: 'ROAS Performance Anomaly',
      description: `${campaign.name} shows significant ROAS variance. Current: ${campaign.metrics.roas.toFixed(2)}x, Historical avg: ${(historicalMetrics.roas.reduce((a, b) => a + b) / historicalMetrics.roas.length).toFixed(2)}x`,
      recommendation: `Review recent campaign changes, conversion tracking accuracy, and external market factors affecting performance.`,
      estimated_impact: {
        metric: 'roas',
        change_percentage: 0,
      },
      confidence_score: roasAnomaly,
      priority: 'high',
    });
  }

  return suggestions;
}

/**
 * Calculate campaign health score (0-100)
 */
export function calculateHealthScore(metrics: CampaignData['metrics']): number {
  let score = 50; // Base score

  // ROAS scoring (weight: 30%)
  if (metrics.roas >= 3) score += 30;
  else if (metrics.roas >= 2) score += 25;
  else if (metrics.roas >= 1.5) score += 20;
  else if (metrics.roas >= 1) score += 10;

  // CTR scoring (weight: 20%)
  if (metrics.ctr >= 3) score += 20;
  else if (metrics.ctr >= 2) score += 15;
  else if (metrics.ctr >= 1.5) score += 10;
  else if (metrics.ctr >= 1) score += 5;

  // CPA scoring (weight: 20%)
  if (metrics.cpa === 0) score += 0; // No conversions yet
  else if (metrics.cpa < 30) score += 20;
  else if (metrics.cpa < 50) score += 15;
  else if (metrics.cpa < 100) score += 10;

  // Consistency scoring (implied from CTR/CPC ratio)
  const efficiency = metrics.ctr / (metrics.cpc > 0 ? metrics.cpc : 1);
  if (efficiency > 2) score += 10;
  else if (efficiency > 1) score += 5;

  return Math.min(100, Math.max(0, score));
}
