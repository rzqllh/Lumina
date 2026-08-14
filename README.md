# Lumina

> **A project management operating system built for solo photographers and videographers.**

Lumina helps visual creators manage client engagements from initial down payment (DP) through shoot sessions, production workflows, revision cycles, client approvals, and final payments.

---

## Key Features

- **Mobile-First Progressive Web App (PWA):** Fast, installable on mobile and desktop devices with offline read support.
- **End-to-End Gig Lifecycle:** Manage project stages from `draft` and `active` through `closed` or recorded `force_closed` states.
- **Client Collaboration Portals:** Share live project status pages and interactive brief intake questionnaires via secure, tokenized public links.
- **Financial & Payment Tracking:** Track DP, milestone installments, project expenses, and external collaborator fees with real-time balance calculations.
- **Workflow & Deliverable Management:** Customizable workflow stages, scheduled shoot sessions, deliverable promises, and strict revision cycle tracking.
- **External Storage Friendly:** Production RAW footage and exports remain in Google Drive; Lumina keeps lightweight, structured metadata references.

---

## Tech Stack

| Layer                  | Technology                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)               |
| **Bundler & Tooling**  | [Vite 6](https://vite.dev/) + [pnpm](https://pnpm.io/)                                       |
| **Styling & UI**       | [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)          |
| **State Management**   | [TanStack Query v5](https://tanstack.com/query)                                              |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)                    |
| **PWA & Offline**      | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox)                               |
| **Database & Auth**    | [Supabase PostgreSQL](https://supabase.com/) with Row Level Security (RLS)                   |
| **Serverless Runtime** | [Supabase Edge Functions](https://supabase.com/docs/guides/functions) (Deno)                 |
| **Testing**            | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)        |
| **Hosting**            | [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [pnpm](https://pnpm.io/) (v10 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/lumina.git
   cd lumina
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Add your public Supabase project URL and anon key to `.env`.

4. Start the development server:
   ```bash
   pnpm dev
   ```

---

## Available Scripts

- `pnpm dev` — Start the local Vite development server
- `pnpm build` — Build the production SPA and PWA service worker bundle
- `pnpm preview` — Locally preview the production build
- `pnpm typecheck` — Run strict TypeScript typechecking
- `pnpm lint` — Run ESLint across the codebase
- `pnpm format:check` — Verify code formatting with Prettier
- `pnpm format` — Format all code files with Prettier
- `pnpm test` — Run unit and DOM tests in watch mode
- `pnpm test:run` — Run unit and DOM tests once

---

## Database & Local Supabase

Lumina uses Supabase PostgreSQL with 100% Row Level Security (RLS) coverage.

- Migration files are located in `supabase/migrations/`
- Edge functions are located in `supabase/functions/`
- pgTAP database tests are located in `supabase/tests/database/`

To start the local database stack (requires Docker):

```bash
supabase start
supabase db reset
supabase test db
```

---

## License

Private / Proprietary. All rights reserved.
