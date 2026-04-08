import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyNumber } from '../hooks/useMyNumber';
import { useProfile } from '../hooks/useProfile';
import { NumberBadge } from '../components/number/NumberBadge';
import { Button } from '../components/ui/Button';
import { CATEGORY_ICONS, CATEGORY_LABELS, COLOR_PRESETS } from '../types';
import type { NumberCategory, NumberInput } from '../types';

const CATEGORIES: NumberCategory[] = ['sports', 'study', 'food', 'hobby', 'friends', 'other'];
const DISPLAY_LEVEL_LABELS = [
  { level: 1, label: '数字のみ', desc: '数字だけが見える' },
  { level: 2, label: '数字＋名前', desc: '数字とニックネームが見える' },
  { level: 3, label: '数字＋カテゴリ', desc: '数字、名前、カテゴリが見える' },
  { level: 4, label: '全部公開', desc: '数字の意味まで公開する' },
] as const;

export function NumberSetPage() {
  const navigate = useNavigate();
  const { number, upsertNumber } = useMyNumber();
  const { profile } = useProfile();
  const [step, setStep] = useState(1);
  const [numberValue, setNumberValue] = useState(number?.number_value?.toString() ?? '');
  const [color, setColor] = useState(number?.color ?? COLOR_PRESETS[0]);
  const [category, setCategory] = useState<NumberCategory>(
    (number?.category as NumberCategory) ?? 'other'
  );
  const [displayLevel, setDisplayLevel] = useState<1 | 2 | 3 | 4>(number?.display_level ?? 1);
  const [meaning, setMeaning] = useState(number?.meaning ?? '');
  const [isPublic, setIsPublic] = useState(number?.is_public ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const parsedNumber = parseInt(numberValue);
  const isValidNumber = !isNaN(parsedNumber) && parsedNumber >= 0 && parsedNumber <= 999;

  const handleSave = async () => {
    if (!isValidNumber) return;
    setSaving(true);
    const input: NumberInput = {
      number_value: parsedNumber,
      meaning: meaning.trim() || null,
      category,
      color,
      display_level: displayLevel,
      is_public: isPublic,
      event_id: null,
    };
    const { error } = await upsertNumber(input);
    setSaving(false);
    if (error) {
      setError('保存に失敗しました');
    } else {
      navigate('/');
    }
  };

  const previewLevel = displayLevel;

  return (
    <div className="flex flex-col min-h-full">
      {/* ヘッダー */}
      <div className="px-4 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} className="text-gray-500 text-sm">
            ← 戻る
          </button>
          <span className="text-sm text-gray-400">ステップ {step} / 3</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-violet-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col gap-6">
        {step === 1 && (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">数字を決めよう</h2>
              <p className="text-sm text-gray-500">0〜999の整数を入力してください</p>
            </div>
            <div className="flex flex-col items-center gap-6">
              <input
                type="number"
                min={0}
                max={999}
                value={numberValue}
                onChange={e => setNumberValue(e.target.value)}
                placeholder="42"
                className="w-48 text-center text-6xl font-black border-b-4 border-violet-600 bg-transparent focus:outline-none text-gray-900 py-2"
              />
              {numberValue && !isValidNumber && (
                <p className="text-sm text-red-500">0〜999の整数を入力してください</p>
              )}
              {isValidNumber && (
                <NumberBadge numberValue={parsedNumber} color={color} size="md" />
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">見た目を決めよう</h2>
              <p className="text-sm text-gray-500">カラーとカテゴリを選んでください</p>
            </div>

            {/* カラー選択 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">カラー</p>
              <div className="grid grid-cols-6 gap-3">
                {COLOR_PRESETS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-xl border-2 transition-transform ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* カテゴリ選択 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">カテゴリ</p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm transition-colors ${
                      category === cat ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
                    <span className="text-xs">{CATEGORY_LABELS[cat]}</span>
                  </button>
                ))}
              </div>
            </div>

            {isValidNumber && (
              <div className="flex justify-center">
                <NumberBadge numberValue={parsedNumber} color={color} category={category} displayLevel={3} size="md" />
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">公開設定</h2>
              <p className="text-sm text-gray-500">どこまで見せるかを決めてください</p>
            </div>

            {/* 意味の入力 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">数字の意味（任意）</p>
              <input
                type="text"
                value={meaning}
                onChange={e => setMeaning(e.target.value)}
                placeholder="例：行った国の数"
                maxLength={50}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <p className="text-xs text-gray-400 mt-1">レベル4でのみ表示されます</p>
            </div>

            {/* 公開レベル選択 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">公開レベル</p>
              <div className="flex flex-col gap-2">
                {DISPLAY_LEVEL_LABELS.map(({ level, label, desc }) => (
                  <button
                    key={level}
                    onClick={() => setDisplayLevel(level)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                      displayLevel === level ? 'border-violet-600 bg-violet-50' : 'border-gray-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      displayLevel === level ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {level}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 公開/非公開 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">カメラに表示する</p>
                <p className="text-xs text-gray-500">オフにすると他の人のカメラに表示されません</p>
              </div>
              <button
                onClick={() => setIsPublic(v => !v)}
                className={`w-12 h-7 rounded-full transition-colors ${isPublic ? 'bg-violet-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-1 ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* プレビュー */}
            {isValidNumber && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">プレビュー</p>
                <div className="flex justify-center">
                  <NumberBadge
                    numberValue={parsedNumber}
                    color={color}
                    displayLevel={previewLevel}
                    nickname={profile?.nickname}
                    category={category}
                    meaning={meaning || null}
                    size="md"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </>
        )}
      </div>

      {/* フッターボタン */}
      <div className="px-4 pb-6">
        {step < 3 ? (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={step === 1 && !isValidNumber}
            onClick={() => setStep(s => s + 1)}
          >
            次へ
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isValidNumber || saving}
            onClick={handleSave}
          >
            {saving ? '保存中...' : '保存する'}
          </Button>
        )}
      </div>
    </div>
  );
}
