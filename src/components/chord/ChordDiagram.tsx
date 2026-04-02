import { useEffect, useRef } from 'react';
import { ChordBox } from 'vexchords';
import { CHORD_DATA } from '../../lib/chordData';

interface ChordDiagramProps {
  chordName: string;
}

export function ChordDiagram({ chordName }: ChordDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fingering = CHORD_DATA[chordName];

  useEffect(() => {
    if (!containerRef.current || !fingering) return;
    containerRef.current.innerHTML = '';
    const box = new ChordBox(containerRef.current, {
      width: 80,
      height: 90,
      defaultColor: '#374151',
      bgColor: 'transparent',
      strokeColor: '#374151',
      textColor: '#374151',
      stringWidth: 1.5,
      fretWidth: 1,
      labelSize: 0.35,
    });
    box.draw({
      chord: fingering.chord,
      position: fingering.position,
      barres: fingering.barres,
    });
  }, [chordName, fingering]);

  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[72px]">
      <div ref={containerRef} />
      <span className="text-xs font-semibold text-gray-700">{chordName}</span>
      {!fingering && (
        <div className="flex h-[90px] w-[80px] items-center justify-center rounded border border-dashed border-gray-300 text-xs text-gray-400">
          {chordName}
        </div>
      )}
    </div>
  );
}
