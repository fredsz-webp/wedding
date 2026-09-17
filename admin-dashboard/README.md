# Admin Dashboard — Undangan Yusuf & Fara 💒

Dashboard untuk mengisi **data orang yang diundang**, generate **share link personal**
(`?to=Nama&u=slug`) sehingga cover undangan menampilkan **nama tamu** (bukan
"Tamu Undangan"), login admin via **Firebase Auth (Google)**, data tersimpan di
**Firestore** collection `guests`.

## 1. Setup Firebase (sekali saja)

1. Buat project di [Firebase Console](https://console.firebase.google.com/).
2. **Authentication** → Sign-in method → aktifkan **Google** → tambah email admin
   sebagai authorized user. Tambahkan domain dev (`localhost`) & domain produksi
   (Vercel) ke **Authorized domains**.
3. **Firestore Database** → Create database (production mode) → pilih region
   terdekat (`asia-southeast1`).
4. **Firestore → Rules** → salin isi file `firestore.rules` di folder ini → Publish.
5. **Project Settings → General → Your apps → Web app** → salin config.

## 2. Konfigurasi env

```bash
cd admin-dashboard
cp .env.example .env
```

Isi `.env`:

| Key | Keterangan |
| --- | ---------- |
| `VITE_FIREBASE_*` | Config web Firebase |
| `VITE_INVITE_PRIA_URL` | URL publik undangan pria, cth `https://yusuf-fara.vercel.app` |
| `VITE_INVITE_WANITA_URL` | URL publik undangan wanita |

Role (`admin` / `panitia`) diatur di collection `users`, bukan di env.

> `wedding-pria/.env` & `wedding-wanita/.env` (lihat `.env.example`): isi
> `VITE_FIREBASE_*` yang **sama** agar RSVP + daftar ucapan + `?u=slug`
> (nama resmi + status "Sudah Dibuka") jalan. Tanpa ini, cover tetap tampil nama
> via `?to=` tapi form RSVP nonaktif.

## 3. Jalankan

```bash
# dari root repo
pnpm --filter admin-dashboard dev      # http://localhost:5174
pnpm --filter admin-dashboard build

# atau dari dalam folder
cd admin-dashboard
pnpm install
pnpm dev
```

## 4. Alur kerja

1. Login dengan Google di dashboard. Login pertama otomatis tercatat di collection `users`
   dengan role `pending` (layar "Menunggu Persetujuan").
2. **Admin pertama**: buka Firebase Console → Firestore → collection `users` → ubah field
   `role` dokumen emailmu menjadi `admin` → kembali ke dashboard → Coba Lagi.
3. Buka tab **Kelola Pengguna** untuk menyetujui (`Admin`/`Panitia`) atau menghapus pendaftar
   berikutnya. Email yang tidak terdaftar tidak bisa masuk.
2. **Tambah Tamu** (satu-satu) atau **Tambah Banyak** (satu nama per baris).
3. Pilih **Sisi** (`pria` / `wanita` / `umum`) — menentukan base URL share link.
   Tamu `umum` dapat **2 link** (Pria + Wanita).
4. Klik **Salin Link** (atau **Salin Pria** / **Salin Wanita**) → kirim ke tamu,
   atau tombol **WA** untuk template pesan WhatsApp otomatis (berisi semua link tamu).
5. Tamu membuka link → cover menampilkan “Kepada Yth… **Nama Tamu**”.
6. Jika env Firebase terisi di sisi undangan, dashboard otomatis menandai
   **Sudah Buka** + hitungan view, karena link membawa `?u=slug`.
7. Kelola **RSVP** manual (Hadir / Berhalangan) atau biarkan Menunggu.
8. Tab **RSVP & Ucapan**: otomatis terisi saat tamu menekan “Kirim Konfirmasi” di
   undangan (nama, kehadiran, jumlah, ucapan). Form hanya bisa dikirim via link
   personal (`?u=`); link umum hanya bisa membaca daftar ucapan. Entri yang cocok
   dengan daftar tamu ditandai ✓. Statistik Hadir/Berhalangan/Ucapan/Pax dihitung
   dari data asli ini.
9. **Export CSV** untuk rekap / cetak.

## Format share link

```
https://undangan-anda.vercel.app/?to=Bpk.+H.+Ahmad+%26+Keluarga&u=bpk-h-ahmad-keluarga-x7k2
```

- `to` → langsung dipakai cover (tanpa fetch, tanpa login).
- `u` → slug Firestore; dipakai untuk nama resmi + status dibuka.

## Struktur data (`guests`)

```ts
{
  name: string; slug: string;
  phone?: string; address?: string;
  group: 'Keluarga' | 'Sahabat' | 'Rekan Kerja' | 'Tetangga' | 'Lainnya';
  side: 'pria' | 'wanita' | 'umum';
  events: ('pria-11-okt' | 'wanita-3-okt' | 'wanita-4-okt')[]; // centangan acara diundang
  rsvp: 'pending' | 'hadir' | 'tidak';
  pax: number; note?: string;
  opened: boolean; openedAt: timestamp; viewCount: number;
  createdAt: timestamp; updatedAt: timestamp;
}
```
