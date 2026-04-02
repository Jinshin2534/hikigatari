import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Song, SongInput } from '../types';

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setSongs(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const createSong = async (input: SongInput): Promise<Song | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('songs')
      .insert({ ...input, user_id: user.id })
      .select()
      .single();
    if (error || !data) return null;
    setSongs(prev => [data, ...prev]);
    return data;
  };

  const updateSong = async (id: string, input: Partial<SongInput>): Promise<Song | null> => {
    const { data, error } = await supabase
      .from('songs')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) return null;
    setSongs(prev => prev.map(s => s.id === id ? data : s));
    return data;
  };

  const deleteSong = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('songs').delete().eq('id', id);
    if (error) return false;
    setSongs(prev => prev.filter(s => s.id !== id));
    return true;
  };

  return { songs, loading, error, createSong, updateSong, deleteSong, refetch: fetchSongs };
}
