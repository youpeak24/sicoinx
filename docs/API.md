# SI Coin API Documentation

The SI Coin REST API powers all public marketing widgets, real-time price feeds, user dashboard interactions, and the administration control plane.

- **Base URL (Local)**: `http://localhost:5000/api/v1`
- **Interactive Swagger Documentation**: `http://localhost:5000/api/docs`
- **Authentication Method**: HttpOnly, SameSite Session Cookie (`sicoin_session`) or Bearer Token (`Authorization: Bearer <token>`)

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### `POST /auth/register`
Register a new standard user account.
- **Request Body**:
  ```json
  {
    "email": "investor@example.com",
    "password": "SecurePassword123!",
    "name": "Jane Doe"
  }
  ```
- **Response `(201 Created)`**:
  ```json
  {
    "success": true,
    "message": "Account created. Please check your email to verify your address.",
    "user": {
      "id": "cly123456789",
      "email": "investor@example.com",
      "name": "Jane Doe",
      "role": "USER",
      "emailVerified": false
    }
  }
  ```

### `POST /auth/login`
Authenticate an existing user and establish an HttpOnly session cookie.
- **Request Body**:
  ```json
  {
    "email": "admin@sicoin.org",
    "password": "AdminSecurePass123!"
  }
  ```
- **Response `(200 OK)`**: Sets `sicoin_session` cookie; returns user profile.

### `POST /auth/logout`
Terminates the current session and invalidates the session record in the database.

### `GET /auth/me`
Retrieve the authenticated user's current session profile and permissions.

### `POST /auth/forgot-password`
Generates a secure password reset token and routes an email notification (or dev mailbox entry).

### `POST /auth/reset-password`
Validates the reset token and updates the user's password hash.

### `GET /auth/dev-mailboxes`
Development tool: Lists in-memory captured emails (verification links, password reset tokens) during local development when no external SMTP server is attached.

---

## 2. Coin & Pricing Endpoints (`/api/v1/coin`)

### `GET /coin/price`
Returns the active reference price, 24-hour delta, and provenance information.
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "data": {
      "priceUsd": "1.250000",
      "change24h": "4.17",
      "timestamp": "2026-11-16T06:00:00.000Z",
      "provenance": "Administrator-set reference price",
      "isStale": false,
      "source": "ADMIN_MANUAL",
      "maxStaleMinutes": 60,
      "disclaimer": "Reference rate for informational purposes. Not an automated exchange quote."
    }
  }
  ```

### `GET /coin/price-history`
Returns historical observations formatted for charting or tabular display.
- **Query Parameters**:
  - `range`: `1D` | `7D` | `1M` | `1Y` | `ALL` (default: `7D`)
  - `source`: optional filter by provenance source
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cly111",
        "priceUsd": "1.200000",
        "timestamp": "2026-11-15T00:00:00.000Z",
        "provenance": "ADMIN_MANUAL",
        "note": "Scheduled bi-weekly review"
      }
    ]
  }
  ```

### `POST /coin/calculator`
Performs verified decimal conversion between USD and SI Coin.
- **Request Body**:
  ```json
  {
    "amount": "250",
    "direction": "USD_TO_SI"
  }
  ```
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "data": {
      "inputAmount": "250",
      "inputCurrency": "USD",
      "outputAmount": "200.000000",
      "outputCurrency": "SI",
      "referencePriceUsd": "1.250000",
      "timestamp": "2026-11-16T06:00:00.000Z",
      "formula": "250 / 1.250000",
      "disclaimer": "Estimate based on displayed reference price. Not an executable trade quote."
    }
  }
  ```

### `GET /coin/tokenomics`
Returns verified token allocation slices, total circulating supply, and vesting parameters.
- **Response `(200 OK)`**:
  ```json
  {
    "success": true,
    "data": {
      "totalSupply": "100000000",
      "circulatingSupply": "15000000",
      "ticker": "SI",
      "network": "Ethereum Mainnet (Planned)",
      "contractAddress": null,
      "isReconciled": true,
      "totalPercentage": "100.00",
      "allocations": [
        { "category": "Ecosystem & Community Reserve", "percentage": 35.0, "amount": 35000000, "vesting": "4-year linear unlock with 12-month cliff" },
        { "category": "Core Development & Engineering", "percentage": 25.0, "amount": 25000000, "vesting": "3-year linear unlock with 6-month cliff" },
        { "category": "Public Liquidity & Stability Pool", "percentage": 15.0, "amount": 15000000, "vesting": "100% unlocked at genesis" },
        { "category": "Strategic Early Backers", "percentage": 15.0, "amount": 15000000, "vesting": "24-month quarterly release" },
        { "category": "Foundation Treasury", "percentage": 10.0, "amount": 10000000, "vesting": "Multi-sig controlled protocol treasury" }
      ]
    }
  }
  ```

---

## 3. Public Content Endpoints (`/api/v1/content`)

- `GET /content/announcements`: Lists published project announcements with pagination.
- `GET /content/announcements/:slug`: Retrieves an announcement by its URL slug.
- `GET /content/faqs`: Retrieves categorized, admin-reviewed FAQ questions and answers.
- `GET /content/roadmap`: Retrieves project roadmap phases, target periods, and milestone statuses.
- `GET /content/ecosystem`: Retrieves registered ecosystem modules, categories, and readiness states (`AVAILABLE`, `IN_DEVELOPMENT`, `PLANNED`).
- `POST /content/newsletter`: Subscribes an email to the public newsletter list.
- `POST /content/contact`: Submits a public inquiry or contact form.

---

## 4. User Dashboard Endpoints (`/api/v1/user`)

All routes require active user authentication (`USER` role or higher).

- `GET /user/portfolio`: Aggregates the user's balances, linked wallets, and simulated testnet holdings.
- `GET /user/activity`: Paginated ledger of the user's account actions and notifications.
- `GET /user/wallets`: Lists linked Web3 public addresses.
- `POST /user/wallets/challenge`: Generates an EIP-4361 cryptographic nonce challenge for linking a wallet.
- `POST /user/wallets/verify`: Verifies the signed challenge and registers the wallet address.
- `DELETE /user/wallets/:id`: Unlinks a previously verified external wallet.
- `GET /user/support/tickets`: Lists the authenticated user's support requests.
- `POST /user/support/tickets`: Creates a new support ticket.
- `POST /user/support/tickets/:id/messages`: Appends a message to an ongoing ticket thread.

---

## 5. Administration Endpoints (`/api/v1/admin`)

Requires administrative privileges (`SUPER_ADMIN`, `FINANCE_MANAGER`, `CONTENT_EDITOR`, or `SUPPORT_AGENT` depending on route).

- `GET /admin/overview`: High-level system KPIs (active users, ticket queue, audit events, supply status).
- `POST /admin/pricing/update`: Updates the reference price; mandates a justification string and logs an immutable observation record.
- `POST /admin/pricing/schedule`: Schedules an upcoming price step with an execution timestamp.
- `POST /admin/tokenomics/allocations`: Updates the token distribution matrix (strictly validated to sum to 100%).
- `GET /admin/users`: Paginated list of registered users with role and status management.
- `PATCH /admin/users/:id/role`: Reassigns user role (restricted to `SUPER_ADMIN`).
- `GET /admin/audit-logs`: Filterable, immutable audit log of all system administrative actions.
- `GET /admin/support/tickets`: Global support queue for agent triage and resolution.
- `PATCH /admin/support/tickets/:id`: Updates ticket priority, assignee, or lifecycle state.

---

## 6. Standard Error Format

All error responses return standard JSON conforming to the following structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The allocation percentages must total exactly 100.00%. Current total: 98.50%",
    "details": [
      {
        "field": "allocations",
        "issue": "Sum shortfall of 1.50%"
      }
    ]
  },
  "timestamp": "2026-11-16T12:00:00.000Z"
}
```
