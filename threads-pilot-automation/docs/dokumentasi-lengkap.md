# Dokumentasi Lengkap Threads Pilot Automation

## Gambaran Umum

Project ini mendokumentasikan alur automation untuk menyiapkan draft konten Threads, meminta approval, melakukan edit bila perlu, lalu mempublikasikan hasil akhirnya.

## Komponen Utama

- Workflow 1: generate draft konten.
- Workflow 2: approval dan edit manual.
- Database: menyimpan metadata draft, status approval, dan histori eksekusi.
- Screenshot: bukti visual canvas workflow dan contoh approval Telegram.
- Pitch deck: ringkasan presentasi untuk kebutuhan demo atau pameran repo.

## Alur Kerja

1. User mengirim brief konten.
2. Sistem membuat draft konten.
3. Draft disimpan ke database.
4. Approval dikirim ke Telegram.
5. Reviewer menyetujui atau meminta edit.
6. Konten final dipublikasikan ke Threads.

## Output yang Disimpan

- Draft konten.
- Status approval.
- Catatan revisi.
- Timestamp eksekusi workflow.

## Dokumen Pendukung

- `workflows/workflow-1-generate.json`
- `workflows/workflow-2-approval-edit.json`
- `database/schema.sql`
- `docs/screenshots/`
