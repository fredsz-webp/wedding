/**
 * SATU-SATUNYA file yang perlu kamu edit untuk mengatur tujuan sub-domain.
 *
 * Cara pakai:
 * 1. Duplikat `.env.example` menjadi `.env`
 * 2. Isi VITE_PRIA_URL dan VITE_WANITA_URL dengan sub-domain asli kamu.
 *    Contoh:
 *      VITE_PRIA_URL=https://pria.yusuffara.com
 *      VITE_WANITA_URL=https://wanita.yusuffara.com
 * 3. Deploy folder `wedding-utama` ini ke DOMAIN UTAMA (apex),
 *    sedangkan `wedding-pria` -> sub-domain pria,
 *    dan `wedding-wanita` -> sub-domain wanita.
 *
 * Query string (?to=Nama, ?u=slug) otomatis diteruskan ke sub-domain
 * supaya nama tamu / cover tidak hilang.
 */

// Default fallback kalau .env belum diisi (ganti dengan domain asli kamu).
const DEFAULT_PRIA_URL = 'https://pria.namadomain.com';
const DEFAULT_WANITA_URL = 'https://wanita.namadomain.com';

export const PRIA_URL =
  (import.meta.env.VITE_PRIA_URL as string | undefined)?.replace(/\/$/, '') || DEFAULT_PRIA_URL;

export const WANITA_URL =
  (import.meta.env.VITE_WANITA_URL as string | undefined)?.replace(/\/$/, '') || DEFAULT_WANITA_URL;

/** Teruskan ?to= / ?u= / query lain dari domain utama ke sub-domain. */
export function withForwardedQuery(baseUrl: string): string {
  const current = new URLSearchParams(window.location.search);
  if ([...current.keys()].length === 0) return baseUrl;
  const sep = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${sep}${current.toString()}`;
}
