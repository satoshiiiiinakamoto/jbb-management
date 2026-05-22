# JBB Management Program

Internal management dashboard for Jewel Beauty Bandung.

## Tahap A — Login & Authentication

Saat ini program berisi:
- Halaman login dengan email + password
- Role-based dashboard (admin vs karyawan)
- Tampilan profil karyawan
- Setup pertama yang bisa langsung dipakai

Tahap berikutnya akan menambahkan input transaksi, manajemen karyawan, laporan, gaji, home service, dan upload foto.

## Setup

1. Buat akun Supabase, jalankan SQL schema
2. Buat akun Vercel, hubungkan ke GitHub
3. Edit `config.js` dengan kredensial Supabase
4. Push ke GitHub → Vercel auto-deploy

## Struktur file

- `index.html` — entry point + styling
- `config.js` — kredensial Supabase (perlu diedit)
- `lib.jsx` — helper functions, Supabase client
- `components.jsx` — UI components (nav, card, metric, dll)
- `pages.jsx` — halaman login, dashboard admin, dashboard karyawan
- `app.jsx` — routing & state utama

## Brand

JBB · 아름다움
PT Wicaksono Berkarya Sejahtera
