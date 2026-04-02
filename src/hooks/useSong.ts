import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Song } from '../types';

export function useSong(id: string | undefined) {
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setSong(data);
        setLoading(false);
      });
  }, [id]);

  return { song, loading, error };
}
