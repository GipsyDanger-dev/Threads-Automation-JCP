# Threads Pilot Automation

Automation showcase untuk publikasi Threads: generate draft, approval via Telegram, edit manual / AI, lalu publish ke Threads secara terkontrol.

Project ini dibuat untuk mendemokan alur kerja konten yang rapi dari awal sampai tayang. Fokusnya bukan sekadar menyimpan file workflow, tapi menunjukkan bagaimana satu ide konten bisa:

1. dibuat otomatis dari jadwal dan persona,
2. dikirim ke Telegram untuk dicek manusia,
3. direvisi kalau perlu,
4. lalu dipublikasikan ke Threads setelah disetujui.

Dengan kata lain, repo ini adalah gabungan dari automation, approval loop, dan dokumentasi yang bisa dipamerkan sebagai satu paket demo.

## Highlights

- Generate konten otomatis berdasarkan jadwal dan angle harian.
- Approval loop via Telegram dengan tombol `Approve`, `Edit`, dan `Reject`.
- Jalur edit manual dan edit AI untuk revisi tanpa keluar dari flow.
- Skema database dan dokumentasi lengkap sudah disiapkan untuk demo GitHub.
- Workflow dibagi jadi dua bagian utama supaya alurnya mudah dipahami dan dirawat.
- Semua aset penting sudah dikumpulkan di satu tempat: workflow, docs, database, dan screenshot.

## How It Works

Secara sederhana, alurnya seperti ini:

1. Workflow 1 membaca jadwal dan menentukan angle konten untuk slot waktu tertentu.
2. System men-generate draft awal berdasarkan persona yang sudah ditentukan.
3. Draft dikirim ke Telegram untuk approval.
4. Kalau disetujui, Workflow 2 mengeksekusi publish ke Threads.
5. Kalau ditolak atau perlu revisi, Workflow 2 mengarahkan ke jalur edit manual atau edit AI.

Bagian yang paling penting adalah approval tetap ada di tangan manusia. Automation dipakai untuk mempercepat kerja, bukan menggantikan kontrol editorial.

## Repo Structure

```text
threads-pilot-automation/
├── README.md
├── workflows/
│   ├── Workflow 1.json
│   └── Workflow 2.json
├── docs/
│   ├── dokumentasi-lengkap.md
│   ├── pitch-deck.pdf
│   └── screenshots/
│       ├── canvas-workflow-1.png
│       ├── canvas-workflow-2.png
│       └── contoh-telegram-approval.png
└── database/
    └── schema.sql
```

## What’s Inside

- `workflows/` berisi dua workflow inti. Workflow 1 menangani generate draft, Workflow 2 menangani approval, reject, dan edit.
- `docs/` berisi dokumentasi lengkap, pitch deck, dan screenshot pendukung untuk presentasi atau showcase.
- `database/schema.sql` berisi struktur data yang dipakai oleh automation, termasuk draft, history, dan isi tiap post thread.

## Reading Order

Kalau baru pertama kali buka repo ini, urutan baca yang paling masuk akal adalah:

1. README ini untuk memahami gambaran besar.
2. `docs/dokumentasi-lengkap.md` untuk detail alur, bug, dan keputusan desain.
3. `workflows/Workflow 1.json` dan `workflows/Workflow 2.json` untuk melihat implementasi nyata di n8n.
4. `database/schema.sql` untuk memahami struktur data yang dipakai.

## Status Aset

- `docs/pitch-deck.pdf` dan screenshot masih perlu diganti dengan aset final.
- Workflow dan dokumentasi utama sudah siap untuk dipresentasikan di GitHub.
