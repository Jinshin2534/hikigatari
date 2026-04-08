import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useNearbyUsers } from '../hooks/useNearbyUsers';
import { NumberBadge } from '../components/number/NumberBadge';
import { Button } from '../components/ui/Button';
import { Html5Qrcode } from 'html5-qrcode';
import type { NumberCategory, PublicNumberData } from '../types';

type Mode = 'ar' | 'scan' | 'list';

export function CameraPage() {
  const navigate = useNavigate();
  const { users } = useNearbyUsers();
  const [mode, setMode] = useState<Mode>('ar');
  const [cameraError, setCameraError] = useState('');
  const [scanResult, setScanResult] = useState<PublicNumberData | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  // カメラ起動
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError('カメラへのアクセスが拒否されました。ブラウザの設定でカメラを許可してください。');
    }
  }, []);

  // カメラ停止
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  // ARモード時にカメラを起動
  useEffect(() => {
    if (mode === 'ar') {
      void startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  // iOS Safari: ページが再表示された時にカメラを再起動
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && mode === 'ar') {
        void startCamera();
      } else {
        stopCamera();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [mode, startCamera, stopCamera]);

  // QRスキャン開始
  const startQrScan = useCallback(async () => {
    setScanning(true);
    setScanResult(null);
    const scanner = new Html5Qrcode('qr-reader');
    qrScannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // スキャン成功 - URLからトークンを取得
          await scanner.stop();
          setScanning(false);

          try {
            const url = new URL(decodedText);
            const token = url.searchParams.get('token');
            if (!token) return;

            const { data } = await supabase.rpc('resolve_qr_token', { p_token: token });
            if (data) {
              setScanResult(data as PublicNumberData);
            }
          } catch {
            // URL以外のQRコードは無視
          }
        },
        () => { /* スキャン中の一時的なエラーは無視 */ }
      );
    } catch {
      setScanning(false);
      setCameraError('QRスキャナーの起動に失敗しました');
    }
  }, []);

  // QRスキャン停止
  const stopQrScan = useCallback(async () => {
    if (qrScannerRef.current) {
      try { await qrScannerRef.current.stop(); } catch { /* ignore */ }
      qrScannerRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    if (mode === 'scan') {
      void startQrScan();
    } else {
      void stopQrScan();
    }
    return () => { void stopQrScan(); };
  }, [mode, startQrScan, stopQrScan]);

  return (
    <div className="flex flex-col min-h-dvh bg-black">
      {/* モード切替タブ */}
      <div className="flex bg-black/80 backdrop-blur-sm z-10 border-b border-white/10">
        {([['ar', 'ARカメラ'], ['scan', 'QRスキャン'], ['list', '近くのユーザー']] as const).map(([m, label]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === m ? 'text-white border-b-2 border-violet-400' : 'text-white/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ARモード */}
      {mode === 'ar' && (
        <div className="flex-1 relative flex flex-col">
          {cameraError ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
              <p className="text-white/70 text-sm">{cameraError}</p>
              <Button variant="secondary" onClick={() => void startCamera()}>
                再試行
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="flex-1 w-full object-cover"
              />
              <div className="absolute inset-0 flex items-start justify-center pt-8 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-2">
                  <p className="text-white/70 text-xs text-center">
                    顔認識機能は準備中です
                  </p>
                  <p className="text-white/50 text-xs text-center mt-0.5">
                    QRスキャンまたはリストからユーザーを選択してください
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* QRスキャンモード */}
      {mode === 'scan' && (
        <div className="flex-1 flex flex-col">
          <div id="qr-reader" className="flex-1" />
          {!scanning && !scanResult && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-white/50 text-sm">カメラを起動中...</div>
            </div>
          )}

          {/* スキャン結果モーダル */}
          {scanResult && (
            <div className="absolute inset-0 bg-black/80 flex items-end z-20">
              <div className="w-full bg-white rounded-t-3xl p-6">
                <div className="flex justify-center mb-4">
                  <NumberBadge
                    numberValue={scanResult.number_value}
                    color={scanResult.color}
                    displayLevel={scanResult.meaning ? 4 : scanResult.category ? 3 : scanResult.nickname ? 2 : 1}
                    nickname={scanResult.nickname}
                    category={scanResult.category as NumberCategory | undefined}
                    meaning={scanResult.meaning}
                    size="md"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => navigate(`/users/${scanResult.user_id}`)}
                  >
                    詳細を見る
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={() => setScanResult(null)}
                  >
                    閉じる
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ユーザーリストモード */}
      {mode === 'list' && (
        <div className="flex-1 overflow-y-auto bg-white">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-4">
              <p className="text-4xl">🔍</p>
              <p className="text-gray-500 text-sm">
                近くにユーザーが見つかりません。
                同じ学年・クラスのユーザーが表示されます。
              </p>
            </div>
          ) : (
            <div className="px-4 py-4 flex flex-col gap-3">
              <p className="text-sm text-gray-500">{users.length}人が近くにいます</p>
              {users.map(({ profile, number }) => (
                <button
                  key={profile.id}
                  onClick={() => navigate(`/users/${profile.id}`)}
                  className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-left active:bg-gray-50"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: number.color }}
                  >
                    <span className="text-2xl font-black text-white">{number.number_value}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {number.display_level >= 2 ? (
                      <p className="font-semibold text-gray-900 truncate">{profile.nickname}</p>
                    ) : (
                      <p className="font-semibold text-gray-400">???</p>
                    )}
                    {profile.grade && (
                      <p className="text-xs text-gray-400">
                        {profile.grade}年{profile.class ? ` ${profile.class}` : ''}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-300">›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
