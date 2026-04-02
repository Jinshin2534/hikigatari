declare module 'vexchords' {
  interface ChordBoxOptions {
    width?: number;
    height?: number;
    defaultColor?: string;
    bgColor?: string;
    strokeColor?: string;
    textColor?: string;
    stringWidth?: number;
    fretWidth?: number;
    labelSize?: number;
    fretCount?: number;
    showTuning?: boolean;
  }

  interface DrawOptions {
    chord: [number, number | 'x'][];
    position?: number;
    barres?: { fromString: number; toString: number; fret: number }[];
    tuning?: string[];
  }

  export class ChordBox {
    constructor(element: HTMLElement, options?: ChordBoxOptions);
    draw(options: DrawOptions): void;
  }
}
