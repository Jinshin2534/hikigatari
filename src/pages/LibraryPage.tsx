import { Link } from 'react-router-dom';
import { useSongs } from '../hooks/useSongs';
import { SongCard } from '../components/song/SongCard';
import { Button } from '../components/ui/Button';

export function LibraryPage() {
  const { songs, loading, error } = useSongs();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">曲一覧</h1>
        <Link to="/songs/new">
          <Button variant="primary">＋ 新しい曲</Button>
        </Link>
      </div>

      {loading && (
        <div className="py-12 text-center text-gray-400">読み込み中...</div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {!loading && songs.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400">まだ曲がありません</p>
          <Link to="/songs/new" className="mt-3 inline-block">
            <Button variant="primary">最初の曲を作る</Button>
          </Link>
        </div>
      )}

      {songs.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {songs.map(song => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}
