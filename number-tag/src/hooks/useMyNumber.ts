import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { NumberEntry, NumberInput } from '../types';

export function useMyNumber() {
  const { user } = useAuth();
  const [number, setNumber] = useState<NumberEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNumber = useCallback(async () => {
    if (!user) {
      setNumber(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('numbers')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setNumber(data ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchNumber();
  }, [fetchNumber]);

  const upsertNumber = async (input: NumberInput) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await supabase
      .from('numbers')
      .upsert({ ...input, user_id: user.id }, { onConflict: 'user_id' });
    if (!error) await fetchNumber();
    return { error };
  };

  return { number, loading, upsertNumber, refetch: fetchNumber };
}

export function useUserNumber(userId: string | undefined) {
  const [number, setNumber] = useState<NumberEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('numbers')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .single()
      .then(({ data }) => {
        setNumber(data ?? null);
        setLoading(false);
      });
  }, [userId]);

  return { number, loading };
}
