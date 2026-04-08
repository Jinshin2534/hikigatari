import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Event } from '../types';

export function useActiveEvent() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setEvent(data ?? null);
        setLoading(false);
      });
  }, []);

  return { event, loading };
}
