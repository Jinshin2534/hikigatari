import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import type { UserWithNumber } from '../types';

export function useNearbyUsers() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [users, setUsers] = useState<UserWithNumber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);

    // 同学年・クラスのユーザーを取得（設定がない場合は全員）
    let profileQuery = supabase.from('user_profiles').select('*').neq('id', user.id);
    if (profile.grade) profileQuery = profileQuery.eq('grade', profile.grade);
    if (profile.class) profileQuery = profileQuery.eq('class', profile.class);

    const { data: profiles } = await profileQuery.limit(50);
    if (!profiles || profiles.length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const userIds = profiles.map(p => p.id);
    const { data: numbers } = await supabase
      .from('numbers')
      .select('*')
      .in('user_id', userIds)
      .eq('is_public', true);

    const numberMap = new Map((numbers ?? []).map(n => [n.user_id, n]));
    const result: UserWithNumber[] = profiles
      .filter(p => numberMap.has(p.id))
      .map(p => ({ profile: p, number: numberMap.get(p.id)! }));

    setUsers(result);
    setLoading(false);
  }, [user, profile]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return { users, loading, refetch: fetchUsers };
}
