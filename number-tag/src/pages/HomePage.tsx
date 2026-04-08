import { Link } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useMyNumber } from '../hooks/useMyNumber';
import { NumberBadge } from '../components/number/NumberBadge';
import { EventBanner } from '../components/event/EventBanner';
import { Button } from '../components/ui/Button';

export function HomePage() {
  const { profile, loading: profileLoading } = useProfile();
  const { number, loading: numberLoading } = useMyNumber();
  const loading = profileLoading || numberLoading;

  return (
    <div className="flex flex-col min-h-full px-4 pt-8 pb-4">
      {/* ヘッダー */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">こんにちは</p>
        <h1 className="text-2xl font-bold text-gray-900">
          {loading ? '...' : (profile?.nickname || 'ゲスト')} さん
        </h1>
      </div>

      {/* イベントバナー */}
      <EventBanner />

      {/* 自分の数字 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {loading ? (
          <div className="w-40 h-40 bg-gray-100 rounded-3xl animate-pulse" />
        ) : number ? (
          <>
            <NumberBadge
              numberValue={number.number_value}
              color={number.color}
              displayLevel={number.display_level}
              nickname={profile?.nickname}
              category={number.category as import('../types').NumberCategory}
              meaning={number.meaning}
              size="lg"
            />
            <p className="text-xs text-gray-400">
              公開レベル {number.display_level} ・ {number.is_public ? '公開中' : '非公開'}
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="w-40 h-40 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-6xl text-gray-300 font-black">?</span>
            </div>
            <p className="text-gray-500 text-sm">数字をまだ設定していません</p>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col gap-3 mt-6">
        <Link to="/number/set">
          <Button variant="primary" size="lg" fullWidth>
            {number ? '数字を変更する' : '数字を設定する'}
          </Button>
        </Link>
        <div className="flex gap-3">
          <Link to="/camera" className="flex-1">
            <Button variant="secondary" size="lg" fullWidth>
              カメラを起動
            </Button>
          </Link>
          <Link to="/qr" className="flex-1">
            <Button variant="secondary" size="lg" fullWidth>
              QRコード
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
