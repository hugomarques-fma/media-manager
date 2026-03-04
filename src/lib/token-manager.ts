import { createClient } from './supabase';

export async function getValidAccessToken(accountId: string): Promise<string | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from('ad_accounts')
    .select('access_token, token_expires_at, status')
    .eq('id', accountId)
    .single();

  if (!data) return null;

  if (data.token_expires_at) {
    const expiresAt = new Date(data.token_expires_at);
    if (expiresAt < new Date()) {
      return null;
    }
  }

  return data.access_token;
}

export async function checkTokenExpiry(accountId: string): Promise<boolean> {
  const token = await getValidAccessToken(accountId);
  return !token;
}
