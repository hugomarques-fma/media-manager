import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Validate environment variables
function validateEnvVars(): { valid: boolean; error?: string } {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    return { valid: false, error: 'Missing Supabase environment variables' };
  }

  return { valid: true };
}

const envValidation = validateEnvVars();
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface MetricsData {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  cpa: number;
  roas: number;
}

serve(async (req) => {
  try {
    // Validate env vars before proceeding
    if (!envValidation.valid) {
      console.error('Configuration error:', envValidation.error);
      return new Response(
        JSON.stringify({ error: envValidation.error, status: 'configuration_error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[generate-suggestions] Starting suggestion generation');

    // Get all accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('ad_accounts')
      .select('id')
      .eq('status', 'connected');

    if (accountsError) {
      return new Response(JSON.stringify({ error: accountsError.message }), {
        status: 500,
      });
    }

    let totalSuggestionsCreated = 0;
    const errors: string[] = [];

    // Process each account
    for (const account of accounts || []) {
      try {
        // Get campaigns with latest metrics
        const { data: campaigns, error: campaignError } = await supabase
          .from('campaigns')
          .select(
            `
            id,
            name,
            status,
            daily_budget,
            objective,
            campaign_metrics!inner(spend, impressions, clicks, ctr, cpc, cpm, conversions, cpa, roas, date)
          `
          )
          .eq('ad_account_id', account.id)
          .order('campaign_metrics(date)', { ascending: false, referencedTable: 'campaign_metrics' })
          .limit(1, { foreignTable: 'campaign_metrics' });

        if (campaignError) {
          errors.push(`Failed to fetch campaigns for account ${account.id}: ${campaignError.message}`);
          continue;
        }

        // Generate suggestions for each campaign
        for (const campaign of campaigns || []) {
          try {
            const latestMetric = campaign.campaign_metrics?.[0];
            if (!latestMetric) continue;

            const suggestions = analyzeCampaignForSuggestions(campaign, latestMetric);

            // Save suggestions
            for (const suggestion of suggestions) {
              const { error: insertError } = await supabase
                .from('ai_suggestions')
                .insert({
                  account_id: account.id,
                  campaign_id: campaign.id,
                  type: suggestion.type,
                  title: suggestion.title,
                  description: suggestion.description,
                  recommendation: suggestion.recommendation,
                  estimated_impact: suggestion.estimated_impact,
                  confidence_score: suggestion.confidence_score,
                  priority: suggestion.priority,
                  status: 'pending',
                  action_type: suggestion.action_type,
                  action_params: suggestion.action_params,
                });

              if (insertError) {
                errors.push(
                  `Failed to insert suggestion for campaign ${campaign.id}: ${insertError.message}`
                );
              } else {
                totalSuggestionsCreated++;
              }
            }
          } catch (error) {
            errors.push(
              `Error processing campaign ${campaign.id}: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
      } catch (error) {
        errors.push(
          `Error processing account ${account.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    console.log(
      `[generate-suggestions] Suggestion generation completed: ${totalSuggestionsCreated} suggestions created, ${errors.length} errors`
    );

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        suggestions_created: totalSuggestionsCreated,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[generate-suggestions] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
});

/**
 * Analyze campaign metrics and generate suggestions
 */
function analyzeCampaignForSuggestions(
  campaign: any,
  metrics: MetricsData
): Array<{
  type: string;
  title: string;
  description: string;
  recommendation: string;
  estimated_impact: { metric: string; change_percentage: number };
  confidence_score: number;
  priority: string;
  action_type?: string;
  action_params?: Record<string, any>;
}> {
  const suggestions = [];

  // 1. High ROAS - increase budget
  if (metrics.roas > 2.5 && metrics.roas < 5) {
    suggestions.push({
      type: 'budget_increase',
      title: 'Increase Daily Budget - High Performer',
      description: `${campaign.name} has strong ROAS of ${metrics.roas.toFixed(2)}x. Increasing budget could scale this success.`,
      recommendation: 'Increase daily budget by 20-30% to capitalize on good performance.',
      estimated_impact: { metric: 'conversions', change_percentage: 25 },
      confidence_score: 0.85,
      priority: 'high',
      action_type: 'update_budget',
      action_params: { increase_percentage: 25 },
    });
  }

  // 2. Low ROAS - pause campaign
  if (metrics.roas < 1 && metrics.spend > 500) {
    suggestions.push({
      type: 'pause',
      title: 'Pause Low-ROAS Campaign',
      description: `${campaign.name} has poor ROAS of ${metrics.roas.toFixed(2)}x despite spending $${metrics.spend.toFixed(2)}.`,
      recommendation: 'Consider pausing this campaign and reallocating budget to better performers.',
      estimated_impact: { metric: 'spend_efficiency', change_percentage: -100 },
      confidence_score: 0.75,
      priority: 'high',
      action_type: 'pause_campaign',
    });
  }

  // 3. Low CTR - test creatives
  if (metrics.ctr < 1.5 && campaign.status === 'active') {
    suggestions.push({
      type: 'creative',
      title: 'Test New Creatives - Low CTR',
      description: `${campaign.name} has low CTR of ${metrics.ctr.toFixed(2)}%. Testing new creatives could improve performance.`,
      recommendation: 'Launch A/B test with new creative variations. Focus on headlines and visuals.',
      estimated_impact: { metric: 'ctr', change_percentage: 30 },
      confidence_score: 0.7,
      priority: 'medium',
    });
  }

  // 4. High CPC - adjust bidding
  if (metrics.cpc > 2 && metrics.ctr < 2) {
    suggestions.push({
      type: 'bid_strategy',
      title: 'Adjust Bid Strategy - High CPC',
      description: `${campaign.name} has high CPC of $${metrics.cpc.toFixed(2)} with low CTR of ${metrics.ctr.toFixed(2)}%.`,
      recommendation: 'Switch to manual CPC bidding and reduce bids by 10-15%. Review audience targeting.',
      estimated_impact: { metric: 'cpc', change_percentage: -15 },
      confidence_score: 0.65,
      priority: 'medium',
    });
  }

  // 5. Resume paused high performers
  if (campaign.status === 'paused' && metrics.roas > 1.5) {
    suggestions.push({
      type: 'resume',
      title: 'Resume Paused High-Performer',
      description: `${campaign.name} is paused but had strong ROAS of ${metrics.roas.toFixed(2)}x.`,
      recommendation: 'Resume this campaign with a conservative daily budget and monitor closely.',
      estimated_impact: { metric: 'conversions', change_percentage: 20 },
      confidence_score: 0.78,
      priority: 'medium',
      action_type: 'resume_campaign',
    });
  }

  // 6. Audience expansion
  if (metrics.impressions > 100000 && metrics.ctr > 2.5) {
    suggestions.push({
      type: 'audience',
      title: 'Expand Audience Targeting',
      description: `${campaign.name} is performing well with high impressions and good CTR.`,
      recommendation: 'Test audience expansion or lookalike audiences to reach more potential customers.',
      estimated_impact: { metric: 'impressions', change_percentage: 40 },
      confidence_score: 0.72,
      priority: 'low',
    });
  }

  // 7. High CPA alert
  if (metrics.cpa > 50 && metrics.conversions > 10) {
    suggestions.push({
      type: 'general',
      title: 'High Cost Per Acquisition Alert',
      description: `${campaign.name} shows high CPA of $${metrics.cpa.toFixed(2)}, which may impact profitability.`,
      recommendation: 'Review conversion value tracking. Optimize landing page and audience targeting.',
      estimated_impact: { metric: 'cpa', change_percentage: -20 },
      confidence_score: 0.68,
      priority: 'high',
    });
  }

  return suggestions;
}
