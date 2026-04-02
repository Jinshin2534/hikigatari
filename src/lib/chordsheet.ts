import {
  ChordProParser,
  ChordProFormatter,
  HtmlDivFormatter,
  ChordLyricsPair,
  Chord,
} from 'chordsheetjs';
import type { Song } from 'chordsheetjs';

export function parseChordPro(content: string): Song {
  const parser = new ChordProParser();
  return parser.parse(content);
}

export function transposeSong(song: Song, steps: number): Song {
  return song.transpose(steps);
}

export function formatToHtml(song: Song): string {
  const formatter = new HtmlDivFormatter();
  return formatter.format(song);
}

export function formatToChordPro(song: Song): string {
  const formatter = new ChordProFormatter();
  return formatter.format(song);
}

export function extractChordNames(song: Song): string[] {
  const chords = new Set<string>();
  for (const line of song.lines) {
    for (const item of line.items) {
      if (item instanceof ChordLyricsPair && item.chords) {
        const name = item.chords.trim();
        if (name) {
          // ChordSheetJS が小文字で返す場合に備えて先頭を大文字に正規化
          const normalized = name.charAt(0).toUpperCase() + name.slice(1);
          chords.add(normalized);
        }
      }
    }
  }
  return Array.from(chords);
}

export function transposeKey(key: string, steps: number): string {
  if (steps === 0) return key;
  try {
    const chord = Chord.parse(key);
    if (!chord) return key;
    return chord.transpose(steps).toString();
  } catch {
    return key;
  }
}
