import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useMyNumber } from '../hooks/useMyNumber';
import { useProfile } from '../hooks/useProfile';
import { NumberBadge } from '../components/number/NumberBadge';
import QRCode from 'qrcode';
import type { NumberCategory } from '../types';

export function QRPage() {
  const { user } = useAuth();
  const { number } = useMyNumber();
  const { profile } = useProfile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(true);

  // QRセッションを取得または作成
  useEffect(() => {
    if (!user) return;
    const createOrGetSession = async () => {
      setLoading(true);
      // 既存の有効なトークンを取得
      const { data: existing } = await supabase
        .from('qr_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        setToken(existing.token);
        setExpiresAt(new Date(existing.expires_at));
      } else {
        // 新しいトークンを作成
        const { data: newSession } = await supabase
          .from('qr_sessions')
          .insert({ user_id: user.id })
          .select()
          .single();
        if (newSession) {
          setToken(newSession.token);
          setExpiresAt(new Date(newSession.expires_at));
        }
      }
      setLoading(false);
    };
    void createOrGetSession();
  }, [user]);

  // QRコードを canvas に描画
  useEffect(() => {
    if (!token || !canvasRef.current) return;
    const url = `${window.location.origin}/scan?token=${token}`;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 240,
      margin: 2,
      color: { dark: '#1e1b4b', light: '#ffffff' },
    });
  }, [token]);

  // 残り時間カウントダウン
  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = Math.max(0, expiresAt.getTime() - Date.now());
      const min = Math.floor(diff / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${min}:${sec.toString().padStart(2, '0')}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <div className="flex flex-col min-h-full px-4 pt-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">自分のQRコード</h1>
      <p className="text-sm text-gray-500 mb-6">相手にスキャンしてもらいましょう</p>

      {/* 自分の数字バッジ */}
      {number && (
        <div className="flex justify-center mb-6">
          <NumberBadge
            numberValue={number.number_value}
            color={number.color}
            displayLevel={number.display_level}
            nickname={profile?.nickname}
            category={number.category as NumberCategory}
            meaning={number.meaning}
            size="md"
          />
        </div>
      )}

      {/* QRコード */}
      <div className="flex flex-col items-center gap-4">
        {loading ? (
          <div className="w-60 h-60 bg-gray-100 rounded-2xl animate-pulse" />
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <canvas ref={canvasRef} className="rounded-xl" />
          </div>
        )}

        {timeLeft && (
          <p className="text-sm text-gray-500">
            有効期限まで残り <span className="font-mono font-semibold text-violet-600">{timeLeft}</span>
          </p>
        )}
      </div>

      {!number && !loading && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-sm text-amber-700">
            先に数字を設定してください。QRコードをスキャンしても何も表示されません。
          </p>
        </div>
      )}
    </div>
  );
}
