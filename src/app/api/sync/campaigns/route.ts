import { createServerSupabaseClient } from '@/lib/supabase-server';
import { syncCampaigns } from '@/lib/sync/campaign-sync';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get account from database
    const { data: account, error: accountError } = await supabase
      .from('ad_accounts')
      .select('id, meta_account_id, access_token')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Decrypt access token (in production, implement proper encryption)
    const accessToken = account.access_token;

    // Start sync
    const result = await syncCampaigns(
      account.id,
      account.meta_account_id,
      accessToken
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Sync failed',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get latest sync status
    const { data: syncLogs, error: logError } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('account_id', accountId)
      .order('started_at', { ascending: false })
      .limit(1);

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    const lastSync = syncLogs?.[0];

    return NextResponse.json({
      lastSync,
      nextSync: lastSync
        ? new Date(new Date(lastSync.started_at).getTime() + 60 * 60 * 1000) // 1 hour later
        : null,
    });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get status',
      },
      { status: 500 }
    );
  }
}
