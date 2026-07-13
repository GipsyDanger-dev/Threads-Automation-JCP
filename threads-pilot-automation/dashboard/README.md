# Threads Pilot Dashboard

Dashboard interaktif untuk memonitor automation konten Threads.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS 4**
- **Recharts** (Charts)
- **Supabase** (Database)
- **Lucide React** (Icons)

## Fitur

- **Overview** — Statistik ringkas: total published, pending, rejected, total posts
- **Drafts** — Tabel draft dengan filter status dan expand detail thread posts
- **History** — Riwayat konten yang sudah dipublish dengan pencarian
- **Schedule** — Grid jadwal angle per hari dan jam
- **Analytics** — Chart publish trend, distribusi angle, dan status breakdown

## Setup

### 1. Install Dependencies

```bash
cd dashboard
npm install
```

### 2. Konfigurasi Supabase

Buat file `.env.local` di folder `dashboard`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka http://localhost:3000

### 4. Build untuk Production

```bash
npm run build
npm start
```

## Struktur Database

Dashboard menggunakan 5 tabel dari Supabase:

- `persona_pillar` — Persona dan tone rules
- `angle_schedule` — Jadwal angle per hari/jam
- `drafts` — Draft konten (status: pending_approval, published, rejected, awaiting_edit)
- `history` — Riwayat konten yang sudah publish
- `thread_posts` — Isi per post dalam thread

## Screenshots

Dashboard menampilkan:

1. **Overview** — 4 stat cards + recent drafts
2. **Drafts** — Tabel dengan filter + expandable rows
3. **History** — Tabel dengan search
4. **Schedule** — Grid 7 hari x 3 slot dengan color coding
5. **Analytics** — 3 chart (line, pie, bar)

## Real-time Updates

Dashboard menggunakan Supabase Real-time subscriptions untuk update otomatis saat ada perubahan data di tabel `drafts`.
