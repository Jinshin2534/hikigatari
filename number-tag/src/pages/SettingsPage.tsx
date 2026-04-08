import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function SettingsPage() {
  const { signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [grade, setGrade] = useState(profile?.grade?.toString() ?? '');
  const [classText, setClassText] = useState(profile?.class ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      nickname: nickname.trim(),
      grade: grade ? parseInt(grade) : null,
      class: classText.trim() || null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-full px-4 pt-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">設定</h1>

      {/* プロフィール編集 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">プロフィール</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="ニックネーム"
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="ニックネーム"
            maxLength={20}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">学年</label>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">未設定</option>
              <option value="1">1年</option>
              <option value="2">2年</option>
              <option value="3">3年</option>
            </select>
          </div>
          <Input
            label="クラス"
            type="text"
            value={classText}
            onChange={e => setClassText(e.target.value)}
            placeholder="例: A組、5組"
            maxLength={10}
          />
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saved ? '保存しました！' : saving ? '保存中...' : 'プロフィールを保存'}
          </Button>
        </form>
      </div>

      {/* アカウント設定 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">アカウント</h2>
        <Button variant="danger" size="md" onClick={handleSignOut}>
          ログアウト
        </Button>
      </div>

      {/* バージョン情報 */}
      <p className="text-center text-xs text-gray-400 mt-4">数字の名札 v0.1.0</p>
    </div>
  );
}
