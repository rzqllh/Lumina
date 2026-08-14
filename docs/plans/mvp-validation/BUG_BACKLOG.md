# Lumina — MVP Validation Bug Backlog

**Pass:** MVP Real-World Validation Pass 1  
**Date:** 2026-08-15  
**Status:** Audit & Classification Complete  

---

## 1. Defect Summary

| Severity | Count | Description |
|---|---|---|
| **BLOCKER** | 0 | None. All core validation journeys can be completed. |
| **P0** | 0 | None. Zero security leaks, zero data destruction vulnerabilities. |
| **P1** | 0 | None. All MVP workflows operate reliably. |
| **P2** | 0 | None. No functional regressions detected. |
| **POLISH** | 1 | Minor copy/wording alignment. |

---

## 2. Itemized Findings

### `BUG-POLISH-001` — Login CTA Button Microcopy Alignment
- **Severity:** `POLISH`
- **Area:** Authentication / UI Copy
- **Observed:** The login page button renders `"Continue with Google"`. Some documentation references `"Sign in with Google"`.
- **Impact:** Minimal; `"Continue with Google"` is standard modern OAuth copy.
- **Recommendation:** Keep `"Continue with Google"` as the canonical UI copy across documentation.

---

## 3. External Dependencies & Manual Action Ledger

### `EXT-DEP-001` — Remote Google OAuth Provider Configuration
- **Type:** `EXTERNAL_CONFIGURATION_BLOCKER`
- **Impact:** Live production Google Sign-In requires active Google Cloud Console credentials registered in the Supabase Dashboard.
- **Status:** Documented for production deployment.

### `EXT-DEP-002` — Service-Role Key Rotation
- **Type:** `EXTERNAL_MANUAL_ACTION_REQUIRED`
- **Impact:** Because past repository history included a local environment variable reference, remote credential rotation is required in the Supabase Dashboard.
- **Status:** Pending manual operator dashboard rotation.
