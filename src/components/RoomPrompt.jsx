import { useState } from 'react';
import { DoorOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Shown when the guest arrives without ?room=… (e.g. opened the link manually).
export default function RoomPrompt() {
  const { t, setRoom } = useApp();
  const [value, setValue] = useState('');
  const [invalid, setInvalid] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setInvalid(!setRoom(value));
  };

  return (
    <form onSubmit={onSubmit} className="card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center" noValidate>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy-900 text-amber-400 dark:bg-white/10">
        <DoorOpen className="h-6 w-6" aria-hidden />
      </span>
      <div className="flex-1">
        <h2 className="font-bold">{t('roomPrompt.title')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('roomPrompt.desc')}</p>
        {invalid && (
          <p role="alert" className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
            {t('roomPrompt.invalid')}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('roomPrompt.placeholder')}
          aria-label={t('roomPrompt.placeholder')}
          aria-invalid={invalid}
          className="min-h-[44px] w-32 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-navy-900"
        />
        <button type="submit" className="btn-gold">{t('roomPrompt.cta')}</button>
      </div>
    </form>
  );
}
