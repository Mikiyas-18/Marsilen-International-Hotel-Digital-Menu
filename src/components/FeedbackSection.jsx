import { useState } from 'react';
import { Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function FeedbackSection() {
  const { t, addFeedback, notify, qr } = useApp();
  const { guest, visitor } = useAuth();
  const known = guest ? `${guest.firstName} ${guest.lastName}` : visitor && !visitor.auto ? visitor.name : '';
  const [topic, setTopic] = useState('food');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!rating) {
      setError(true);
      return;
    }
    addFeedback({
      rating,
      topic,
      name: (known || name).trim(),
      comment: comment.trim(),
      place: guest?.room ? `room ${guest.room}` : qr ? `${qr.type} ${qr.id}` : '',
    });
    setRating(0);
    setTopic('food');
    setName('');
    setComment('');
    setError(false);
    notify(t('fb.thanks'));
  };

  const shown = hover || rating;
  const field =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-navy-800';

  return (
    <section id="feedback" aria-labelledby="fb-title" className="mx-auto mt-14 max-w-xl scroll-mt-20">
      <div className="text-center">
        <h2 id="fb-title" className="font-serif text-3xl font-bold tracking-tight">{t('fb.title')}</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{t('fb.sub')}</p>
      </div>

      <form onSubmit={submit} className="card mt-6 space-y-4 p-5" noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t('fb.rating')}</legend>
          <div className="flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={t('fb.star', { n })}
                aria-pressed={rating === n}
                onClick={() => { setRating(n); setError(false); }}
                onMouseEnter={() => setHover(n)}
                className="grid h-11 w-11 place-items-center rounded-xl transition active:scale-90"
              >
                <Star
                  className={`h-8 w-8 transition ${n <= shown ? 'fill-brass text-brass' : 'text-slate-300 dark:text-slate-600'}`}
                  aria-hidden
                />
              </button>
            ))}
          </div>
          {error && <p role="alert" className="mt-2 text-center text-sm text-red-600 dark:text-red-400">{t('fb.pickRating')}</p>}
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t('fb.topic')}</legend>
          <div role="radiogroup" className="flex flex-wrap gap-2">
            {['food', 'service', 'other'].map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={topic === k}
                onClick={() => setTopic(k)}
                className={`chip ${topic === k ? 'chip-on' : 'chip-off'}`}
              >
                {t(`fb.topic.${k}`)}
              </button>
            ))}
          </div>
        </fieldset>

        {!known && (
          <label className="block text-sm font-semibold">
            {t('fb.name')}
            <input
              type="text"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              className={`${field} mt-1 font-normal`}
            />
          </label>
        )}

        <label className="block text-sm font-semibold">
          {t('fb.comment')}
          <textarea
            rows={4}
            value={comment}
            maxLength={600}
            placeholder={t('fb.commentPh')}
            onChange={(e) => setComment(e.target.value)}
            className={`${field} mt-1 resize-y font-normal`}
          />
        </label>

        <button
          type="submit"
          className="btn w-full rounded-full bg-royal text-white hover:bg-royal-800 dark:bg-brass dark:text-royal"
        >
          {t('fb.submit')}
        </button>
      </form>
    </section>
  );
}
