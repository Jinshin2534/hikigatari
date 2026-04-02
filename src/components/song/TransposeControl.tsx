import { Button } from '../ui/Button';

interface TransposeControlProps {
  originalKey: string;
  currentKey: string;
  steps: number;
  onStepsChange: (steps: number) => void;
}

export function TransposeControl({ originalKey, currentKey, steps, onStepsChange }: TransposeControlProps) {
  return (
    <div className="no-print flex items-center gap-2">
      <span className="text-sm text-gray-500">転調:</span>
      <Button size="sm" variant="secondary" onClick={() => onStepsChange(steps - 1)}>−</Button>
      <div className="min-w-[80px] text-center">
        <span className="font-mono font-bold text-violet-700">{currentKey || originalKey}</span>
        {steps !== 0 && (
          <span className="ml-1 text-xs text-gray-400">
            ({steps > 0 ? '+' : ''}{steps})
          </span>
        )}
      </div>
      <Button size="sm" variant="secondary" onClick={() => onStepsChange(steps + 1)}>＋</Button>
      {steps !== 0 && (
        <Button size="sm" variant="ghost" onClick={() => onStepsChange(0)}>
          リセット
        </Button>
      )}
    </div>
  );
}
