import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Stars = ({ value }) => (
  <span className="inline-flex" role="img" aria-label={`${value} / 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`h-4 w-4 ${n <= value ? 'fill-brass text-brass' : 'text-slate-300 dark:text-slate-600'}`} aria-hidden />
    ))}
  </span>
);

export default function FeedbackTab() {
  const { t, feedback, removeFeedback, lang } = useApp();
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? feedback : feedback.filter((f) => (f.topic || 'other') === filter);
  const avg = feedback.length ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length : 0;
  const when = (ts) => new Date(ts).toLocaleString(lang === 'am' ? 'am-ET' : undefined, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="card p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('admin.fb.avg')}</dt>
          <dd className="mt-1 text-2xl font-extrabold tabular-nums text-gold">{feedback.length ? avg.toFixed(1) : '–'}</dd>
        </div>
        <div className="card p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('admin.fb.count')}</dt>
          <dd className="mt-1 text-2xl font-extrabold tabular-nums text-gold">{feedback.length}</dd>
        </div>
      </dl>

      <div role="group" className="flex flex-wrap gap-2">
        {['all', 'food', 'service', 'other'].map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={filter === k}
            onClick={() => setFilter(k)}
            className={`chip ${filter === k ? 'chip-on' : 'chip-off'}`}
          >
            {k === 'all' ? t('admin.fb.all') : t(`fb.topic.${k}`)}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="card p-8 text-center text-slate-500 dark:text-slate-400">{t('admin.fb.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((f) => (
            <li key={f.id} className="card flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars value={f.rating} />
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold dark:bg-white/10">
                    {t(`fb.topic.${f.topic || 'other'}`)}
                  </span>
                  <span className="text-sm font-semibold">{f.name || t('fb.anon')}</span>
                  {f.place && <span className="text-xs text-slate-500 dark:text-slate-400">{f.place}</span>}
                  <span className="text-xs text-slate-500 dark:text-slate-400">{when(f.createdAt)}</span>
                </div>
                {f.comment && <p className="mt-2 whitespace-pre-line break-words text-sm">{f.comment}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeFeedback(f.id)}
                aria-label={t('admin.fb.delete')}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
