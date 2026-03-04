import { createServiceRoleClient } from '@/lib/supabase';
import { createMetaAPIClient } from '@/lib/meta-api';

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

/**
 * Capture daily metrics for campaigns
 */
export async function captureMetrics(
  accountId: string,
  accessToken: string,
  date?: string
): Promise<{ success: boolean; captured: number; errors: string[] }> {
  const supabase = createServiceRoleClient();
  const metaClient = createMetaAPIClient(accessToken);
  const errors: string[] = [];
  let captured = 0;

  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    // Get all campaigns for this account
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, meta_campaign_id')
      .eq('ad_account_id', accountId);

    if (campaignError) {
      errors.push(`Failed to fetch campaigns: ${campaignError.message}`);
      return { success: false, captured, errors };
    }

    if (!campaigns || campaigns.length === 0) {
      return { success: true, captured: 0, errors };
    }

    // Fetch metrics for each campaign
    for (const campaign of campaigns) {
      try {
        const insights = await metaClient.getCampaignInsights(
          campaign.meta_campaign_id,
          {
            date_preset: 'yesterday', // Get yesterday's data for stability
          }
        );

        if (!insights || insights.length === 0) {
          continue;
        }

        const data = insights[0];
        const metrics: MetricsData = {
          spend: parseFloat(data.spend) || 0,
          impressions: parseInt(data.impressions) || 0,
          clicks: parseInt(data.clicks) || 0,
          ctr: parseFloat(data.ctr) || 0,
          cpc: parseFloat(data.cpc) || 0,
          cpm: parseFloat(data.cpm) || 0,
          conversions: 0, // TODO: Get from actions
          cpa: 0, // TODO: Calculate from actions
          roas: 0, // TODO: Get from action_values
        };

        // Parse actions (conversions)
        if (data.actions) {
          const actions = Array.isArray(data.actions) ? data.actions : [data.actions];
          const purchaseAction = actions.find(
            (a: any) => a.action_type === 'purchase'
          );
          if (purchaseAction) {
            metrics.conversions = parseInt(purchaseAction.value) || 0;
          }
        }

        // Calculate CPA
        if (metrics.conversions > 0) {
          metrics.cpa = metrics.spend / metrics.conversions;
        }

        // Parse ROAS
        if (data.action_values) {
          const actionValues = Array.isArray(data.action_values)
            ? data.action_values
            : [data.action_values];
          const purchaseValue = actionValues.find(
            (a: any) => a.action_type === 'purchase'
          );
          if (purchaseValue && metrics.spend > 0) {
            metrics.roas = parseFloat(purchaseValue.value) / metrics.spend;
          }
        }

        // Check if metrics already exist for this date
        const { data: existingMetrics } = await supabase
          .from('campaign_metrics')
          .select('id')
          .eq('campaign_id', campaign.id)
          .eq('date', targetDate)
          .single();

        if (existingMetrics) {
          // Update existing
          await supabase
            .from('campaign_metrics')
            .update(metrics)
            .eq('id', existingMetrics.id);
        } else {
          // Insert new
          await supabase.from('campaign_metrics').insert({
            campaign_id: campaign.id,
            date: targetDate,
            ...metrics,
          });
        }

        captured++;
      } catch (error) {
        errors.push(
          `Failed to capture metrics for campaign ${campaign.meta_campaign_id}: ${error}`
        );
      }
    }

    return {
      success: errors.length === 0,
      captured,
      errors,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return { success: false, captured, errors };
  }
}

/**
 * Backfill metrics for the last 30 days
 */
export async function backfillMetrics(
  accountId: string,
  accessToken: string,
  days = 30
): Promise<{ success: boolean; captured: number; errors: string[] }> {
  let totalCaptured = 0;
  const totalErrors: string[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const result = await captureMetrics(accountId, accessToken, dateStr);

    totalCaptured += result.captured;
    totalErrors.push(...result.errors);

    // Rate limit: 100ms between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return {
    success: totalErrors.length === 0,
    captured: totalCaptured,
    errors: totalErrors,
  };
}
