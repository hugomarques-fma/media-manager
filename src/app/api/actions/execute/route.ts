import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createMetaAPIClient } from '@/lib/meta-api';
import { NextRequest, NextResponse } from 'next/server';

interface ExecuteActionRequest {
  campaignId: string;
  action: 'pause' | 'resume' | 'update_budget';
  params?: {
    budget?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Authenticate user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, action, params } = (await request.json()) as ExecuteActionRequest;

    if (!campaignId || !action) {
      return NextResponse.json(
        { error: 'Campaign ID and action are required' },
        { status: 400 }
      );
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, meta_campaign_id, ad_account_id, status')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Verify account ownership
    const { data: account, error: accountError } = await supabase
      .from('ad_accounts')
      .select('id, meta_account_id, access_token, user_id')
      .eq('id', campaign.ad_account_id)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const metaClient = createMetaAPIClient(account.access_token);
    let result: any = {};

    // Execute action based on type
    switch (action) {
      case 'pause':
        result = await metaClient.pauseCampaign(campaign.meta_campaign_id);
        break;

      case 'resume':
        result = await metaClient.resumeCampaign(campaign.meta_campaign_id);
        break;

      case 'update_budget':
        if (!params?.budget || params.budget <= 0) {
          return NextResponse.json(
            { error: 'Valid budget value is required' },
            { status: 400 }
          );
        }
        result = await metaClient.updateCampaignBudget(
          campaign.meta_campaign_id,
          params.budget
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be pause, resume, or update_budget' },
          { status: 400 }
        );
    }

    // Update campaign status if successful
    if (result.success || result.id) {
      let newStatus = campaign.status;

      if (action === 'pause') {
        newStatus = 'paused';
      } else if (action === 'resume') {
        newStatus = 'active';
      }

      if (action === 'update_budget') {
        await supabase
          .from('campaigns')
          .update({
            daily_budget: params!.budget,
            updated_at: new Date().toISOString(),
          })
          .eq('id', campaign.id);
      } else {
        await supabase
          .from('campaigns')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', campaign.id);
      }
    }

    // Log the action
    await supabase.from('action_logs').insert({
      account_id: account.id,
      campaign_id: campaign.id,
      action_type: action,
      status: result.success || result.id ? 'success' : 'failed',
      metadata: {
        action,
        params,
        result,
      },
    });

    return NextResponse.json({
      success: true,
      action,
      campaign_id: campaignId,
      meta_campaign_id: campaign.meta_campaign_id,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Execute action error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to execute action',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Authenticate user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Get campaign and verify ownership
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id, ad_account_id')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const { data: account } = await supabase
      .from('ad_accounts')
      .select('id, user_id')
      .eq('id', campaign.ad_account_id)
      .eq('user_id', user.id)
      .single();

    if (!account) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Get action history for this campaign
    const { data: actions, error: actionsError } = await supabase
      .from('action_logs')
      .select('id, action_type, status, metadata, created_at')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (actionsError) {
      return NextResponse.json({ error: actionsError.message }, { status: 500 });
    }

    return NextResponse.json({
      campaign_id: campaignId,
      actions: actions || [],
      total: (actions || []).length,
    });
  } catch (error) {
    console.error('Get actions error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get actions',
      },
      { status: 500 }
    );
  }
}
