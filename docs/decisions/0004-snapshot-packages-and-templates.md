# ADR-0004: Historical Snapshot Semantics for Packages and Templates

- **Status:** Accepted
- **Date:** 2026-08-14
- **Decision owners:** Lumina Core Architecture

## Context and problem statement

In creative businesses, packages, service rates, and workflow templates change over time (e.g. price increases, new deliverables added). In naive database designs where a project directly joins with a live `packages` or `templates` table, updating a package silently changes historical pricing, invoice totals, and deliverables on projects executed years ago. We must ensure absolute historical stability (`INV-001`, `INV-015`).

## Decision drivers

- **Historical Data Stability:** Past completed and in-flight projects must retain exact terms agreed upon with the client.
- **Auditability:** Retain provenance information (which template or package was originally used) without live relational binding.
- **Operational Flexibility:** Allow per-project customization of workflow stages and prices after template instantiation (`INV-008`).

## Considered options

1. **Option A (Physical Snapshot Tables with Audit Source FKs) — Selected**
2. **Option B (Live Relational Binding with Versioned Catalog Rows e.g. `packages_v1`, `packages_v2`)**
3. **Option C (Storing Entire Project Configuration as a Single JSON Blob)**

## Decision outcome

Chosen: **Option A (Physical Snapshot Tables)**. When a project is created from a package or template:
- Pricing and service lines are copied into `project_services` with exact unit prices, quantities, and labels.
- Workflow stages are copied into `project_workflow_stages`.
- Source references (`source_package_id`, `source_service_id`, `source_template_id`) are stored with `ON DELETE SET NULL` for audit trail only.
- Direct live joins to catalog tables for project value calculations are strictly prohibited.

### Positive consequences
- Editing or deleting a catalog package or service has zero effect on existing projects.
- Owner can freely add, rename, reorder, or discount project service lines and workflow stages per project.
- Relational integrity and aggregate SQL queries remain clean and performant.

### Negative consequences / trade-offs
- Slight data duplication on project creation.
- Instantiation logic requires transactional copying of template records.

## Rejected alternatives

### Option B: Versioned Catalog Rows
- *Why rejected:* Drastically increases catalog maintenance complexity and does not support project-specific one-off discounts or custom line item overrides.

## Confirmation

Verified by confirming that updating a package name or price in `packages` produces zero changes in `project_services` rows of existing projects.

## Follow-up / revisit trigger

None. This is a foundational business invariant (`INV-001`, `INV-015`).
