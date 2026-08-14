# Lumina AI Artifact Pack

This folder is the planning and context layer for Lumina before implementation begins.

Lumina is currently defined as a **single-user-first personal operating system for photographers/videographers**. It tracks a paid project from DP received through planning, sessions, production, editing, revisions, delivery, client approval, full payment, and closure.

## Why this structure exists

AI coding agents perform better when durable product truth, technical decisions, feature-local specs, and verification criteria are kept distinct instead of being repeated across giant prompts.

This structure borrows from:
- GitHub Spec Kit's spec → plan → tasks workflow
- Kiro's requirements → design → tasks feature specs
- Codex `AGENTS.md`
- Claude Code `CLAUDE.md`
- Gemini `GEMINI.md`
- Markdown Architectural Decision Records (MADR)
- concise product/technical spec practices from Linear
- community feedback warning against oversized, duplicated, stale spec files

## Canonical truth map

| Question | Canonical file |
|---|---|
| Why does Lumina exist? Who is it for? | `docs/product/PRD.md` |
| What is in MVP / later / out of scope? | `docs/product/FEATURE_INVENTORY.md` |
| What does each domain term mean? | `docs/product/DOMAIN_MODEL.md` |
| What are the canonical business flows? | `docs/product/WORKFLOWS.md` |
| How should the product look and behave? | `docs/design/DESIGN.md` |
| How is the system built? | `docs/engineering/ARCHITECTURE.md` |
| What does the database look like? | `docs/engineering/DATABASE_SCHEMA.md` |
| What are server/API boundaries? | `docs/engineering/API_CONTRACTS.md` |
| How are security and privacy handled? | `docs/engineering/SECURITY.md` |
| How do external integrations behave? | `docs/engineering/INTEGRATIONS.md` |
| What must be tested? | `docs/engineering/TESTING.md` |
| Why was an important technical decision made? | `docs/decisions/*.md` |
| What exactly are we building for one feature? | `docs/specs/<feature>/` |
| How should coding agents operate in this repo? | `AGENTS.md` |

## Documentation rule

**Do not duplicate truth across files. Link to the canonical owner instead.**

Example: `DATABASE_SCHEMA.md` may reference the project lifecycle from `WORKFLOWS.md`, but must not redefine it.

## Durable vs feature-local documents

### Durable
These evolve with the product:
- PRD
- Feature inventory
- Domain model
- Core workflows
- Design system/product UX rules
- Architecture
- Database schema
- Security
- Integrations
- Testing strategy
- ADRs
- AGENTS.md

### Feature-local
Create for meaningful work:
- `requirements.md`
- `design.md`
- `tasks.md`
- `verification.md`

After implementation, these remain useful as history, but current product truth must be reflected in the durable canonical docs.

## Current planning status

As of 2026-08-14:

- Artifact scaffolding: established
- Product discovery: locked for MVP planning
- Feature inventory: baseline locked (MVP Core / High-value / Later / Out)
- Visual baseline: established in `DESIGN.md`
- Domain & workflows: locked in `DOMAIN_MODEL.md` and `WORKFLOWS.md`
- Technical architecture, schema, security & integrations: locked in `docs/engineering/`
- Architectural Decision Records: ADRs 0001–0007 accepted in `docs/decisions/`
- Implementation: intentionally not started
- Next step: repository scaffold (Pass C) followed by first feature specification

## Execution order

1. [x] Complete `PRD.md` and `FEATURE_INVENTORY.md`.
2. [x] Lock `DOMAIN_MODEL.md` and `WORKFLOWS.md` (Pass A).
3. [x] Lock `DESIGN.md`.
4. [x] Finalize `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `SECURITY.md`, `INTEGRATIONS.md` (Pass B).
5. [x] Author and accept initial ADRs 0001–0007 (Pass B).
6. [ ] Repository Foundation / Scaffold (Pass C).
7. [ ] Feature specifications (`docs/specs/<feature>/`) and implementation.

## Research references

- GitHub Spec Kit: https://github.com/github/spec-kit
- Spec Kit docs: https://github.github.com/spec-kit/
- Kiro Specs: https://kiro.dev/docs/specs/
- Kiro Feature Specs: https://kiro.dev/docs/specs/feature-specs/
- OpenAI Codex / AGENTS.md: https://openai.com/index/introducing-codex/
- Claude Code memory / CLAUDE.md: https://docs.anthropic.com/en/docs/claude-code/memory
- Gemini Code Assist / GEMINI.md: https://developers.google.com/gemini-code-assist/docs/use-agentic-chat-pair-programmer
- MADR: https://github.com/adr/madr
- Linear project specs: https://linear.app/now/how-we-run-projects-at-linear
- Atlassian PRD guidance: https://www.atlassian.com/agile/product-management/requirements
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase migrations: https://supabase.com/docs/guides/deployment/database-migrations
