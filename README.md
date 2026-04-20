# Patient Referral Intake — Pain Management & Neurology Clinic

A full-stack monorepo built with Next.js, tRPC, Drizzle ORM, Zod, and PostgreSQL.  
Includes all bonus features: Turborepo monorepo, unit tests (Vitest), and Docker Compose.

---

## Tech Stack

| Layer      | Technology                                                      |
| ---------- | --------------------------------------------------------------- |
| Monorepo   | Turborepo                                                       |
| Framework  | Next.js 14 (App Router)                                         |
| Language   | TypeScript (end-to-end)                                         |
| API        | tRPC                                                            |
| Validation | Zod — **shared** between client and server via `@clinic/shared` |
| ORM        | Drizzle ORM                                                     |
| Database   | PostgreSQL — Neon (cloud) **or** Docker (local)                 |
| Forms      | React Hook Form + @hookform/resolvers                           |
| Styling    | Tailwind CSS                                                    |
| Testing    | Vitest                                                          |

---

## Project Structure

```
clinic-referral/
├── apps/
│   └── web/                              # Next.js application
│       ├── __tests__/
│       │   ├── schema.test.ts            # Unit tests for Zod schema
│       │   └── referral.router.test.ts   # Unit tests for tRPC router
│       ├── app/
│       │   ├── api/trpc/[trpc]/route.ts  # Single tRPC HTTP handler
│       │   ├── admin/page.tsx            # Admin referrals list + search (bonus)
│       │   ├── layout.tsx
│       │   ├── page.tsx                  # Referral form page
│       │   └── providers.tsx
│       ├── components/
│       │   └── ReferralForm.tsx
│       ├── server/
│       │   ├── db/
│       │   │   ├── index.ts              # DB connection (Neon or Docker)
│       │   │   └── schema.ts             # Drizzle table definition
│       │   ├── routers/
│       │   │   ├── index.ts              # Root AppRouter
│       │   │   └── referral.ts           # submitReferral + getReferrals
│       │   └── trpc.ts                   # tRPC initialization
│       ├── lib/trpc.ts                   # Frontend tRPC client
│       ├── drizzle.config.ts
│       ├── vitest.config.ts
│       └── package.json
├── packages/
│   └── shared/                           # Shared package — Zod schema lives here
│       ├── src/
│       │   ├── schema.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml                    # Local PostgreSQL (bonus)
├── turbo.json                            # Turborepo pipeline config
└── package.json                          # Root workspace
```

---

## Setup Options

### Option A — Neon (Cloud PostgreSQL, no local setup)

1. Go to [neon.tech](https://neon.tech), sign up, create a project
2. Copy your connection string

**`.env.local`** inside `apps/web/`:

```env
DATABASE_URL=postgresql://your_connection_string_here
```

### Option B — Docker (Local PostgreSQL)

1. Make sure Docker Desktop is running
2. From the project root:

```bash
docker compose up -d
```

**`.env.local`** inside `apps/web/`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinic_referral
```

---

## Running the Project

```bash
# 1. Install all dependencies (installs for all packages in one shot)
npm install

# 2. Push the database schema (creates the referrals table)
npm run db:push

# 3. Start the dev server
npm run dev
```

- Referral form: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Running Tests

```bash
# From root — runs all tests across all packages
npm run test

# From apps/web — run tests directly
cd apps/web
npm run test

### What's tested:

**`schema.test.ts` — Zod schema unit tests:**

- Accepts valid referral data
- Rejects missing required fields with correct error messages
- Validates phone number format
- Validates email format (patient and attorney)
- Enforces 500 character max on primaryComplaint
- Rejects unknown clinic locations or appointment types

**`referral.router.test.ts` — tRPC router unit tests:**

- `submitReferral` returns success response with referral ID
- `submitReferral` calls `db.insert` with the correct data
- `submitReferral` propagates database errors
- `submitReferral` rejects invalid input before touching the DB
- `getReferrals` returns all referrals when no filters provided
- `getReferrals` returns empty array when no data exists

---

## Key Design Decisions

### Shared Zod Schema (`packages/shared`)

The schema is a proper npm workspace package (`@clinic/shared`) imported by both the form (client validation) and the tRPC router (server validation). This guarantees the client and server always agree on data shape — zero duplication. Any future app (mobile, admin dashboard) can import the same package.

### Turborepo

Turborepo manages the build pipeline across packages. `turbo build` ensures `@clinic/shared` is built before `@clinic/web` depends on it. Caches build outputs so re-running `turbo build` after no changes is instant.

### tRPC over REST

End-to-end type safety with zero code generation. Calling `trpc.referral.submitReferral.mutateAsync(data)` gives full TypeScript autocomplete on input and output. A breaking API change becomes a compile error.

### Drizzle ORM

Lightweight, first-class TypeScript. Table schema defined as plain TS objects — types are inferred automatically, no separate type file needed for DB models.

### Vitest over Jest

Faster, native TypeScript and ESM support, compatible with Vite's ecosystem. The `vi.mock()` API replaces the database module with a fake so tests never need a real DB connection.

### Docker Compose

Provides a zero-install local database option. One command (`docker compose up -d`) gives you a real PostgreSQL instance. Data persists between restarts via a named Docker volume.

---

## Bonus Features Implemented

| Feature                                  | Location                            |
| ---------------------------------------- | ----------------------------------- |
| `getReferrals` tRPC query                | `server/routers/referral.ts`        |
| Admin list with search + status filter   | `app/admin/page.tsx`                |
| Zod schema unit tests                    | `__tests__/schema.test.ts`          |
| tRPC router unit tests (with DB mocking) | `__tests__/referral.router.test.ts` |
| Turborepo monorepo                       | `turbo.json` + `packages/shared`    |
| Docker Compose for PostgreSQL            | `docker-compose.yml`                |
```
