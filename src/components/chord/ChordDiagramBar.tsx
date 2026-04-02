import { ChordDiagram } from './ChordDiagram';

interface ChordDiagramBarProps {
  chordNames: string[];
  visible: boolean;
  onToggle: () => void;
}

export function ChordDiagramBar({ chordNames, visible, onToggle }: ChordDiagramBarProps) {
  return (
    <div className="no-print mb-4">
      <button
        onClick={onToggle}
        className="mb-2 flex items-center gap-1 text-sm text-violet-600 hover:text-violet-800"
      >
        <span>{visible ? '▼' : '▶'}</span>
        <span>コードダイアグラム {chordNames.length > 0 ? `(${chordNames.length})` : ''}</span>
      </button>
      {visible && chordNames.length > 0 && (
        <div className="flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-white p-4">
          {chordNames.map(name => (
            <ChordDiagram key={name} chordName={name} />
          ))}
        </div>
      )}
      {visible && chordNames.length === 0 && (
        <p className="text-sm text-gray-400">コードが検出されていません</p>
      )}
    </div>
  );
}
