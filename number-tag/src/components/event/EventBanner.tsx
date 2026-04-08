import { useActiveEvent } from '../../hooks/useActiveEvent';

export function EventBanner() {
  const { event, loading } = useActiveEvent();

  if (loading || !event) return null;

  return (
    <div className="mx-4 mb-4 bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-xl">🎉</span>
        <div>
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide">今日のテーマ</p>
          <p className="font-semibold text-violet-900">{event.title}</p>
          {event.description && (
            <p className="text-xs text-violet-600 mt-0.5">{event.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
