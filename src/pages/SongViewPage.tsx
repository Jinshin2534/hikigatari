import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSong } from '../hooks/useSong';
import { useSongs } from '../hooks/useSongs';
import { ChordSheet } from '../components/chord/ChordSheet';
import { ChordDiagramBar } from '../components/chord/ChordDiagramBar';
import { TransposeControl } from '../components/song/TransposeControl';
import { Button } from '../components/ui/Button';
import { parseChordPro, transposeSong, extractChordNames, transposeKey } from '../lib/chordsheet';

export function SongViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { song, loading, error } = useSong(id);
  const { deleteSong } = useSongs();

  const [transposeSteps, setTransposeSteps] = useState(0);
  const [showDiagrams, setShowDiagrams] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const chordNames = useMemo(() => {
    if (!song?.content) return [];
    try {
      let parsed = parseChordPro(song.content);
      if (transposeSteps !== 0) parsed = transposeSong(parsed, transposeSteps);
      return extractChordNames(parsed);
    } catch {
      return [];
    }
  }, [song?.content, transposeSteps]);

  const currentKey = useMemo(() => {
    if (!song) return '';
    return transposeKey(song.original_key, transposeSteps);
  }, [song, transposeSteps]);

  const handleDelete = async () => {
    if (!id || !window.confirm('この曲を削除しますか？')) return;
    setDeleting(true);
    await deleteSong(id);
    navigate('/library');
  };

  if (loading) return <div className="py-12 text-center text-gray-400">読み込み中...</div>;
  if (error || !song) return <div className="py-12 text-center text-red-500">曲が見つかりません</div>;

  return (
    <div>
      {/* Song header */}
      <div className="mb-4">
        <div className="no-print mb-3 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/library" className="hover:text-violet-600">← 曲一覧</Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{song.title || '（タイトル未設定）'}</h1>
        {song.artist && <p className="mt-1 text-gray-500">{song.artist}</p>}
      </div>

      {/* Controls */}
      <div className="no-print mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
        <TransposeControl
          originalKey={song.original_key}
          currentKey={currentKey}
          steps={transposeSteps}
          onStepsChange={setTransposeSteps}
        />
        <div className="ml-auto flex gap-2">
          <Link to={`/songs/${id}/edit`}>
            <Button size="sm" variant="secondary">編集</Button>
          </Link>
          <Button size="sm" variant="secondary" onClick={() => window.print()}>
            印刷 / PDF
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete} disabled={deleting}>
            削除
          </Button>
        </div>
      </div>

      {/* Chord diagrams */}
      <ChordDiagramBar
        chordNames={chordNames}
        visible={showDiagrams}
        onToggle={() => setShowDiagrams(v => !v)}
      />

      {/* Sheet */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 print-only hidden">
          <h2 className="text-xl font-bold">{song.title}</h2>
          {song.artist && <p className="text-gray-600">{song.artist}</p>}
          <p className="text-sm text-gray-500">Key: {currentKey}</p>
        </div>
        <ChordSheet content={song.content} transposeSteps={transposeSteps} />
      </div>
    </div>
  );
}
