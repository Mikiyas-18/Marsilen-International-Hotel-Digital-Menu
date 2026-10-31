import { useState } from 'react';
import { Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { DESKS, ROOM_NUMBERS, isTable } from '../../data/accounts';

function QrCard({ title, url }) {
  const { t } = useApp();
  return (
    <figure className="card flex break-inside-avoid flex-col items-center gap-2 p-4 text-center print:border print:bg-white print:text-black print:shadow-none">
      {/* QR codes are always dark-on-white so they scan in dark mode and print cleanly. */}
      <div className="rounded-xl bg-white p-2">
        <QRCodeSVG value={url} size={132} level="M" marginSize={1} />
      </div>
      <figcaption>
        <p className="font-bold">{title}</p>
        <p className="text-xs text-slate-500 print:text-black">{t('qr.scanTo')}</p>
        <a href={url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-[10px] text-slate-400 underline print:hidden">
          {url}
        </a>
      </figcaption>
    </figure>
  );
}

export default function QrTab() {
  const { t, loc } = useApp();
  const [base, setBase] = useState(() => window.location.origin);
  const cleanBase = base.replace(/\/+$/, '');
  const tables = DESKS.filter((d) => isTable(d.id));
  const places = DESKS.filter((d) => !isTable(d.id));

  return (
    <div className="space-y-8">
      <div className="card flex flex-wrap items-end justify-between gap-4 p-5 print:hidden">
        <div className="max-w-xl">
          <h2 className="text-lg font-bold">{t('admin.tab.qr')}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('qr.help')}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm font-semibold">
            {t('qr.baseUrl')}
            <input
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="mt-1.5 block min-h-[44px] w-64 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-navy-900"
            />
          </label>
          <button type="button" className="btn-gold" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden />
            {t('qr.print')}
          </button>
        </div>
      </div>

      <section aria-labelledby="qr-tables">
        <h3 id="qr-tables" className="mb-3 text-lg font-bold">{t('qr.tables')} <span className="text-sm font-medium text-slate-500">({tables.length})</span></h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {tables.map((d) => (
            <QrCard key={d.id} title={loc(d.name)} url={`${cleanBase}/menu?desk=${d.id}`} />
          ))}
        </div>
      </section>

      <section aria-labelledby="qr-rooms">
        <h3 id="qr-rooms" className="mb-3 text-lg font-bold">{t('qr.rooms')} <span className="text-sm font-medium text-slate-500">({ROOM_NUMBERS.length})</span></h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ROOM_NUMBERS.map((n) => (
            <QrCard key={n} title={t('header.room', { room: n })} url={`${cleanBase}/menu?room=${n}`} />
          ))}
        </div>
      </section>

      <section aria-labelledby="qr-places">
        <h3 id="qr-places" className="mb-3 text-lg font-bold">{t('qr.other')}</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {places.map((d) => (
            <QrCard key={d.id} title={loc(d.name)} url={`${cleanBase}/menu?desk=${d.id}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
