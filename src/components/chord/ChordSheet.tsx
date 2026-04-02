import { useMemo } from 'react';
import { parseChordPro, transposeSong, formatToHtml } from '../../lib/chordsheet';

interface ChordSheetProps {
  content: string;
  transposeSteps: number;
}

export function ChordSheet({ content, transposeSteps }: ChordSheetProps) {
  const html = useMemo(() => {
    if (!content.trim()) return '';
    try {
      let song = parseChordPro(content);
      if (transposeSteps !== 0) {
        song = transposeSong(song, transposeSteps);
      }
      return formatToHtml(song);
    } catch {
      return `<pre>${content}</pre>`;
    }
  }, [content, transposeSteps]);

  if (!html) {
    return (
      <div className="text-gray-400 text-sm py-8 text-center">
        コードと歌詞を入力すると、ここにプレビューが表示されます
      </div>
    );
  }

  return (
    <div
      className="chord-sheet"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
