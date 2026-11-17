# SI Coin Operations & Deployment Runbook

This guide covers local development workflows, production multi-container orchestration with Docker, database migrations, security configurations, and common troubleshooting procedures.

---

## 1. Quick Start (Local Development)

### 1.1 Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Git**

### 1.2 Installation & Build
```bash
# Clone the repository
git clone https://github.com/your-org/sicoin.git
cd sicoin

# Install all workspace dependencies
npm install

# Build shared types and calculation engine
npm run build -w packages/shared

# Initialize the SQLite local database & generate Prisma client
npm run db:generate -w apps/api
npm run db:migrate -w apps/api

# Seed the database with administrative accounts, pricing, and ecosystem data
npm run db:seed -w apps/api
```

### 1.3 Running Development Servers
In separate terminal windows (or using a process manager):

```bash
# Terminal 1: Start Backend API (runs on http://localhost:5000)
npm run dev -w apps/api

# Terminal 2: Start Frontend Web Client (runs on http://localhost:3000)
npm run dev -w apps/web
```

---

## 2. Bootstrapped Staff Accounts

The seed script (`apps/api/prisma/seed.ts`) creates one staff account per administrative RBAC tier. It creates no customer
accounts, balances, orders, tickets or announcements.

| Role | Email | Access Level |
|---|---|---|
| **Super Admin** | `admin@sicoin.org` | Full control of `/admin`, users, and audits |
| **Finance Manager** | `finance@sicoin.org` | Reference pricing and tokenomics allocations |
| **Content Editor** | `editor@sicoin.org` | Announcements, FAQs, roadmap, ecosystem |
| **Support Agent** | `support@sicoin.org` | Customer support queue and tickets |

Passwords come from `INITIAL_*_PASSWORD` in `apps/api/.env`; if unset they are generated randomly and printed once at the end
of seeding. Ecosystem partner API credentials are also generated at seed time and printed once.

> [!CAUTION]
> In production deployments, change all default passwords immediately and configure dedicated MFA/SSO according to organizational security policy.

---

## 3. Email & Local Development Mailbox

During local development, no third-party SMTP server (e.g., SendGrid, AWS SES) is required:
1. When a user registers or triggers a password reset, the token and formatted email are intercepted by an in-memory development mailer.
2. In the web application interface, click the floating **"Dev Mailbox"** button (bottom right) or navigate to `http://localhost:5000/api/v1/auth/dev-mailboxes` to view generated verification and reset links.
3. In production, configure standard SMTP environment variables:
   ```ini
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-key
   SMTP_FROM="SI Coin Support <support@sicoin.org>"
   ```

---

## 4. Production Deployment with Docker Compose

For production environments, the repository includes a complete `docker-compose.yml` orchestrating PostgreSQL, the Node.js API, and Nginx serving the compiled React client:

```bash
# 1. Copy and customize the production environment file
cp .env.example .env

# 2. Review and adjust DB credentials and JWT/Cookie secrets in .env
nano .env

# 3. Spin up all containers in detached mode
docker compose up -d --build

# 4. Run database migrations inside the API container
docker compose exec api npx prisma migrate deploy

# 5. Optionally seed baseline data if this is a fresh setup
docker compose exec api npx tsx prisma/seed.ts
```

### Multi-Container Network Topology:
- `db`: PostgreSQL 16 on internal network (`postgres:5432`)
- `api`: Node.js Express server running on port `5000`
- `web`: Nginx reverse proxy serving compiled static assets on port `80`/`443` and forwarding `/api` to the backend

---

## 5. Environment Variables Reference

| Variable | Default Value | Description |
|---|---|---|
| `NODE_ENV` | `development` | Environment mode (`development` or `production`) |
| `PORT` | `5000` | Backend listening port |
| `DATABASE_URL` | `file:./dev.db` (local) | Prisma connection string (PostgreSQL in production) |
| `SESSION_SECRET` | `sicoin_dev_secret_key_change_me` | Cryptographic secret for signing session cookies |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed origin for frontend requests |
| `ENABLE_BLOCKCHAIN_SYNC` | `false` | Gatekeeper flag: enables live RPC calls when verified |
| `RPC_ENDPOINT` | `""` | Ethereum/Sepolia JSON-RPC node URL (when enabled) |
| `CONTRACT_ADDRESS` | `""` | SI Token ERC-20 contract address (when deployed) |
| `MAX_PRICE_STALE_MINUTES` | `60` | Invalidation threshold for reference price freshness |

---

## 6. Operational Procedures & Troubleshooting

### 6.1 Database Reset & Re-seed
To wipe local development state and restore fresh baseline seed data:
```bash
# In apps/api directory:
npx prisma migrate reset --force
npm run db:seed
```

### 6.2 Stale Price Alerts on UI
If the calculator or hero banner indicates `PRICE_STALE`:
1. Log in to the Admin Panel (`/admin`) as `admin@sicoin.org` or `finance@sicoin.org`.
2. Navigate to **Pricing & Reference** (`/admin/pricing`).
3. Enter the current verified reference rate, provide an administrative justification note (e.g., "Regular market review"), and click **Publish Update**.
4. The calculation engine will immediately acknowledge the fresh timestamp.

### 6.3 Verifying Audit Integrity
To verify the audit log:
```bash
# View recent administrative changes via curl or API client:
curl -b cookies.txt http://localhost:5000/api/v1/admin/audit-logs
```
Every change record displays the authenticated user, the exact JSON diff of modified attributes, and the originating IP address.
