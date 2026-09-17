import { useEffect, useMemo, useState } from 'react';
import { Loader2, ShieldCheck, Trash2, UserCheck, UserPlus } from 'lucide-react';
import {
  addUser,
  removeUser,
  setUserRole,
  subscribeUsers,
  type AppRole,
  type AppUser,
} from '../lib/users';

export default function UsersPanel({ currentEmail }: { currentEmail: string }) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AppRole>('panitia');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => subscribeUsers((data) => {
    setUsers(data);
    setLoading(false);
    setError(null);
  }, (e) => {
    setError(e.message);
    setLoading(false);
  }), []);

  const me = currentEmail.trim().toLowerCase();

  /** Yang menunggu persetujuan tampil paling atas. */
  const sorted = useMemo(
    () => [...users].sort((a, b) => Number(b.role === 'pending') - Number(a.role === 'pending')),
    [users],
  );

  const add = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await addUser(email, role, me);
      setEmail('');
      setRole('panitia');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Gagal menambah pengguna.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-800" />
        <h2 className="font-extrabold">Kelola Pengguna</h2>
      </div>
      <p className="mt-1 text-xs text-stone-500">
        Hanya email terdaftar di sini yang bisa login. <b>Admin</b>: akses penuh. <b>Panitia</b>: kelola tamu saja
        (tidak bisa hapus tamu &amp; kelola pengguna).
      </p>

      {/* Tambah */}
      <div className="mt-3 flex flex-col gap-2 rounded-xl bg-stone-50 p-3 sm:flex-row">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@gmail.com"
          type="email"
          className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
        />
        <select value={role} onChange={(e) => setRole(e.target.value as AppRole)} className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm">
          <option value="panitia">Panitia</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={() => void add()}
          disabled={saving || !email.trim()}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Tambah
        </button>
      </div>
      {formError && <p className="mt-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700">{formError}</p>}

      {/* Daftar */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 p-8 text-sm text-stone-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Memuat pengguna…
        </div>
      ) : error ? (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">Gagal memuat: {error}</p>
      ) : users.length === 0 ? (
        <p className="mt-3 p-4 text-center text-sm text-stone-500">Belum ada pengguna terdaftar.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Didaftarkan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((u) => {
                const isSelf = u.id === me;
                const isPending = u.role === 'pending';
                return (
                  <tr key={u.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/60">
                    <td className="px-4 py-3">
                      <p className="font-bold">{u.email}</p>
                      <p className="text-xs text-stone-400">
                        {[u.name, u.createdBy ? `oleh ${u.createdBy}` : null].filter(Boolean).join(' · ') || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {isPending ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                            Menunggu
                          </span>
                          <button
                            onClick={() => void setUserRole(u.id, 'admin')}
                            title="Setujui sebagai Admin"
                            className="flex items-center gap-1 rounded-lg bg-emerald-900 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            <UserCheck className="h-3.5 w-3.5" /> Admin
                          </button>
                          <button
                            onClick={() => void setUserRole(u.id, 'panitia')}
                            title="Setujui sebagai Panitia"
                            className="flex items-center gap-1 rounded-lg border border-emerald-900/30 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
                          >
                            <UserCheck className="h-3.5 w-3.5" /> Panitia
                          </button>
                        </div>
                      ) : (
                        <select
                          value={u.role}
                          disabled={isSelf}
                          title={isSelf ? 'Tidak bisa mengubah role sendiri' : 'Ubah role'}
                          onChange={(e) => void setUserRole(u.id, e.target.value as AppRole)}
                          className="rounded-lg border border-stone-200 px-2 py-1.5 text-xs font-bold disabled:opacity-60"
                        >
                          <option value="admin">Admin</option>
                          <option value="panitia">Panitia</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={isSelf}
                        title={isSelf ? 'Tidak bisa menghapus diri sendiri' : 'Hapus pengguna'}
                        onClick={() => {
                          if (window.confirm(`Hapus akses "${u.email}"? Ia tidak akan bisa login lagi.`)) void removeUser(u.id);
                        }}
                        className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
