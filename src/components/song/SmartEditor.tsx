import { useState, useRef, useMemo, useCallback } from 'react';
import { Button } from '../ui/Button';

// ---- types ----

interface ChordPlacement {
  pos: number;
  chord: string;
}

interface LineDatum {
  text: string;
  chords: ChordPlacement[];
}

// ---- helpers ----

function splitChars(text: string): string[] {
  return Array.from(text);
}

function isWide(char: string): boolean {
  return /[\u1100-\u115F\u2E80-\u303F\u3040-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uAC00-\uD7AF\uF900-\uFAFF\uFE10-\uFE1F\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/.test(char);
}

function charWidth(char: string): string {
  return isWide(char) ? '1.5rem' : '0.9rem';
}

// コンテンツから使われているコードを出現順に抽出して進行を復元
function extractProgressionFromContent(content: string): string[] {
  if (!content.trim()) return ['Am', 'F', 'C', 'G'];
  const lines = parseToLinesInternal(content);
  const seen = new Set<string>();
  const progression: string[] = [];
  for (const line of lines) {
    for (const { chord } of [...line.chords].sort((a, b) => a.pos - b.pos)) {
      if (!seen.has(chord)) {
        seen.add(chord);
        progression.push(chord);
      }
    }
  }
  return progression.length > 0 ? progression : ['Am', 'F', 'C', 'G'];
}

function parseToLinesInternal(content: string): LineDatum[] {
  if (!content.trim()) return [{ text: '', chords: [] }];
  return content.split('\n').map(line => {
    const chords: ChordPlacement[] = [];
    let text = '';
    let i = 0;
    while (i < line.length) {
      if (line[i] === '[') {
        const end = line.indexOf(']', i);
        if (end !== -1) {
          const chord = line.slice(i + 1, end);
          if (chord) chords.push({ pos: splitChars(text).length, chord });
          i = end + 1;
          continue;
        }
      }
      text += line[i];
      i++;
    }
    return { text, chords };
  });
}

export function parseToLines(content: string): LineDatum[] {
  return parseToLinesInternal(content);
}

export function toChordPro(lines: LineDatum[]): string {
  return lines
    .map(line => {
      if (!line.text && line.chords.length === 0) return '';
      const chars = splitChars(line.text);
      const sorted = [...line.chords].sort((a, b) => a.pos - b.pos);
      let result = '';
      let lastPos = 0;
      for (const { pos, chord } of sorted) {
        result += chars.slice(lastPos, pos).join('') + `[${chord}]`;
        lastPos = pos;
      }
      result += chars.slice(lastPos).join('');
      return result;
    })
    .join('\n');
}

// ---- ChordLineEditor ----

interface ChordLineEditorProps {
  line: LineDatum;
  onChange: (line: LineDatum) => void;
  nextChord: string;
  onNextChordUsed: () => void;
}

function ChordLineEditor({ line, onChange, nextChord, onNextChordUsed }: ChordLineEditorProps) {
  const chars = useMemo(() => splitChars(line.text), [line.text]);

  const chordAtPos = (pos: number) => line.chords.find(c => c.pos === pos);

  const handleCharClick = (pos: number) => {
    const existing = chordAtPos(pos);
    if (existing) {
      // クリックで削除
      onChange({ ...line, chords: line.chords.filter(c => c.pos !== pos) });
    } else {
      // 次のコードを配置
      onChange({ ...line, chords: [...line.chords, { pos, chord: nextChord }] });
      onNextChordUsed();
    }
  };

  if (!line.text) return null;

  return (
    <div className="mb-3 overflow-x-auto">
      <div className="inline-flex flex-col font-mono text-sm">
        {/* コード行 */}
        <div className="flex h-5 items-end">
          {chars.map((char, i) => {
            const c = chordAtPos(i);
            return (
              <div
                key={i}
                className="relative flex-shrink-0 text-center"
                style={{ minWidth: charWidth(char) }}
              >
                {c && (
                  <span
                    className="absolute bottom-0 left-0 text-xs font-bold text-violet-600 whitespace-nowrap cursor-pointer hover:text-red-500"
                    title="クリックで削除"
                    onClick={() => onChange({ ...line, chords: line.chords.filter(p => p.pos !== i) })}
                  >
                    {c.chord}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {/* 歌詞行 */}
        <div className="flex">
          {chars.map((char, i) => {
            const hasChord = !!chordAtPos(i);
            return (
              <div
                key={i}
                className={`flex-shrink-0 text-center cursor-pointer select-none rounded-sm
                  ${hasChord ? 'bg-violet-100' : 'hover:bg-violet-50'}`}
                style={{ minWidth: charWidth(char) }}
                onClick={() => handleCharClick(i)}
                title={hasChord ? 'クリックで削除' : `ここに [${nextChord}] を配置`}
              >
                {char}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- SmartEditor ----

interface SmartEditorProps {
  initialContent: string;
  onChange: (chordProContent: string) => void;
}

export function SmartEditor({ initialContent, onChange }: SmartEditorProps) {
  const [progression, setProgression] = useState<string[]>(() =>
    extractProgressionFromContent(initialContent)
  );
  const [newChordInput, setNewChordInput] = useState('');
  const [lines, setLines] = useState<LineDatum[]>(() => parseToLines(initialContent));
  const [chordsPerLine, setChordsPerLine] = useState(2);
  const [progIndex, setProgIndex] = useState(0);

  const nextChord = progression.length > 0 ? progression[progIndex % progression.length] : '';

  const handleLinesChange = useCallback((newLines: LineDatum[]) => {
    setLines(newLines);
    onChange(toChordPro(newLines));
  }, [onChange]);

  const handleLineChange = useCallback((index: number, line: LineDatum) => {
    setLines(prev => {
      const next = prev.map((l, i) => (i === index ? line : l));
      onChange(toChordPro(next));
      return next;
    });
  }, [onChange]);

  // 歌詞テキスト編集（プレーンテキスト）
  const [lyricsText, setLyricsText] = useState(() => lines.map(l => l.text).join('\n'));
  const composing = useRef(false);

  const commitLyricsChange = useCallback((text: string) => {
    const newLineTexts = text.split('\n');
    const newLines: LineDatum[] = newLineTexts.map((t, i) => {
      const existing = lines[i];
      if (existing && existing.text === t) return existing;
      return { text: t, chords: [] };
    });
    handleLinesChange(newLines);
  }, [lines, handleLinesChange]);

  const handleLyricsChange = (text: string) => {
    setLyricsText(text);
    if (!composing.current) {
      commitLyricsChange(text);
    }
  };

  // 自動配置
  const autoPlace = () => {
    if (!progression.length) return;
    let idx = 0;
    const newLines = lines.map(line => {
      if (!line.text) return line;
      const chars = splitChars(line.text);
      const n = Math.min(chordsPerLine, chars.length);
      const chords: ChordPlacement[] = Array.from({ length: n }, (_, i) => ({
        pos: Math.floor(i * chars.length / n),
        chord: progression[idx++ % progression.length],
      }));
      return { ...line, chords };
    });
    handleLinesChange(newLines);
    setProgIndex(idx);
  };

  // コードを全削除
  const clearAllChords = () => {
    handleLinesChange(lines.map(l => ({ ...l, chords: [] })));
    setProgIndex(0);
  };

  // 進行にコード追加
  const addChordToProgression = () => {
    const trimmed = newChordInput.trim();
    if (!trimmed) return;
    const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    setProgression(prev => [...prev, normalized]);
    setNewChordInput('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* コード進行 */}
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">コード進行:</span>
          {progression.map((chord, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-sm font-mono font-bold
                ${i === progIndex % progression.length
                  ? 'bg-violet-600 text-white'
                  : 'bg-violet-100 text-violet-700'}`}
            >
              {chord}
              <button
                className="opacity-60 hover:opacity-100 text-xs"
                onClick={() => setProgression(prev => prev.filter((_, j) => j !== i))}
              >×</button>
            </span>
          ))}
          {/* コード追加 */}
          <input
            className="w-16 rounded border border-gray-300 px-2 py-0.5 text-sm font-mono focus:border-violet-400 focus:outline-none"
            placeholder="追加"
            value={newChordInput}
            onChange={e => setNewChordInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addChordToProgression(); }}
          />
          <Button size="sm" variant="ghost" onClick={addChordToProgression}>＋</Button>
        </div>

        {/* 自動配置コントロール */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">1行あたり</span>
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => setChordsPerLine(n)}
              className={`w-7 h-7 rounded text-sm font-mono
                ${chordsPerLine === n ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              {n}
            </button>
          ))}
          <span className="text-sm text-gray-500">コード</span>
          <Button size="sm" variant="primary" onClick={autoPlace}>自動配置</Button>
          <Button size="sm" variant="ghost" onClick={clearAllChords}>コードをリセット</Button>
          <Button size="sm" variant="ghost" onClick={() => setProgIndex(0)}>
            進行をリセット（現在: {nextChord}）
          </Button>
        </div>
      </div>

      {/* 歌詞入力 + コード配置 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 左: 歌詞テキスト入力 */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            歌詞（1行ずつ入力）
          </label>
          <textarea
            className="h-64 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder={"こうしてふたりいるだけで\nそっとそっとそばにいたくて"}
            value={lyricsText}
            onChange={e => handleLyricsChange(e.target.value)}
            onCompositionStart={() => { composing.current = true; }}
            onCompositionEnd={e => {
              composing.current = false;
              commitLyricsChange((e.target as HTMLTextAreaElement).value);
            }}
          />
          <p className="text-xs text-gray-400">歌詞を入力して右側で文字をクリックしてコードを配置</p>
        </div>

        {/* 右: コード配置エディタ */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">コード配置</label>
            <span className="text-xs text-gray-400">
              次のコード: <span className="font-bold text-violet-600">{nextChord}</span>
            </span>
          </div>
          <div className="min-h-64 rounded-md border border-gray-200 bg-white p-3">
            {lines.every(l => !l.text) ? (
              <p className="text-sm text-gray-400">歌詞を入力すると、ここに表示されます</p>
            ) : (
              lines.map((line, i) => (
                <ChordLineEditor
                  key={i}
                  line={line}
                  onChange={updated => handleLineChange(i, updated)}
                  nextChord={nextChord}
                  onNextChordUsed={() => setProgIndex(p => p + 1)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
