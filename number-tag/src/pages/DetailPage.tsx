import { useParams, useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useProfile';
import { useUserNumber } from '../hooks/useMyNumber';
import { NumberBadge } from '../components/number/NumberBadge';
import { Button } from '../components/ui/Button';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../types';
import type { NumberCategory } from '../types';

export function DetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile(userId);
  const { number, loading: numberLoading } = useUserNumber(userId);
  const loading = profileLoading || numberLoading;

  if (loading) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile || !number) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center px-4 text-center">
        <p className="text-gray-500 mb-4">ユーザーが見つかりませんでした</p>
        <Button onClick={() => navigate(-1)}>戻る</Button>
      </div>
    );
  }

  const level = number.display_level;
  const category = number.category as NumberCategory;

  return (
    <div className="flex flex-col min-h-full">
      {/* ヘッダー */}
      <div className="px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-sm mb-4 block">
          ← 戻る
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 gap-8">
        {/* 数字バッジ */}
        <NumberBadge
          numberValue={number.number_value}
          color={number.color}
          displayLevel={level}
          nickname={level >= 2 ? profile.nickname : undefined}
          category={level >= 3 ? category : undefined}
          meaning={level >= 4 ? number.meaning : undefined}
          size="lg"
        />

        {/* 詳細情報 */}
        <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="text-center">
            <span className="text-6xl font-black" style={{ color: number.color }}>
              {number.number_value}
            </span>
          </div>

          {level >= 2 && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <span className="text-violet-600 font-bold text-sm">
                  {profile.nickname.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400">ニックネーム</p>
                <p className="font-semibold text-gray-900">{profile.nickname}</p>
              </div>
            </div>
          )}

          {level >= 3 && (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
              <div>
                <p className="text-xs text-gray-400">カテゴリ</p>
                <p className="font-medium text-gray-900">{CATEGORY_LABELS[category]}</p>
              </div>
            </div>
          )}

          {level >= 4 && number.meaning && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">数字の意味</p>
              <p className="text-gray-900">{number.meaning}</p>
            </div>
          )}

          {level < 4 && (
            <p className="text-xs text-gray-400 text-center">
              詳細は本人に聞いてみよう！
            </p>
          )}
        </div>

        {profile.grade && (
          <p className="text-sm text-gray-400">
            {profile.grade}年{profile.class ? ` ${profile.class}` : ''}
          </p>
        )}
      </div>
    </div>
  );
}
