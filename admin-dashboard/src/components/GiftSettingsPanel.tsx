import { useEffect, useState } from 'react';
import { Gift, Loader2 } from 'lucide-react';
import {
  BANK_OPTIONS,
  fetchGiftSettings,
  saveGiftSettings,
  type GiftSettings,
  type GiftSide,
} from '../lib/settings';

export default function GiftSettingsPanel() {
  const [side, setSide] = useState<GiftSide>('pria');
  const [form, setForm] = useState<GiftSettings>({ bank: '', number: '', owner: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSaved(false);
    fetchGiftSettings(side).then((data) => {
      if (!cancelled) {
        setForm(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [side]);

  const set = (patch: Partial<GiftSettings>) => {
    setForm((f) => ({ ...f, ...patch }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveGiftSettings(side, form);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-emerald-800" />
        <h2 className="font-extrabold">Pengaturan Gift</h2>
      </div>

      <div className="mt-3 flex gap-2">
        {(['pria', 'wanita'] as GiftSide[]).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold capitalize ${
              side === s ? 'bg-emerald-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-8 text-sm text-stone-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Memuat…
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-bold">Bank</label>
            <select
              value={BANK_OPTIONS.includes(form.bank.trim().toUpperCase()) ? form.bank.trim().toUpperCase() : BANK_OPTIONS[0]!}
              onChange={(e) => set({ bank: e.target.value })}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
            >
              {BANK_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold">Nomor Rekening</label>
            <input
              value={form.number}
              onChange={(e) => set({ number: e.target.value })}
              placeholder="cth: 1234567890"
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-emerald-700"
            />
          </div>
          <div>
            <label className="block text-sm font-bold">Atas Nama</label>
            <input
              value={form.owner}
              onChange={(e) => set({ owner: e.target.value })}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
            />
          </div>
          <div>
            <label className="block text-sm font-bold">Alamat Kado Fisik</label>
            <textarea
              value={form.address}
              onChange={(e) => set({ address: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
            />
          </div>
          {error && <p className="rounded-xl bg-red-50 p-2.5 text-xs text-red-700">{error}</p>}
          {saved && <p className="rounded-xl bg-green-50 p-2.5 text-xs font-bold text-green-700">Tersimpan.</p>}
          <button
            onClick={() => void save()}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Simpan Gift {side === 'pria' ? 'Pria' : 'Wanita'}
          </button>
        </div>
      )}
    </div>
  );
}
