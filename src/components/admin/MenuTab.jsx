import { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DIETARY_TAGS } from '../../data/mock';

const NEW_CATS = ['breakfast', 'main', 'drinks', 'desserts'];

// Shrinks the chosen photo so it fits in browser storage (max 640px wide, JPEG).
function fileToDataUrl(file, maxW = 640, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('bad image'));
    };
    img.src = url;
  });
}

// Change the photo of an existing food item or drink.
function ChangePhoto({ item, name }) {
  const { t, updateMenuItem, notify } = useApp();
  const ref = useRef(null);
  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      updateMenuItem(item.id, { img: await fileToDataUrl(file) });
      notify(t('menuAdmin.photoUpdated', { name }));
    } catch {
      notify(t('menuAdmin.badImage'));
    }
    e.target.value = '';
  };
  return (
    <>
      <input ref={ref} type="file" accept="image/*" onChange={onPick} className="sr-only" aria-label={`${t('menuAdmin.changePhoto')}: ${name}`} />
      <button type="button" onClick={() => ref.current?.click()} className="btn-ghost min-h-[40px] px-3 text-xs">
        <ImagePlus className="h-4 w-4" aria-hidden />
        {t('menuAdmin.changePhoto')}
      </button>
    </>
  );
}

function AddItemForm() {
  const { t, addMenuItem, notify } = useApp();
  const fileRef = useRef(null);
  const empty = { nameEn: '', nameAm: '', descEn: '', descAm: '', price: '', cat: 'main', tags: [], img: '' };
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((cur) => ({ ...cur, [k]: v }));

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      set('img', await fileToDataUrl(file));
    } catch {
      notify(t('menuAdmin.badImage'));
    }
    setBusy(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const price = Math.round(Number(f.price));
    const nameEn = f.nameEn.trim();
    if (!nameEn || !Number.isFinite(price) || price < 0) return;
    const nameAm = f.nameAm.trim() || nameEn;
    addMenuItem({
      id: `custom-${Date.now().toString(36)}`,
      custom: true,
      cat: f.cat,
      price,
      tags: f.tags,
      img: f.img,
      name: { en: nameEn, am: nameAm },
      desc: { en: f.descEn.trim(), am: f.descAm.trim() || f.descEn.trim() },
    });
    notify(t('menuAdmin.added', { name: nameEn }));
    setF(empty);
    if (fileRef.current) fileRef.current.value = '';
  };

  const input =
    'mt-1 min-h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-navy-900';

  return (
    <form onSubmit={onSubmit} className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4 dark:border-white/15">
      <h3 className="font-bold">{t('menuAdmin.addTitle')}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          {t('menuAdmin.nameEn')}
          <input required maxLength={60} value={f.nameEn} onChange={(e) => set('nameEn', e.target.value)} className={input} />
        </label>
        <label className="text-sm font-medium">
          {t('menuAdmin.nameAm')}
          <input maxLength={60} value={f.nameAm} onChange={(e) => set('nameAm', e.target.value)} className={input} />
        </label>
        <label className="text-sm font-medium">
          {t('menuAdmin.descEn')}
          <input maxLength={200} value={f.descEn} onChange={(e) => set('descEn', e.target.value)} className={input} />
        </label>
        <label className="text-sm font-medium">
          {t('menuAdmin.descAm')}
          <input maxLength={200} value={f.descAm} onChange={(e) => set('descAm', e.target.value)} className={input} />
        </label>
        <label className="text-sm font-medium">
          {t('menuAdmin.price')} (ETB)
          <input required type="number" min="0" step="5" value={f.price} onChange={(e) => set('price', e.target.value)} className={input} />
        </label>
        <label className="text-sm font-medium">
          {t('menuAdmin.category')}
          <select value={f.cat} onChange={(e) => set('cat', e.target.value)} className={input}>
            {NEW_CATS.map((c) => (
              <option key={c} value={c}>{t(`cat.${c}`)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t('menu.filterBy')}>
        {DIETARY_TAGS.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={f.tags.includes(d)}
            onClick={() => set('tags', f.tags.includes(d) ? f.tags.filter((x) => x !== d) : [...f.tags, d])}
            className={`chip min-h-[32px] px-3 text-xs ${f.tags.includes(d) ? 'chip-on' : 'chip-off'}`}
          >
            {t(`diet.${d}`)}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} className="sr-only" id="menu-photo" />
        <label htmlFor="menu-photo" className="btn-ghost cursor-pointer">
          <ImagePlus className="h-4 w-4" aria-hidden />
          {busy ? t('menuAdmin.processing') : t('menuAdmin.choosePhoto')}
        </label>
        {f.img && <img src={f.img} alt="" className="h-16 w-20 rounded-lg object-cover" />}
      </div>

      <button type="submit" className="btn-gold mt-4" disabled={busy}>{t('menuAdmin.addBtn')}</button>
    </form>
  );
}

export default function MenuTab() {
  const { t, loc, menuItems, updateMenuItem, removeMenuItem } = useApp();

  const commitPrice = (id, raw) => {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) updateMenuItem(id, { price: Math.round(n) });
  };

  return (
    <section aria-labelledby="menu-admin-title" className="card p-5">
      <h2 id="menu-admin-title" className="text-lg font-bold">{t('admin.tab.menu')}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('menuAdmin.help')}</p>

      <AddItemForm />

      <ul className="mt-4 divide-y divide-slate-200 dark:divide-white/10">
        {menuItems.map((item) => {
          const name = loc(item.name);
          return (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                {item.img && <img src={item.img} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                <div className="min-w-0">
                  <p className={`font-semibold ${item.available ? '' : 'text-slate-400 line-through'}`}>{name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t(`cat.${item.cat}`)}{!item.available && ` · ${t('menu.soldOut')}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t('menuAdmin.price')}</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    defaultValue={item.price}
                    key={item.price}
                    onBlur={(e) => commitPrice(item.id, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    aria-label={`${t('menuAdmin.price')}: ${name}`}
                    className="min-h-[40px] w-24 rounded-lg border border-slate-200 bg-white px-2 text-right tabular-nums dark:border-white/10 dark:bg-navy-900"
                  />
                </label>
                <ChangePhoto item={item} name={name} />
                <button
                  type="button"
                  onClick={() => window.confirm(t('menuAdmin.confirmDelete', { name })) && removeMenuItem(item.id)}
                  aria-label={`${t('menuAdmin.remove')}: ${name}`}
                  className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.available}
                  aria-label={`${t('menuAdmin.available')}: ${name}`}
                  onClick={() => updateMenuItem(item.id, { available: !item.available })}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    item.available ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                      item.available ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
