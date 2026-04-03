import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSong } from '../hooks/useSong';
import { useSongs } from '../hooks/useSongs';
import { ChordSheet } from '../components/chord/ChordSheet';
import { SmartEditor } from '../components/song/SmartEditor';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'];

type EditorMode = 'smart' | 'raw';

export function SongEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const { song, loading } = useSong(isNew ? undefined : id);
  const { createSong, updateSong } = useSongs();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [originalKey, setOriginalKey] = useState('C');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('smart');
  // モード切替 or 曲読み込み時に SmartEditor を再初期化するためのキー
  const [smartKey, setSmartKey] = useState(0);
  const songInitialized = useRef(false);

  useEffect(() => {
    if (song && !songInitialized.current) {
      songInitialized.current = true;
      setTitle(song.title);
      setArtist(song.artist);
      setOriginalKey(song.original_key);
      setContent(song.content);
      // 曲データ読み込み後に SmartEditor を正しい内容で初期化
      setSmartKey(k => k + 1);
    }
  }, [song]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    const input = { title, artist, original_key: originalKey, content };
    if (isNew) {
      const created = await createSong(input);
      if (created) {
        navigate(`/songs/${created.id}`, { replace: true });
      } else {
        setError('保存に失敗しました');
      }
    } else {
      const updated = await updateSong(id!, input);
      if (updated) {
        navigate(`/songs/${id}`);
      } else {
        setError('保存に失敗しました');
      }
    }
    setSaving(false);
  }, [title, artist, originalKey, content, isNew, id, createSong, updateSong, navigate]);

  if (!isNew && loading) {
    return <div className="py-12 text-center text-gray-400">読み込み中...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{isNew ? '新しい曲' : '編集'}</h1>
        <div className="flex gap-2">
          <Link to={isNew ? '/library' : `/songs/${id}`}>
            <Button variant="ghost">キャンセル</Button>
          </Link>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Meta fields */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          label="タイトル"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="曲のタイトル"
        />
        <Input
          label="アーティスト"
          value={artist}
          onChange={e => setArtist(e.target.value)}
          placeholder="アーティスト名"
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">キー</label>
          <select
            value={originalKey}
            onChange={e => setOriginalKey(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-0 rounded-lg border border-gray-200 bg-gray-100 p-0.5 w-fit">
        <button
          onClick={() => {
            if (editorMode !== 'smart') {
              setSmartKey(k => k + 1); // 直接入力→かんたん入力 のときだけ再初期化
              setEditorMode('smart');
            }
          }}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            editorMode === 'smart'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          かんたん入力
        </button>
        <button
          onClick={() => setEditorMode('raw')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            editorMode === 'raw'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          直接入力
        </button>
      </div>

      {/* Smart Editor */}
      {editorMode === 'smart' && (
        <SmartEditor
          key={smartKey}
          initialContent={content}
          onChange={setContent}
        />
      )}

      {/* Raw Editor + Preview */}
      {editorMode === 'raw' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">コードシート</label>
              <span className="text-xs text-gray-400">例: [Am]歌詞 [F]歌詞</span>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="h-[60vh] min-h-[300px] w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">プレビュー</label>
            <div className="min-h-[300px] rounded-md border border-gray-200 bg-white p-4">
              <ChordSheet content={content} transposeSteps={0} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
