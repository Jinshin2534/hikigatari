import { CATEGORY_ICONS, CATEGORY_LABELS } from '../../types';
import type { NumberCategory } from '../../types';

interface NumberBadgeProps {
  numberValue: number;
  color: string;
  displayLevel?: 1 | 2 | 3 | 4;
  nickname?: string;
  category?: NumberCategory;
  meaning?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function NumberBadge({
  numberValue,
  color,
  displayLevel = 1,
  nickname,
  category,
  meaning,
  size = 'md',
}: NumberBadgeProps) {
  const sizeMap = {
    sm: { number: 'text-3xl', label: 'text-xs', padding: 'px-4 py-3' },
    md: { number: 'text-5xl', label: 'text-sm', padding: 'px-6 py-4' },
    lg: { number: 'text-8xl', label: 'text-base', padding: 'px-8 py-6' },
  };
  const s = sizeMap[size];

  return (
    <div
      className={`rounded-3xl ${s.padding} flex flex-col items-center gap-2 shadow-lg`}
      style={{ backgroundColor: color }}
    >
      <span className={`${s.number} font-black text-white leading-none`}>{numberValue}</span>
      {displayLevel >= 2 && nickname && (
        <span className={`${s.label} font-semibold text-white/90`}>{nickname}</span>
      )}
      {displayLevel >= 3 && category && (
        <span className={`${s.label} text-white/80`}>
          {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
        </span>
      )}
      {displayLevel >= 4 && meaning && (
        <span className={`${s.label} text-white/70 text-center`}>{meaning}</span>
      )}
    </div>
  );
}
