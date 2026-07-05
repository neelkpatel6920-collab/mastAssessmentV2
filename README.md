# MAST Gujarati Test Web App

Two-app Next.js monorepo for the Gujarati MAST work-style test.

## Apps

- `apps/participant`: public test and personal result PDF.
- `apps/admin`: protected role-scoped dashboard and exports.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

Participant app runs on port `3000`; admin app runs on port `3001`.
