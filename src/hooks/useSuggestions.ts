import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'pending' | 'approved' | 'executed';
  estimated_impact: string;
}

export function useSuggestions(accountId?: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!accountId) return;

    const fetchSuggestions = async () => {
      const { data } = await supabase
        .from('ai_suggestions')
        .select('*')
        .eq('account_id', accountId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (data) setSuggestions(data);
      setLoading(false);
    };

    fetchSuggestions();

    const channel = supabase
      .channel(`suggestions-${accountId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_suggestions' },
        () => fetchSuggestions()
      )
      .subscribe();

    return () => channel.unsubscribe();
  }, [accountId, supabase]);

  return { suggestions, loading };
}
