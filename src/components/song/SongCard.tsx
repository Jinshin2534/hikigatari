import { Link } from 'react-router-dom';
import type { Song } from '../../types';

interface SongCardProps {
  song: Song;
}

export function SongCard({ song }: SongCardProps) {
  return (
    <Link
      to={`/songs/${song.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <h3 className="font-semibold text-gray-900 truncate">{song.title || '（タイトル未設定）'}</h3>
      {song.artist && <p className="mt-0.5 text-sm text-gray-500 truncate">{song.artist}</p>}
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-block rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
          {song.original_key}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(song.updated_at).toLocaleDateString('ja-JP')}
        </span>
      </div>
    </Link>
  );
}
