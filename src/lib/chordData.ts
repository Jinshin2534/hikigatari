export interface ChordFingering {
  chord: [number, number | 'x'][];
  position?: number;
  barres?: { fromString: number; toString: number; fret: number }[];
  tuning?: string[];
}

// String numbering: 1=high e, 6=low E
// Fret 0 = open string, 'x' = muted
export const CHORD_DATA: Record<string, ChordFingering> = {
  // Major chords
  C: { chord: [[1, 0], [2, 1], [3, 0], [4, 2], [5, 3], [6, 'x']] },
  D: { chord: [[1, 2], [2, 3], [3, 2], [4, 0], [5, 'x'], [6, 'x']] },
  E: { chord: [[1, 0], [2, 0], [3, 1], [4, 2], [5, 2], [6, 0]] },
  F: {
    chord: [[1, 1], [2, 1], [3, 2], [4, 3], [5, 3], [6, 1]],
    barres: [{ fromString: 6, toString: 1, fret: 1 }],
  },
  G: { chord: [[1, 3], [2, 3], [3, 0], [4, 0], [5, 2], [6, 3]] },
  A: { chord: [[1, 0], [2, 2], [3, 2], [4, 2], [5, 0], [6, 'x']] },
  B: {
    chord: [[1, 2], [2, 4], [3, 4], [4, 4], [5, 2], [6, 'x']],
    barres: [{ fromString: 5, toString: 1, fret: 2 }],
  },

  // Minor chords
  Am: { chord: [[1, 0], [2, 1], [3, 2], [4, 2], [5, 0], [6, 'x']] },
  Bm: {
    chord: [[1, 2], [2, 3], [3, 4], [4, 4], [5, 2], [6, 'x']],
    barres: [{ fromString: 5, toString: 1, fret: 2 }],
  },
  Cm: {
    chord: [[1, 3], [2, 4], [3, 5], [4, 5], [5, 3], [6, 'x']],
    position: 3,
    barres: [{ fromString: 5, toString: 1, fret: 3 }],
  },
  Dm: { chord: [[1, 1], [2, 3], [3, 2], [4, 0], [5, 'x'], [6, 'x']] },
  Em: { chord: [[1, 0], [2, 0], [3, 0], [4, 2], [5, 2], [6, 0]] },
  Fm: {
    chord: [[1, 1], [2, 1], [3, 1], [4, 3], [5, 3], [6, 1]],
    barres: [{ fromString: 6, toString: 1, fret: 1 }],
  },
  Gm: {
    chord: [[1, 3], [2, 3], [3, 3], [4, 5], [5, 5], [6, 3]],
    position: 3,
    barres: [{ fromString: 6, toString: 1, fret: 3 }],
  },

  // 7th chords
  C7: { chord: [[1, 0], [2, 1], [3, 3], [4, 2], [5, 3], [6, 'x']] },
  D7: { chord: [[1, 2], [2, 1], [3, 2], [4, 0], [5, 'x'], [6, 'x']] },
  E7: { chord: [[1, 0], [2, 0], [3, 1], [4, 0], [5, 2], [6, 0]] },
  F7: {
    chord: [[1, 1], [2, 1], [3, 2], [4, 1], [5, 3], [6, 1]],
    barres: [{ fromString: 6, toString: 1, fret: 1 }],
  },
  G7: { chord: [[1, 1], [2, 0], [3, 0], [4, 0], [5, 2], [6, 3]] },
  A7: { chord: [[1, 0], [2, 2], [3, 0], [4, 2], [5, 0], [6, 'x']] },
  B7: { chord: [[1, 2], [2, 0], [3, 2], [4, 1], [5, 2], [6, 'x']] },

  // Minor 7th chords
  Am7: { chord: [[1, 0], [2, 1], [3, 0], [4, 2], [5, 0], [6, 'x']] },
  Bm7: {
    chord: [[1, 2], [2, 3], [3, 2], [4, 4], [5, 2], [6, 'x']],
    barres: [{ fromString: 5, toString: 1, fret: 2 }],
  },
  Dm7: { chord: [[1, 1], [2, 1], [3, 2], [4, 0], [5, 'x'], [6, 'x']] },
  Em7: { chord: [[1, 0], [2, 0], [3, 0], [4, 0], [5, 2], [6, 0]] },

  // Major 7th chords
  Cmaj7: { chord: [[1, 0], [2, 0], [3, 0], [4, 2], [5, 3], [6, 'x']] },
  Dmaj7: { chord: [[1, 2], [2, 2], [3, 2], [4, 0], [5, 'x'], [6, 'x']] },
  Emaj7: { chord: [[1, 0], [2, 0], [3, 1], [4, 1], [5, 2], [6, 0]] },
  Fmaj7: { chord: [[1, 0], [2, 1], [3, 2], [4, 3], [5, 3], [6, 'x']] },
  Gmaj7: { chord: [[1, 2], [2, 3], [3, 0], [4, 0], [5, 2], [6, 3]] },
  Amaj7: { chord: [[1, 0], [2, 2], [3, 1], [4, 2], [5, 0], [6, 'x']] },

  // Suspended chords
  Csus2: { chord: [[1, 0], [2, 1], [3, 0], [4, 2], [5, 3], [6, 'x']] },
  Dsus2: { chord: [[1, 0], [2, 3], [3, 2], [4, 0], [5, 'x'], [6, 'x']] },
  Dsus4: { chord: [[1, 3], [2, 3], [3, 2], [4, 0], [5, 'x'], [6, 'x']] },
  Esus4: { chord: [[1, 0], [2, 0], [3, 2], [4, 2], [5, 2], [6, 0]] },
  Gsus4: { chord: [[1, 3], [2, 1], [3, 0], [4, 0], [5, 2], [6, 3]] },
  Asus2: { chord: [[1, 0], [2, 0], [3, 2], [4, 2], [5, 0], [6, 'x']] },
  Asus4: { chord: [[1, 0], [2, 3], [3, 2], [4, 2], [5, 0], [6, 'x']] },

  // Add9
  Cadd9: { chord: [[1, 0], [2, 3], [3, 0], [4, 2], [5, 3], [6, 'x']] },
  Dadd9: { chord: [[1, 0], [2, 3], [3, 2], [4, 0], [5, 'x'], [6, 'x']] },
  Gadd9: { chord: [[1, 0], [2, 3], [3, 0], [4, 0], [5, 2], [6, 3]] },
};
