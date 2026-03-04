import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface TokenRefreshResult {
  account_id: string;
  status: 'success' | 'failed';
  message: string;
  old_expiry?: string;
  new_expiry?: string;
}

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all accounts with tokens expiring in next 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: expiringAccounts, error: fetchError } = await supabase
      .from('ad_accounts')
      .select('id, meta_account_id, access_token, token_expires_at, refresh_token')
      .lt('token_expires_at', tomorrow.toISOString())
      .gt('token_expires_at', new Date().toISOString())
      .eq('status', 'connected');

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch accounts: ${fetchError.message}` }),
        { status: 500 }
      );
    }

    const results: TokenRefreshResult[] = [];

    // Refresh each token
    for (const account of expiringAccounts || []) {
      try {
        // Call Meta API to refresh token using refresh_token
        const refreshResponse = await fetch(
          `https://graph.instagram.com/v21.0/oauth/access_token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'fb_exchange_token',
              client_id: Deno.env.get('META_CLIENT_ID') || '',
              client_secret: Deno.env.get('META_CLIENT_SECRET') || '',
              access_token: account.access_token,
            }).toString(),
          }
        );

        if (!refreshResponse.ok) {
          const error = await refreshResponse.json();
          results.push({
            account_id: account.id,
            status: 'failed',
            message: `Meta API error: ${error.error?.message || 'Unknown'}`,
          });
          continue;
        }

        const refreshData = await refreshResponse.json();
        if (!refreshData.access_token) {
          results.push({
            account_id: account.id,
            status: 'failed',
            message: 'No access token in refresh response',
          });
          continue;
        }

        // Calculate new expiry (60 days from now in seconds)
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 60);

        // Update account with new token
        const { error: updateError } = await supabase
          .from('ad_accounts')
          .update({
            access_token: refreshData.access_token,
            token_expires_at: newExpiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', account.id);

        if (updateError) {
          results.push({
            account_id: account.id,
            status: 'failed',
            message: `Database update failed: ${updateError.message}`,
            old_expiry: account.token_expires_at,
          });
          continue;
        }

        results.push({
          account_id: account.id,
          status: 'success',
          message: 'Token refreshed successfully',
          old_expiry: account.token_expires_at,
          new_expiry: newExpiresAt.toISOString(),
        });

        // Log refresh action
        await supabase.from('action_logs').insert({
          account_id: account.id,
          action_type: 'token_refresh',
          status: 'success',
          metadata: {
            old_expiry: account.token_expires_at,
            new_expiry: newExpiresAt.toISOString(),
          },
        });
      } catch (error) {
        results.push({
          account_id: account.id,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Log job result
    const successCount = results.filter((r) => r.status === 'success').length;
    const failureCount = results.filter((r) => r.status === 'failed').length;

    console.log(
      `Token refresh job completed: ${successCount} successful, ${failureCount} failed`
    );

    return new Response(
      JSON.stringify({
        success: true,
        total: results.length,
        successful: successCount,
        failed: failureCount,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500 }
    );
  }
});
