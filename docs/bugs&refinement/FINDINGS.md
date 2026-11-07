# Lumina — Bugs & Refinement Register

**Updated:** 2026-11-07 (Asia/Jakarta). **Default baseline:** `master@130bf73b736158f2239dce0e8e5184a3789c1a11`. **Register only:** writing this document does not implement fixes.

**Evidence rule:** CODE_CONFIRMED/SOURCE_CONFIRMED refers to a named inspected file; PATCH_DRAFT is not merged or applied; CI_VERIFIED is only the named workflow/commit; ACCEPTANCE_OPEN means not independently demonstrated; PROPOSED_REFINEMENT is an idea, not an observed defect. Each row needs fresh triage when merged into newer code.

**Security disclosure:** public descriptions intentionally avoid exploit payloads, private tenant identifiers or credentials. Vulnerabilities belong in private advisories if sensitive.

## P0 — Urgent

### LUM-P0-01 — SECURITY DEFINER brief-review RPC dapat menerima field UUID di luar brief asal

- **Status:** PATCH_DRAFT / CODE_CONFIRMED.
- **Temuan/batas bukti:** Migration `00023` mengecek membership terhadap brief submission, tetapi UPDATE ke `brief_fields` lama hanya memakai field ID. Risiko mutasi lintas brief/workspace tidak boleh dianggap tertutup hingga migrasi baru dijalankan dan diuji sebagai role riil.
- **Bukti:** [migration 00023](../../supabase/migrations/00023_fix_apply_brief_submission_review.sql), [draft fix PR #1](https://github.com/rzqllh/Lumina/pull/1).
- **Next/DoD:** Jalankan `00024` pada staging, pgTAP negative cross-workspace/cross-brief, cek grants dan rollback; audit produksi hanya melalui prosedur yang disetujui.

### LUM-P0-02 — Supabase project inactive; tidak ada bukti migrasi keamanan dan pgTAP berjalan

- **Status:** BLOCKED_EXTERNAL.
- **Temuan/batas bukti:** CI frontend hijau bukan validasi Postgres/RLS. SQL baru `00024` dan regresi `13_...` ada **di draft PR** bukan database default/live.
- **Bukti:** [draft PR #1](https://github.com/rzqllh/Lumina/pull/1), [CI successful](https://github.com/rzqllh/Lumina/actions/runs/42319807369).
- **Next/DoD:** Siapkan staging dengan persetujuan pemilik; jalankan seluruh migrasi + pgTAP, verify SQL constraints dan privilege dari JWT user/anonymous; simpan bukti SHA.

### LUM-P0-03 — Verifikasi isolasi data RLS dua workspace dan akses publik belum memenuhi bukti live

- **Status:** ACCEPTANCE_OPEN.
- **Temuan/batas bukti:** Unit/pgTAP source tidak menggantikan uji Supabase REST/RPC sebagai dua akun berbeda, anonymous dan client public link; severity berdasarkan potensi kebocoran data klien.
- **Bukti:** [RLS schema](../../supabase/migrations/00010_security_and_rls.sql), [DB tests](../../supabase/tests/database/01_invariants_and_rls.test.sql).
- **Next/DoD:** Uji pembacaan, pembuatan, perubahan, delete serta cross-tenant access; gunakan fixture disposable dan bersihkan setelahnya.

## P1 — High

### LUM-P1-01 — Semantik review brief: hanya nilai klien dan field client-fillable yang dapat diterima

- **Status:** PATCH_DRAFT.
- **Temuan/batas bukti:** Patch `00024` memvalidasi submitted_values, section/brief dan visibility. Belum terbukti interaksi dengan pending/reviewed, retry, duplicate accepted field atau role staff.
- **Bukti:** [migration draft 00024](https://github.com/rzqllh/Lumina/blob/fix/20261107-brief-review-authorization/supabase/migrations/00024_secure_brief_submission_review.sql).
- **Next/DoD:** Tambah acceptance DB role-based, double-review/idempotence, rejected-fields dan kegagalan atomik; jangan asal menyetujui setiap workspace member jika policy produk mensyaratkan role lebih tinggi.

### LUM-P1-02 — Public brief/status links: akses, TTL, revokasi, redaksi data internal

- **Status:** ACCEPTANCE_OPEN.
- **Temuan/batas bukti:** RPC intake dan public status sudah punya schema/tests source; belum ada bukti uji URL sharing pada staging/production di autentikasi, expiry dan integritas.
- **Bukti:** [migrations 00021–00022](../../supabase/migrations/00021_brief_builder_and_intake_integrity.sql), [intake tests](../../supabase/tests/database/11_briefs_and_intake.test.sql).
- **Next/DoD:** Uji token tamper, revoked/expired, internal-only redaction, cross-workspace link dan no token leakage pada logs/history.

### LUM-P1-03 — Backup/restore/RPO-RTO database dan artefak belum dibuktikan

- **Status:** ACCEPTANCE_OPEN.
- **Temuan/batas bukti:** Pola `pg_dump` terjadwal tidak otomatis setara managed PITR; penyimpanan object di R2 (jika kelak dipakai) tidak ikut PostgreSQL dump.
- **Bukti:** [project architecture](../../README.md).
- **Next/DoD:** Tetapkan RPO/RTO/retention, snapshot terenkripsi di lokasi terpisah, audit akses, uji pemulihan staging, jadwalkan evidence. Jangan mengklaim ping harian mencegah pause Supabase Free.

### LUM-P1-04 — Otorisasi media R2 jika fitur upload langsung diaktifkan

- **Status:** PROPOSED_REFINEMENT / NOT_IMPLEMENTATION_FINDING.
- **Temuan/batas bukti:** Belum ada bukti R2 sebagai storage media utama atau implementasi signing siap produksi. Presigned URL adalah bearer credential; Supabase RLS tidak melindungi R2 secara otomatis.
- **Bukti:** [media boundary](../../README.md).
- **Next/DoD:** Sebelum implementasi, gate server dengan JWT + owner/project permission, short-lived PUT/GET scope, object key random, post-upload verification, delete/revoke dan audit.

### LUM-P1-05 — Integritas upload: jangan bergantung hanya pada Content-Length presigned PUT

- **Status:** PROPOSED_REFINEMENT / NOT_IMPLEMENTATION_FINDING.
- **Temuan/batas bukti:** R2 presigned PUT tidak otomatis menerapkan POST-policy content-length-range; ukuran/MIME dari browser tidak boleh dipercaya.
- **Bukti:** [media boundary](../../README.md).
- **Next/DoD:** Validasi batas dan tipe di server, cek object HEAD sesudah upload, karantina file tak sesuai, cleanup orphan/multipart. Simpan metadata dan ownership.

### LUM-P1-06 — Approval, deliverable, finance dan project closure perlu real-user journey testing

- **Status:** ACCEPTANCE_OPEN.
- **Temuan/batas bukti:** Migrations & unit DOM tidak membuktikan perjalanan DP→brief→session→revisi→persetujuan→lunas→tutup, termasuk force-close, hak akses, audit dan timezone.
- **Bukti:** [feature modules](https://github.com/rzqllh/Lumina/tree/master/src/features), [DB finance tests](../../supabase/tests/database/10_finance_and_closure.test.sql).
- **Next/DoD:** Uji happy/unhappy paths di staging; audit paid-status reversibility, referensi ke files/deliverables dan atomicity.

## P2 — Medium

### LUM-P2-01 — Finance PaymentsList test memakai tanggal sistem aktual

- **Status:** PATCH_DRAFT / CI_VERIFIED.
- **Temuan/batas bukti:** Assert `payment-status-upcoming` menjadi gagal setelah due date fixture berlalu; draft patch membekukan Date dan CI berikutnya hijau.
- **Bukti:** [draft PR #1](https://github.com/rzqllh/Lumina/pull/1), [CI](https://github.com/rzqllh/Lumina/actions/runs/42319807369).
- **Next/DoD:** Pertahankan fake Date hanya untuk clock, jalankan ulang pada head yang nanti di-merge; scan tes status tanggal yang sejenis.

### LUM-P2-02 — README masih menyatakan implementasi feature belum dimulai

- **Status:** SOURCE_CONFIRMED_DOC_DRIFT.
- **Temuan/batas bukti:** README berlabel Repository Foundation/placeholder routes, sementara `src/features` berisi dashboard/clients/projects/briefs/finance/deliverables, dan CI menjalankan puluhan DOM tests. Ini klaim status yang menyesatkan, bukan bukti semua modul siap.
- **Bukti:** [README](../../README.md), [features](https://github.com/rzqllh/Lumina/tree/master/src/features).
- **Next/DoD:** Perbarui status per modul sesuai build/tests/live evidence; pisahkan IMPLEMENTED, TESTED, STAGING_PENDING dan PRODUCTION_UNKNOWN.

### LUM-P2-03 — PWA, responsive, aksesibilitas dan offline state belum diterima secara manual

- **Status:** ACCEPTANCE_OPEN.
- **Temuan/batas bukti:** Vite/PWA shell dan unit test tidak sama dengan mobile standalone, keyboard/VoiceOver, slow/offline, safe area atau upload interruption.
- **Bukti:** [README](../../README.md).
- **Next/DoD:** Buat Playwright Chromium/WebKit journey dan uji perangkat fisik terarah; catat SHA, viewport, OS, network, expected/actual.

### LUM-P2-04 — Secret exposure, audit log, observability, error privacy belum diverifikasi deploy

- **Status:** ACCEPTANCE_OPEN.
- **Temuan/batas bukti:** RLS source/Cloudflare config/Edge Function health bukan proof log bebas data sensitif, monitoring dan recovery.
- **Bukti:** [CI](https://github.com/rzqllh/Lumina/actions/runs/42319807369), [Edge Functions](https://github.com/rzqllh/Lumina/tree/master/supabase/functions).
- **Next/DoD:** Gunakan staging untuk negative auth, error redaction, CSP/CORS, audit retained events dan restore; jangan publish private URL/token.

## P3 — Light

### LUM-P3-01 — Standarkan status payment: upcoming, overdue, partially paid, paid

- **Status:** PROPOSED_REFINEMENT.
- **Temuan/batas bukti:** Tanggal fixture sebelumnya memperlihatkan ketergantungan waktu; UX label dan timezone harus mengikuti definisi product finance, bukan clock arbitrary.
- **Bukti:** [PaymentsList test](https://github.com/rzqllh/Lumina/blob/master/src/test/finance/PaymentsList.test.tsx).
- **Next/DoD:** Tentukan kebijakan timezone dan due-date inclusive; buat table-driven tests di boundary tanggal dan aksesibilitas badge.

### LUM-P3-02 — Definisikan preview foto/video tanpa mengubah master media

- **Status:** PROPOSED_REFINEMENT.
- **Temuan/batas bukti:** Tidak ada keputusan produk terverifikasi untuk WebP quality, batas 720p/50–100MB atau storage master dalam repository.
- **Bukti:** [files boundary](../../README.md).
- **Next/DoD:** Uji preview/thumbnail sebagai turunan opsional; original client tetap utuh dan link external bisa diperbarui/di-revoke.

### LUM-P3-03 — Buat documentation-to-feature evidence map

- **Status:** PROPOSED_REFINEMENT.
- **Temuan/batas bukti:** Traceability migration→API→UI→test belum tersaji sebagai matrix per modul di README.
- **Bukti:** [README](../../README.md).
- **Next/DoD:** Tautkan test dan decision log pada setiap fitur, beri owner/last-checked SHA dan singkirkan klaim README yang stale.

### LUM-P3-04 — Cek empty/loading/error copy, focus return dan form validation

- **Status:** PROPOSED_REFINEMENT.
- **Temuan/batas bukti:** Ini QA backlog, **bukan bug yang telah direproduksi**; jangan membuat PR UI berdasarkan asumsi.
- **Bukti:** [feature modules](https://github.com/rzqllh/Lumina/tree/master/src/features).
- **Next/DoD:** Audit keyboard, form errors, busy state, undo dan pengukuran density di mobile/desktop.

## Checkpoint lintas area

- **Patch:** [PR #1](https://github.com/rzqllh/Lumina/pull/1) — draft, CI frontend [success](https://github.com/rzqllh/Lumina/actions/runs/42319807369), DB tests **NOT RUN**, no database writes.
- **No silent architecture changes:** React/Vite/Supabase/Cloudflare contract is left as-is; R2/media/backup items are proposals until implementation evidence and owner decisions exist.
- **Definition of closure:** link to merged code SHA + regression (negative where relevant) + exact-head CI + staging/live evidence if risk depends on real auth or vendor.
