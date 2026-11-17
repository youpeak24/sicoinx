# SI Coin — Ecosystem Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.20-2d3748.svg)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

> **A Clearer Way to Explore Digital Value.**  
> Discover SI Coin through transparent information, verifiable reference pricing, simple tools, and one connected ecosystem.

---

## 🌟 Executive Overview

**SI Coin** is a comprehensive digital-asset platform combining a public marketing website, real-time reference price tracking, interactive decimal token calculators, non-custodial user dashboards, and an enterprise administration console at `/admin`.

Engineered with a **light-theme fintech visual identity** (`#175CFF` primary blue, `#123B9A` deep blue, `#F7FAFF` pale canvas), SI Coin prioritizes clarity, data provenance, and mathematical rigor over speculative crypto tropes.

### Key Architectural Pillars
- **Zero Fabricated Metrics**: No manufactured 24h trading volumes, speculative APYs, or false exchange listings.
- **Strict Non-Custodial Boundary**: Zero private keys or seed phrases stored or requested. External Web3 wallets are linked via cryptographic EIP-4361 signature challenge verification.
- **Exact Decimal Arithmetic**: All conversions and financial equations run through `Decimal.js` to eliminate IEEE-754 floating-point rounding drift.
- **Immutable Price Observations**: Reference rates are strictly auditable; past observations cannot be deleted, and corrections record full provenance with superseded links.
- **Mathematical Tokenomics Reconciliation**: Token allocation slices must mathematically balance to **exactly 100.00%** before publication is permitted.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Super Admins, Finance Managers, Content Editors, Support Staff, and Users.

---

## 🚀 Quick Start (Local Run)

The platform is configured for zero-configuration local operation using SQLite.

### 1. Prerequisites
- **Node.js**: v18.0.0+ (Tested on v20.18.0)
- **npm**: v9.0.0+

### 2. Setup & Seed
```bash
# Clone repository
cd sicoin

# Install dependencies
npm install

# Build shared contracts and decimal engine
npm run build -w packages/shared

# Initialize database and apply seed data
npm run db:generate -w apps/api
npm run db:migrate -w apps/api
npm run db:seed -w apps/api
```

### 3. Launch Services
```bash
# Run API server (port 5000)
npm run start -w apps/api

# In another terminal: run Vite frontend client (port 3000)
npm run dev -w apps/web
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.  
Interactive Swagger API documentation is available at **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**.

---

## 🔐 Staff Accounts

The seed creates **staff accounts only** (no demo customers, balances or sample records). Customers sign up themselves.

| Role | Email | Access Level |
|---|---|---|
| **Super Admin** | `admin@sicoin.org` | Full control of `/admin`, users, and audits |
| **Finance Manager** | `finance@sicoin.org` | Reference pricing and tokenomics allocations |
| **Content Editor** | `editor@sicoin.org` | Announcements, FAQs, roadmap, ecosystem |
| **Support Agent** | `support@sicoin.org` | Customer support queue and tickets |

Passwords are never committed. Set `INITIAL_ADMIN_PASSWORD`, `INITIAL_FINANCE_PASSWORD`, `INITIAL_EDITOR_PASSWORD` and
`INITIAL_SUPPORT_PASSWORD` in `apps/api/.env` before seeding, or leave them unset and the seed generates random
passwords and prints them **once**. `RESET_STAFF_PASSWORDS=true npm run db:seed -w apps/api` re-applies them.

For Firebase sign-in, create the matching accounts and role documents with `scripts/firebase/create-staff.mjs`
(see the comment at the top of that file).

> **Development Mailbox**: During local testing, verification emails and password reset links are intercepted and displayed in the in-app **Dev Mailbox** modal (floating button on bottom-right) or at `GET /api/v1/auth/dev-mailboxes`.

---

## 🧭 Project Navigation & Routes

### Public Pages
- `/` — Homepage: Hero with live price widget, Token Value Calculator, Ecosystem preview, Roadmap timeline, Announcements, and FAQ.
- `/about` — Editorial mission, core principles, and non-custodial architectural boundaries.
- `/market` — Real-time price metrics, interactive Recharts price history chart, time range filters, and provenance data table.
- `/tokenomics` — 100% reconciled allocation chart, supply parameters, and linear vesting schedules.
- `/ecosystem` — Modular ecosystem matrix with categorized readiness states (`AVAILABLE`, `IN_DEVELOPMENT`, `PLANNED`).
- `/roadmap` — Project phases, targets, and milestones.
- `/whitepaper` — Formal technical specification and architectural overview.
- `/announcements` & `/announcements/:slug` — Official project news and updates.
- `/faq` — Searchable, categorized knowledge base.
- `/contact` — Secure inquiry submission.
- `/terms`, `/privacy`, `/risk-disclosure` — Financial disclosures and privacy policies.

### User Dashboard (`/dashboard`)
- `/dashboard` — Portfolio overview, active holdings, linked addresses, and quick actions.
- `/dashboard/portfolio` — Detailed asset allocation and simulated testnet balances.
- `/dashboard/activity` — Complete personal audit trail and notification center.
- `/dashboard/wallets` — Non-custodial Web3 wallet linking via cryptographic signature verification.
- `/dashboard/support` & `/dashboard/support/:id` — Support ticket management and live agent messaging.
- `/dashboard/security` — Session management, password updates, and security logs.

### Administration Console (`/admin`)
- `/admin` — System overview, active user metrics, support queue health, and coin KPIs.
- `/admin/pricing` — Manage reference price, provenance notes, and view real-time calculations.
- `/admin/price-history` — Immutable audit trail of all historical price points with superseded record linkages.
- `/admin/tokenomics` — Allocation matrix with strict 100% balance validation.
- `/admin/announcements` & `/admin/faq` — Content publishing and management.
- `/admin/roadmap` & `/admin/ecosystem` — Milestone tracking and ecosystem module status updates.
- `/admin/users` — Role management (`SUPER_ADMIN`, `FINANCE_MANAGER`, etc.) and account status.
- `/admin/support` — Enterprise support triage queue.
- `/admin/audit-logs` — Indelible log of all system mutations with user, IP, and JSON diffs.

---

## 📚 In-Depth Documentation

- 🏛️ **[System Architecture Guide](docs/ARCHITECTURE.md)**: Monorepo design, non-custodial boundaries, data provenance, and exact decimal arithmetic engine.
- 📡 **[REST API Specification](docs/API.md)**: Complete endpoint documentation, request/response schemas, and Swagger UI integration.
- 🛠️ **[Operations & Runbook](docs/RUNBOOK.md)**: Local development setup, Docker multi-container deployment, environment variables, and troubleshooting.

---

## 🧪 Testing & Verification

Run the comprehensive test suite (unit and integration tests covering decimal precision, stale detection, password hashing, and tokenomics reconciliation):

```bash
# Run backend tests
npm test -w apps/api

# Run TypeScript compilation checks across all workspaces
npm run build -w packages/shared
npm run build -w apps/web
```

---

## 📄 License
This project is licensed under the MIT License.
