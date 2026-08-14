# Implementation Tasks — <Feature Name>

**Requirements:** `requirements.md`  
**Design:** `design.md`

Tasks should be small enough to execute and verify independently.

## Phase 0 — Baseline

- [ ] T001 Inspect current implementation and confirm affected files/modules.
- [ ] T002 Run baseline tests/typecheck/build relevant to this feature.

## Phase 1 — Data/domain

- [ ] T010 ...
- [ ] T011 ...

**Gate:** domain/database tests pass.

## Phase 2 — Server/integration

- [ ] T020 ...
- [ ] T021 ...

**Gate:** contract/integration tests pass.

## Phase 3 — UI

- [ ] T030 ...
- [ ] T031 ...

**Gate:** component/interaction tests pass.

## Phase 4 — End-to-end

- [ ] T040 Test canonical flow.
- [ ] T041 Test edge/error states.
- [ ] T042 Test permission/security behavior.

## Phase 5 — Documentation & final verification

- [ ] T050 Update canonical docs only where product/technical truth changed.
- [ ] T051 Run full required verification.
- [ ] T052 Record evidence in `verification.md`.

## Task rules

- preserve requirement IDs in task descriptions where useful
- note dependencies
- mark parallel-safe tasks if the agent framework supports it
- do not combine unrelated cleanup into feature tasks
- do not mark complete without evidence
