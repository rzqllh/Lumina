# Lumina — Canonical Workflows & State Rules

**Status:** Draft

This file owns cross-feature business flows and state transitions.

## 1. Project lifecycle

Do not model this as one overly rigid enum until workflow semantics are finalized.

Canonical conceptual flow:

```text
DP Received
→ Project Created
→ Preparation
→ Session / Production
→ Post-production
→ Delivery
→ [Revision ↔ Delivery]*
→ Client Approved
+ Fully Paid
→ Closed
```

A project may use different editable workflow stages depending on template.

## 2. Closure

### Normal close
Eligible when:
- required deliverables are approved/completed
- financial requirement is fully paid

### Force close
Owner may force-close when normal conditions are not met.

Required:
- explicit confirmation
- reason
- timestamp

Do not silently mark unpaid balances as paid.

## 3. Deliverable/revision flow

```text
Planned
→ In Progress
→ Delivered
→ Awaiting Review
   ├─ Approved → Done
   └─ Revision Requested
        → Revision In Progress
        → Delivered
        → Awaiting Review
```

Revision is per deliverable, not global per project.

## 4. Brief flow

```text
Template
→ Project Brief Snapshot
→ Owner Customizes
→ Share Link Generated
→ Client Submits
→ Submission Pending Review
→ Owner Reviews Changes
   ├─ Accept selected changes
   └─ Reject selected changes
→ Canonical Project/Brief Updated
```

## 5. Payment flow

Define payment state separately from production state.

Suggested:
- scheduled
- due
- paid
- overdue
- waived/cancelled if needed

Never infer “paid” from project stage.

## 6. Project template application

Creating a project from a template may generate:
- project workflow snapshot
- brief snapshot
- task/checklist snapshot
- payment schedule defaults
- deliverables
- calendar/session defaults
- file-link slots/folders
- client-share configuration

Generated content remains editable per project.

## 7. Package update flow

```text
Package v1
→ Project A snapshots v1

Package edited to v2
→ Project A unchanged
→ Project B snapshots v2
```

## 8. Calendar flow

Lumina calendar owns project production events:
- session/shoot
- meeting
- deliverable deadline
- revision deadline
- payment due

Low-level tasks should not automatically clutter the calendar unless explicitly scheduled.

## 9. Public client view

Public status must be generated from an allow-list projection.

Examples allowed:
- project display name
- client-facing stage/progress
- session date/location if enabled
- client-facing status updates
- deliverable status
- approved public files

Never include:
- profit/margin
- expense
- collaborator fee
- internal note
- internal task
- other clients
- private fields
