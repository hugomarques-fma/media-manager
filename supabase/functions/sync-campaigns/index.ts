import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Validate and get environment variables
function getEnvVars(): { supabaseUrl: string; supabaseServiceKey: string; valid: boolean; error?: string } {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      supabaseUrl,
      supabaseServiceKey,
      valid: false,
      error: 'Missing Supabase environment variables',
    };
  }

  return { supabaseUrl, supabaseServiceKey, valid: true };
}

// Retry helper with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `[sync-campaigns] Attempt ${attempt + 1} failed: ${lastError.message}. Retrying...`
      );

      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

const envVars = getEnvVars();
const metaApiVersion = 'v21.0';

interface SyncResult {
  campaignsCreated: number;
  campaignsUpdated: number;
  adSetsCreated: number;
  adSetsUpdated: number;
  adsCreated: number;
  adsUpdated: number;
  errors: string[];
}

async function getCampaignId(
  supabase: any,
  accountId: string,
  metaCampaignId: string
): Promise<string> {
  const { data } = await supabase
    .from('campaigns')
    .select('id')
    .eq('ad_account_id', accountId)
    .eq('meta_campaign_id', metaCampaignId)
    .single();

  if (!data) {
    throw new Error(`Campaign not found: ${metaCampaignId}`);
  }
  return data.id;
}

async function getAdSetId(
  supabase: any,
  campaignId: string,
  metaAdSetId: string
): Promise<string> {
  const { data } = await supabase
    .from('ad_sets')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('meta_adset_id', metaAdSetId)
    .single();

  if (!data) {
    throw new Error(`Ad set not found: ${metaAdSetId}`);
  }
  return data.id;
}

serve(async (req) => {
  try {
    // Validate env vars
    if (!envVars.valid) {
      console.error('Configuration error:', envVars.error);
      return new Response(
        JSON.stringify({ error: envVars.error, status: 'configuration_error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[sync-campaigns] Starting campaign synchronization');
    const supabase = createClient(envVars.supabaseUrl, envVars.supabaseServiceKey);

    // Get all connected accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('ad_accounts')
      .select('id, meta_account_id, access_token')
      .eq('status', 'connected');

    if (accountsError) {
      console.error('[sync-campaigns] Failed to fetch accounts:', accountsError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch accounts: ${accountsError.message}` }),
        { status: 500 }
      );
    }

    const allResults: Record<string, SyncResult> = {};

    // Sync each account
    for (const account of accounts || []) {
      const result: SyncResult = {
        campaignsCreated: 0,
        campaignsUpdated: 0,
        adSetsCreated: 0,
        adSetsUpdated: 0,
        adsCreated: 0,
        adsUpdated: 0,
        errors: [],
      };

      try {
        // Fetch campaigns from Meta API with retry
        const campaignsUrl = `https://graph.instagram.com/${metaApiVersion}/act_${account.meta_account_id}/campaigns`;
        const campaignsResponse = await retryWithBackoff(() =>
          fetch(
            `${campaignsUrl}?access_token=${account.access_token}&fields=id,name,status,objective,daily_budget,budget_remaining,created_time,updated_time`
          )
        );

        if (!campaignsResponse.ok) {
          result.errors.push(
            `Meta API error: ${campaignsResponse.status} ${campaignsResponse.statusText}`
          );
          console.warn(`[sync-campaigns] Failed to fetch campaigns for account ${account.id}`);
          allResults[account.id] = result;
          continue;
        }

        const campaignsData = await campaignsResponse.json();
        const campaigns = campaignsData.data || [];

        // Sync campaigns
        for (const campaign of campaigns) {
          try {
            const { data: existingCampaign } = await supabase
              .from('campaigns')
              .select('id')
              .eq('ad_account_id', account.id)
              .eq('meta_campaign_id', campaign.id)
              .single();

            if (existingCampaign) {
              await supabase
                .from('campaigns')
                .update({
                  name: campaign.name,
                  status: campaign.status.toLowerCase(),
                  objective: campaign.objective,
                  daily_budget: campaign.daily_budget,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingCampaign.id);

              result.campaignsUpdated++;
            } else {
              await supabase.from('campaigns').insert({
                ad_account_id: account.id,
                meta_campaign_id: campaign.id,
                name: campaign.name,
                status: campaign.status.toLowerCase(),
                objective: campaign.objective,
                daily_budget: campaign.daily_budget,
              });

              result.campaignsCreated++;
            }

            // Sync ad sets for this campaign
            const adSetsUrl = `https://graph.instagram.com/${metaApiVersion}/${campaign.id}/adsets`;
            const adSetsResponse = await fetch(
              `${adSetsUrl}?access_token=${account.access_token}&fields=id,name,status,budget,daily_budget,created_time,updated_time`
            );

            if (!adSetsResponse.ok) {
              result.errors.push(
                `Error fetching ad sets for campaign ${campaign.id}: ${adSetsResponse.statusText}`
              );
              continue;
            }

            const adSetsData = await adSetsResponse.json();
            const adSets = adSetsData.data || [];

            for (const adSet of adSets) {
              try {
                const campaignId = existingCampaign
                  ? existingCampaign.id
                  : await getCampaignId(supabase, account.id, campaign.id);

                const { data: existingAdSet } = await supabase
                  .from('ad_sets')
                  .select('id')
                  .eq('campaign_id', campaignId)
                  .eq('meta_adset_id', adSet.id)
                  .single();

                if (existingAdSet) {
                  await supabase
                    .from('ad_sets')
                    .update({
                      name: adSet.name,
                      status: adSet.status.toLowerCase(),
                      budget: adSet.budget,
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', existingAdSet.id);

                  result.adSetsUpdated++;
                } else {
                  await supabase.from('ad_sets').insert({
                    campaign_id: campaignId,
                    meta_adset_id: adSet.id,
                    name: adSet.name,
                    status: adSet.status.toLowerCase(),
                    budget: adSet.budget,
                  });

                  result.adSetsCreated++;
                }

                // Sync ads for this ad set with retry
                const adsUrl = `https://graph.instagram.com/${metaApiVersion}/${adSet.id}/ads`;
                const adsResponse = await retryWithBackoff(() =>
                  fetch(
                    `${adsUrl}?access_token=${account.access_token}&fields=id,name,status,creative,created_time,updated_time`
                  )
                );

                if (!adsResponse.ok) {
                  result.errors.push(
                    `Error fetching ads for ad set ${adSet.id}: ${adsResponse.statusText}`
                  );
                  console.warn(`[sync-campaigns] Failed to fetch ads for ad set ${adSet.id}`);
                  continue;
                }

                const adsData = await adsResponse.json();
                const ads = adsData.data || [];

                for (const ad of ads) {
                  try {
                    const adSetId = existingAdSet
                      ? existingAdSet.id
                      : await getAdSetId(supabase, campaignId, adSet.id);

                    const { data: existingAd } = await supabase
                      .from('ads')
                      .select('id')
                      .eq('ad_set_id', adSetId)
                      .eq('meta_ad_id', ad.id)
                      .single();

                    if (existingAd) {
                      await supabase
                        .from('ads')
                        .update({
                          name: ad.name,
                          status: ad.status.toLowerCase(),
                          updated_at: new Date().toISOString(),
                        })
                        .eq('id', existingAd.id);

                      result.adsUpdated++;
                    } else {
                      await supabase.from('ads').insert({
                        ad_set_id: adSetId,
                        meta_ad_id: ad.id,
                        name: ad.name,
                        status: ad.status.toLowerCase(),
                      });

                      result.adsCreated++;
                    }
                  } catch (error) {
                    result.errors.push(`Error syncing ad ${ad.id}: ${error}`);
                  }
                }
              } catch (error) {
                result.errors.push(`Error syncing ad set ${adSet.id}: ${error}`);
              }
            }
          } catch (error) {
            result.errors.push(`Error syncing campaign ${campaign.id}: ${error}`);
          }
        }

        // Log sync result
        await supabase.from('sync_logs').insert({
          account_id: account.id,
          sync_type: 'campaigns',
          status: result.errors.length === 0 ? 'success' : 'partial',
          error_message:
            result.errors.length > 0 ? result.errors.slice(0, 5).join('; ') : null,
          completed_at: new Date().toISOString(),
        });
      } catch (error) {
        result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      }

      allResults[account.id] = result;
    }

    const totalCreated = Object.values(allResults).reduce(
      (sum, r) => sum + r.campaignsCreated + r.adSetsCreated + r.adsCreated,
      0
    );
    const totalUpdated = Object.values(allResults).reduce(
      (sum, r) => sum + r.campaignsUpdated + r.adSetsUpdated + r.adsUpdated,
      0
    );

    console.log(`Campaign sync completed: ${totalCreated} created, ${totalUpdated} updated`);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        results: allResults,
        summary: { created: totalCreated, updated: totalUpdated },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Campaign sync error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500 }
    );
  }
});
