import { createServiceRoleClient } from '@/lib/supabase-server';
import { createMetaAPIClient } from '@/lib/meta-api';

interface SyncResult {
  campaignsCreated: number;
  campaignsUpdated: number;
  adSetsCreated: number;
  adSetsUpdated: number;
  adsCreated: number;
  adsUpdated: number;
  errors: string[];
}

/**
 * Synchronize campaigns from Meta API to database
 */
export async function syncCampaigns(
  accountId: string,
  metaAccountId: string,
  accessToken: string
): Promise<SyncResult> {
  const supabase = createServiceRoleClient();
  const metaClient = createMetaAPIClient(accessToken);
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
    // Get account ID from database
    const { data: account, error: accountError } = await supabase
      .from('ad_accounts')
      .select('id')
      .eq('meta_account_id', metaAccountId)
      .single();

    if (accountError || !account) {
      result.errors.push(`Account not found: ${metaAccountId}`);
      return result;
    }

    // Fetch campaigns from Meta
    console.log('Fetching campaigns from Meta API...');
    const campaigns = await metaClient.getCampaigns(metaAccountId);

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
          // Update existing
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
          // Create new
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
        const adSets = await metaClient.getAdSets(campaign.id);

        for (const adSet of adSets) {
          try {
            const { data: existingAdSet } = await supabase
              .from('ad_sets')
              .select('id')
              .eq('campaign_id', existingCampaign?.id || (await getCampaignId(account.id, campaign.id)))
              .eq('meta_adset_id', adSet.id)
              .single();

            const campaignId =
              existingCampaign?.id || (await getCampaignId(account.id, campaign.id));

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

            // Sync ads for this ad set
            const ads = await metaClient.getAds(adSet.id);

            for (const ad of ads) {
              try {
                const { data: existingAd } = await supabase
                  .from('ads')
                  .select('id')
                  .eq('ad_set_id', existingAdSet?.id || (await getAdSetId(campaignId, adSet.id)))
                  .eq('meta_ad_id', ad.id)
                  .single();

                const adSetId =
                  existingAdSet?.id || (await getAdSetId(campaignId, adSet.id));

                if (existingAd) {
                  await supabase
                    .from('ads')
                    .update({
                      name: ad.name,
                      status: ad.status.toLowerCase(),
                      creative_url: ad.creative?.image_url || null,
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
                    creative_url: ad.creative?.image_url || null,
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
      status: result.errors.length === 0 ? 'success' : 'failed',
      error_message: result.errors.length > 0 ? result.errors.join('; ') : null,
      completed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Campaign sync failed:', error);
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return result;
}

/**
 * Helper to get campaign ID
 */
async function getCampaignId(accountId: string, metaCampaignId: string): Promise<string> {
  const supabase = createServiceRoleClient();
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

/**
 * Helper to get ad set ID
 */
async function getAdSetId(campaignId: string, metaAdSetId: string): Promise<string> {
  const supabase = createServiceRoleClient();
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
