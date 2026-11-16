# SI Coin Platform Architecture Documentation

## 1. System Overview & Monorepo Structure

SI Coin is a modern, transparent digital-asset ecosystem platform built with a strict separation of concerns, enterprise-grade auditability, and a light-theme fintech visual identity. The system is architected as a TypeScript monorepo using npm workspaces:

```
sicoin/
├── apps/
│   ├── api/                 # Node.js + Express + Prisma REST API
│   │   ├── prisma/          # Prisma ORM schema, migrations, and seed scripts
│   │   ├── src/
│   │   │   ├── docs/        # OpenAPI / Swagger specifications (/api/docs)
│   │   │   ├── lib/         # Core singletons: Prisma, Audit, Mailer, Security, PricingService
│   │   │   ├── middleware/  # Auth (HttpOnly cookie session + RBAC), ErrorHandler, RateLimiter
│   │   │   ├── routes/      # Modular REST routers (auth, coin, content, user, admin, public)
│   │   │   └── index.ts     # Express server bootstrap & graceful shutdown
│   │   └── test/            # Vitest unit & integration test suite
│   │
│   └── web/                 # React 18 + Vite + TypeScript frontend
│       ├── public/          # Static assets including custom SVG SI Monogram
│       └── src/
│           ├── components/  # Atomic and composite UI components (Navbar, Footer, Charts, Calculator)
│           ├── context/     # AuthContext (session state, RBAC helpers)
│           ├── layouts/     # PublicLayout, DashboardLayout, AdminLayout
│           ├── lib/         # Axios API client, queryClient
│           └── pages/       # Public routes, Dashboard views, Admin management consoles
│
├── packages/
│   └── shared/              # Shared TypeScript contracts & business math
│       └── src/
│           ├── constants.ts # System constants, role permissions, default coin configuration
│           ├── math.ts      # Exact decimal arithmetic engine (Decimal.js)
│           ├── schemas.ts   # Zod validation schemas for forms & API payloads
│           └── types.ts     # Shared TypeScript interfaces & enums
│
├── docs/                    # Architecture, API, and operational runbooks
├── docker-compose.yml       # Production multi-container composition (PostgreSQL + API + Web)
└── .env.example             # Documented environment variables template
```

---

## 2. Design System & Visual Direction

The platform implements a light-theme fintech identity, eschewing dark crypto tropes, neon glow effects, and speculative hype in favor of clarity, precision, and trust.

### 2.1 Color Palette Tokens
| Token | Hex Value | Purpose |
|---|---|---|
| **Primary Blue** | `#175CFF` | Primary actions, brand accents, active states |
| **Deep Blue** | `#123B9A` | Hero accents, high-contrast headings, CTA sections |
| **Main Text** | `#10213A` | High-contrast body text and primary typography |
| **Secondary Text**| `#64748B` | Subtle captions, metadata, timestamps, table subheaders |
| **White** | `#FFFFFF` | Primary surface background, card surfaces |
| **Main Background**| `#F7FAFF`| Base canvas background for generous negative space |
| **Pale Blue Surface**| `#EDF4FF`| Accent cards, pill badges, hero backgrounds, subtle borders |
| **Border Slate** | `#DFE8F5` | Crisp 1px container borders and dividers |
| **Success Green** | `#15803D` | Positive price movements, active modules, confirmed status |
| **Warning Amber** | `#B45309` | Demo data indicators, pending items, staged price notices |
| **Error Red** | `#DC2626` | Destructive actions, validation errors, stale price warnings |

### 2.2 Typography & Numerals
- **Typeface**: Modern sans-serif hierarchy (Inter system font stack) with clean optical tracking.
- **Tabular Numerals**: Financial figures, price tickers, and allocation percentages utilize `font-variant-numeric: tabular-nums` to eliminate jitter during real-time updates.
- **Monogram Asset**: Custom typographic SVG monogram (`/si-monogram.svg`) featuring a modern geometric ligature of 'S' and 'I' bounded by precision orbital contours.

---

## 3. Non-Custodial Boundaries & Cryptographic Security

SI Coin is designed from the ground up as a **strictly non-custodial** ecosystem:

1. **Zero Private Keys or Seed Phrases**: The platform backend never requests, accepts, or stores private keys, mnemonic phrases, or transaction signing permissions.
2. **Cryptographic Nonce Challenge for Wallet Linking**:
   - When a user links an external Web3 wallet (e.g., MetaMask, Rabby, Coinbase Wallet), the server generates a time-bounded cryptographic nonce (`/api/v1/user/wallets/challenge`).
   - The user signs an EIP-4361 / SIWE formatted message (`Sign this message to link your wallet to SI Coin: {nonce}`).
   - The backend verifies the cryptographic signature against the public address using `ethers.verifyMessage()` before recording the link.
   - Nonces expire in 10 minutes and can only be consumed once.
3. **Read-Only / Testnet Boundary**: Blockchain transactions and smart contract executions are disabled by default until explicitly enabled by an operator in production configuration with verified contracts.

---

## 4. Mathematical Precision & Financial Calculations

Floating-point arithmetic introduces rounding drift (e.g., `0.1 + 0.2 !== 0.3`) which is intolerable in financial systems. SI Coin enforces exact decimal arithmetic across both client and server via `decimal.js`:

### 4.1 Token Value Calculator Logic
For converting USD to SI:
$$\text{estimated SI} = \frac{\text{USD amount}}{\text{Reference Price}}$$

For converting SI to USD:
$$\text{estimated USD} = \text{SI amount} \times \text{Reference Price}$$

### 4.2 Precision Constraints & Stale Detection
- **Reference Price Precision**: Fixed to 6 decimal places (e.g., `$1.250000`).
- **Token Amount Precision**: Computed up to 6 decimal places with truncated floor rounding (`Decimal.ROUND_DOWN`) to prevent fractional over-estimation.
- **Stale Price Invalidation**: If the latest price observation has a timestamp older than `maxStaleMinutes` (default: 60 minutes) or is marked inactive, the calculation engine halts and displays an explicit `PRICE_STALE` warning rather than emitting unverified estimations.

### 4.3 100% Token Allocation Reconciliation
The tokenomics configuration mandates that token allocations must sum to **exactly 100.00%** (and corresponding token amounts must equal exactly $100,000,000\text{ SI}$ total supply) before any allocation set can be published. If any allocation is modified, the backend validates that $\sum \text{percentage} = 100$ within a $0.0001\%$ tolerance.

---

## 5. Data Provenance & Immutable Audit Log

Trust and transparency require an indelible history of all price points and administrative interventions:

1. **Immutable Price Observations**:
   - Records in the `PriceObservation` table are **never deleted or mutated**.
   - If an administrator corrects a past erroneous observation, a new `PriceObservation` row is inserted with `supersededById` pointing to the prior entry, recording the author, justification, timestamp, and previous value.
   - Each observation captures its exact provenance source: `ADMIN_MANUAL`, `ORACLE_AGGREGATE`, `SCHEDULED_STEP`, or `DEX_LIQUIDITY`.
2. **Comprehensive Audit Events**:
   - Every administrative modification across coin configuration, tokenomics, user status, announcements, and support resolutions creates an unalterable `AuditEvent` row.
   - Captures: `userId`, `action`, `entityType`, `entityId`, `oldValues` (JSON), `newValues` (JSON), `ipAddress`, and `userAgent`.

---

## 6. Role-Based Access Control (RBAC) Matrix

The system implements fine-grained RBAC enforced at the API route middleware level:

| Permission | SUPER_ADMIN | FINANCE_MANAGER | CONTENT_EDITOR | SUPPORT_AGENT | USER |
|---|:---:|:---:|:---:|:---:|:---:|
| **Manage Pricing & Reference Rates** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Manage Tokenomics Allocations** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Publish Announcements & FAQs** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Update Roadmap & Ecosystem** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Manage Support Tickets** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Manage Users & Role Assignments** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View Audit Logs & System Health**| ✅ | ✅ (Audit only) | ❌ | ❌ | ❌ |
| **Manage Personal Dashboard & Wallet**| ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 7. Security Architecture

- **Session Management**: Cryptographically signed HttpOnly, SameSite=Strict cookies protect against XSS token theft. Sessions automatically expire after 7 days of inactivity.
- **CSRF & Rate Limiting**: Sensitive auth endpoints are rate-limited via express sliding-window rate limiters (e.g., maximum 5 failed login attempts per 15 minutes per IP).
- **Password Hashing**: User passwords are salt-hashed using `bcrypt` with 12 computational rounds.
- **Input Sanitization & Schema Validation**: Every API payload is validated against strict Zod schemas with unknown keys stripped.
- **Error Sanitization**: Production error responses mask internal database errors and stack traces, returning structured RFC-7807 compliant error payloads.
