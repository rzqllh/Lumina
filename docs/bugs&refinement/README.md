# Lumina — bugs & refinement

Register lintas severity: [FINDINGS.md](FINDINGS.md). Snapshot 7 November 2026, baseline `master@130bf73`.

| Prioritas | Makna | Jumlah |
| --- | --- | ---: |
| P0 Urgent | Security/data integrity/launch stopper | 3 |
| P1 High | Isolasi operasional/production acceptance | 7 |
| P2 Medium | Reliability, UX, bukti produk | 4 |
| P3 Light | Refinement/maintainability | 4 |
| **Total** | | **18** |

Status PATCH_DRAFT tidak berarti closed; klaim LIVE PASS membutuhkan bukti live. Semua pointer file relatif dari lokasi `docs/bugs&refinement/`; tautan GitHub mengacu source yang dibaca. Re-triage setiap perubahan main/PR. Jangan mempublikasikan credential, PII, eksploit, log mentah, atau test tenant nyata.

**Pending owner acceptance:** Supabase staging/privilege/RLS, restore, media permissions jika fitur diaktifkan, dan izin deployment. Register ini tidak mengubah kode, schema atau vendor.

**Documentation PR check (2026-11-07):** [PR #2 CI run 42337014688](https://github.com/rzqllh/Lumina/actions/runs/42337014688) **FAILED**, specifically the existing date-dependent `PaymentsList.test.tsx` upcoming-status expectation (164 tests passed, 1 failed). PR #2 modifies only Markdown; this is an existing test clock dependency, not proof that the documents are invalid. The separate draft fix [PR #1](https://github.com/rzqllh/Lumina/pull/1) had a successful code CI run; it has not been merged into `master`. Do not bypass required CI or call PR #2 release-green.

**New source-level evidence:** `LUM-P1-07` tracks public brief intake accepting `p_answers` JSONB without answer-schema checks within the inspected submission RPC. This is a documentation-only finding; actual rate limits, maximum payload and anon staging behavior remain unverified.
