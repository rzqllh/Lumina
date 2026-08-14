# AI Artifact Operating Guide

## Core rule

The repo should contain enough durable context for an agent to understand the product, but not so much duplicated prose that context becomes stale or contradictory.

## Why not one giant master spec?

Large monolithic specs:
- are harder to keep current
- encourage duplication
- consume agent context
- make it harder to identify the authoritative answer
- blur product intent, architecture, and one-feature implementation detail

Community discussions around AI/spec-driven development repeatedly raise context drift and stale large requirement/task files as practical failure modes.

## Recommended layers

### Layer 1 — Product truth
Slow-changing:
- PRD
- feature inventory
- domain model
- workflows

### Layer 2 — Product design
- DESIGN.md
- approved design assets/mockups

### Layer 3 — Engineering truth
- architecture
- database schema
- security
- integrations
- testing
- ADRs

### Layer 4 — Agent steering
- AGENTS.md
- thin GEMINI.md / CLAUDE.md adapters

### Layer 5 — Feature execution
Per meaningful feature:
- requirements
- design
- tasks
- verification

## When to create a feature spec

Create one when work has:
- meaningful ambiguity
- schema changes
- security/privacy implications
- external integrations
- multiple screens/states
- cross-module behavior
- more than a small isolated fix

For tiny obvious fixes, a separate four-file spec is unnecessary.

## Update ownership

When behavior changes:
1. update the feature spec during active implementation;
2. if durable product truth changed, update the canonical durable doc;
3. if a consequential architecture choice changed, add/supersede an ADR;
4. never leave two files claiming incompatible canonical truth.

## Writing for AI agents

Prefer:
- stable IDs
- explicit invariants
- acceptance criteria
- examples
- allowed/disallowed behavior
- exact commands
- file ownership
- links to canonical docs

Avoid:
- motivational prose
- vague “best practice” instructions
- duplicated tech-stack descriptions in every file
- requirements mixed with implementation guesses
- giant task lists generated before design decisions are resolved

## Quality gates

Recommended flow:

```text
Product truth
→ Feature inventory
→ Domain/workflow
→ Design
→ Architecture/schema/security
→ Feature requirements
→ Feature design
→ Tasks
→ Implementation
→ Verification
→ Update durable truth if needed
```
