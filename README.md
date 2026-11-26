# Networthy

A personal finance tracker: accounts in several currencies, income and expenses by category, transfers between accounts (including currency exchange), and live balances.

**Live demo:** https://networthy-x5am.onrender.com — click **Try demo** on the sign-in page to get your own sandbox account with two months of sample data. No registration needed.

> Hosted on a free tier: if the site has been idle, the first load can take up to a minute while the server wakes up.

I built Networthy for two reasons. First, to practice the stack I've used in commercial projects and to really understand it: not just make things work, but know why each piece is there. Second, I needed it myself. I keep my savings spread across different banks, currencies and assets, and without a tracker I never had a clear picture of my net worth.

## Features

- **Accounts** in USD, EUR and UAH with balances computed from transactions
- **Categories** for income and expenses
- **Transactions**: create, list and delete income/expense records
- **Transfers** between accounts, including cross-currency transfers with separate sent and received amounts
- **Demo mode**: every visitor gets an isolated, pre-filled account; old demo users are cleaned up automatically
- **Auth**: email + password, JWT in an httpOnly cookie

## Tech stack

| Layer    | Tools                                                                                                    |
| -------- | -------------------------------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query, React Hook Form + Zod, Tailwind CSS, Motion    |
| Backend  | Node.js, Express 5, TypeScript, Prisma 7, Zod, bcrypt, JSON Web Tokens                                   |
| Database | PostgreSQL (Docker locally, Neon in production)                                                          |
| Quality  | Vitest + Supertest integration tests on a separate test database, Oxlint (type-aware), GitHub Actions CI |
| Hosting  | Render (one service serves both the API and the built frontend)                                          |

## Design decisions

- **Balances are computed, not stored.** An account balance is a sum of its transactions (`groupBy` for the list, so no N+1 queries). Nothing can get out of sync.
- **A transfer is two records** (`TRANSFER_OUT` + `TRANSFER_IN`) linked by a shared `transferId` and written in one database transaction, so a transfer is never half-saved.
- **Ownership checks everywhere.** Every query filters by the current user through relations; someone else's record returns `404`, not `403`, so IDs can't be probed.
- **One origin.** In production Express serves the API under `/api` and the frontend for every other path. The auth cookie stays first-party, so no CORS or third-party cookie issues; in development the Vite dev server proxies `/api` the same way.
- **Security basics:** httpOnly + `secure` cookies, `helmet`, rate limits (stricter on login, register and demo), input validation with Zod on both sides.

## Running locally

Requirements: Node.js 24, Docker.

```bash
git clone https://github.com/konorque/networthy.git
cd networthy
cp .env.example .env          # set your own password (in POSTGRES_PASSWORD and both URLs)
                              # and a JWT_SECRET of at least 32 random characters
docker compose up -d          # PostgreSQL on 127.0.0.1:5433

cd backend
npm ci
npx prisma migrate dev        # creates tables
npm run dev                   # API on http://localhost:3000/api

cd ../frontend                # in a second terminal
npm ci
npm run dev                   # app on http://localhost:5173
```

Tests (use a separate `networthy_test` database, reset before each run):

```bash
cd backend
npm test
```

## Project structure

```
backend/
  prisma/              schema and migrations
  src/
    modules/<feature>/ routes → controller → service, plus schemas and tests
    middleware/        auth guard, rate limits, error handler
frontend/
  src/
    pages/             one file per screen
    components/        shared UI (dialog, form error, transfer form)
    lib/               API client, money formatting, shared styles
```

## Roadmap

- [x] **Stage 1** — accounts, categories, transactions, transfers, demo mode, deploy
- [ ] **Stage 2** — assets (deposits, funds, crypto) and net worth in USD/EUR with exchange rates from public APIs (cached in Redis)
- [ ] **Stage 3** — returns (simple and compound with inflation) and net worth history with charts
- [ ] **Stage 4** — risk and allocation reports
