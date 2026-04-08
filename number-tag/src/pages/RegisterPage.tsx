import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'account' | 'profile'>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [grade, setGrade] = useState('');
  const [classText, setClassText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccountStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('パスワードは6文字以上で設定してください');
      return;
    }
    setError('');
    setStep('profile');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }
    setError('');
    setLoading(true);

    const { error: signUpError } = await signUp(email, password);
    if (signUpError) {
      setError('登録に失敗しました。このメールアドレスはすでに使われているかもしれません。');
      setLoading(false);
      return;
    }

    // プロフィールを更新
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_profiles').upsert({
        id: user.id,
        nickname: nickname.trim(),
        grade: grade ? parseInt(grade) : null,
        class: classText.trim() || null,
      });
    }

    setLoading(false);
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-black text-violet-600">42</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">新規登録</h1>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className={`h-1.5 w-12 rounded-full ${step === 'account' ? 'bg-violet-600' : 'bg-violet-200'}`} />
            <div className={`h-1.5 w-12 rounded-full ${step === 'profile' ? 'bg-violet-600' : 'bg-gray-200'}`} />
          </div>
        </div>

        {step === 'account' ? (
          <form onSubmit={handleAccountStep} className="flex flex-col gap-4">
            <p className="text-sm text-gray-500 text-center">ステップ 1: アカウント情報</p>
            <Input
              label="メールアドレス"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="パスワード（6文字以上）"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              autoComplete="new-password"
            />
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" variant="primary" size="lg" fullWidth>
              次へ
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-gray-500 text-center">ステップ 2: プロフィール設定</p>
            <Input
              label="ニックネーム"
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="表示名を入力"
              required
              maxLength={20}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">学年（任意）</label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">選択してください</option>
                <option value="1">1年</option>
                <option value="2">2年</option>
                <option value="3">3年</option>
              </select>
            </div>
            <Input
              label="クラス（任意）"
              type="text"
              value={classText}
              onChange={e => setClassText(e.target.value)}
              placeholder="例: A組、5組"
              maxLength={10}
            />
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
              {loading ? '登録中...' : '登録する'}
            </Button>
            <Button type="button" variant="ghost" size="lg" fullWidth onClick={() => setStep('account')}>
              戻る
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          すでにアカウントをお持ちの方は{' '}
          <Link to="/login" className="text-violet-600 font-medium">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
