import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const metaApiVersion = 'v21.0';

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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const requestBody = await req.json().catch(() => ({}));
    const targetDate = requestBody.date || new Date().toISOString().split('T')[0];

    // Get all connected accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('ad_accounts')
      .select('id, meta_account_id, access_token')
      .eq('status', 'connected');

    if (accountsError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch accounts: ${accountsError.message}` }),
        { status: 500 }
      );
    }

    let totalCaptured = 0;
    const errors: string[] = [];

    // Process each account
    for (const account of accounts || []) {
      try {
        // Get all campaigns for this account
        const { data: campaigns, error: campaignError } = await supabase
          .from('campaigns')
          .select('id, meta_campaign_id')
          .eq('ad_account_id', account.id);

        if (campaignError) {
          errors.push(`Failed to fetch campaigns for account ${account.id}: ${campaignError.message}`);
          continue;
        }

        // Fetch metrics for each campaign
        for (const campaign of campaigns || []) {
          try {
            // Call Meta API for insights
            const insightsUrl = `https://graph.instagram.com/${metaApiVersion}/${campaign.meta_campaign_id}/insights`;
            const insightsResponse = await fetch(
              `${insightsUrl}?access_token=${account.access_token}&date_preset=yesterday&fields=spend,impressions,clicks,ctr,cpc,cpm,actions,action_values`
            );

            if (!insightsResponse.ok) {
              errors.push(
                `Meta API error for campaign ${campaign.meta_campaign_id}: ${insightsResponse.statusText}`
              );
              continue;
            }

            const insightsData = await insightsResponse.json();
            if (!insightsData.data || insightsData.data.length === 0) {
              continue;
            }

            const data = insightsData.data[0];
            const metrics: MetricsData = {
              spend: parseFloat(data.spend) || 0,
              impressions: parseInt(data.impressions) || 0,
              clicks: parseInt(data.clicks) || 0,
              ctr: parseFloat(data.ctr) || 0,
              cpc: parseFloat(data.cpc) || 0,
              cpm: parseFloat(data.cpm) || 0,
              conversions: 0,
              cpa: 0,
              roas: 0,
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

            // Check if metrics already exist
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

            totalCaptured++;
          } catch (error) {
            errors.push(
              `Error capturing metrics for campaign ${campaign.meta_campaign_id}: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`
            );
          }
        }
      } catch (error) {
        errors.push(
          `Error processing account ${account.id}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    console.log(
      `Metrics capture completed: ${totalCaptured} metrics captured, ${errors.length} errors`
    );

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        date: targetDate,
        captured: totalCaptured,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Metrics capture error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500 }
    );
  }
});
