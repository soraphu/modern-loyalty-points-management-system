# DeePoints — System Architecture

> **Version:** 1.0.0 | **Last Updated:** 2026-08-20  
> Living architecture document. AI Agents must read this before touching any code.

---

## 1. System Overview

DeePoints is a **LINE-native loyalty points management system** composed of three independently deployable applications sharing a single PostgreSQL database (Supabase) via Prisma ORM.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DeePoints Ecosystem                             │
│                                                                         │
│   ┌───────────────┐      ┌───────────────┐      ┌──────────────────┐   │
│   │  admins/      │      │  customers/   │      │  api/            │   │
│   │  Vite+React   │      │  Vite+React   │      │  Fastify +       │   │
│   │  TypeScript   │      │  TypeScript   │      │  TypeScript      │   │
│   │  Tailwind CSS │      │  Tailwind CSS │      │  + Prisma ORM    │   │
│   │  Shadcn UI    │      │  Shadcn UI    │      │  PORT: 3000      │   │
│   │  (Merchant)   │      │  (LIFF App)   │      │                  │   │
│   └───────┬───────┘      └───────┬───────┘      └────────┬─────────┘   │
│           │                      │                        │             │
│           └──────────────────────┴────────────────────────┘             │
│                                  │ REST / JSON                          │
│                                  ▼                                      │
│                       ┌──────────────────┐                              │
│                       │  Fastify Routes  │                              │
│                       │  /api/v1/admin   │                              │
│                       │  /api/v1/customer│                              │
│                       └────────┬─────────┘                              │
│              ┌─────────────────┼─────────────────┐                     │
│              ▼                 ▼                  ▼                     │
│   ┌──────────────────┐  ┌──────────┐  ┌─────────────────────┐         │
│   │  Supabase /      │  │  bcrypt  │  │  LINE Messaging API  │         │
│   │  PostgreSQL DB   │  │  JWT     │  │  (Push Notifications)│         │
│   │  (Prisma ORM)    │  │  Cookies │  │  LINE LIFF SDK       │         │
│   └──────────────────┘  └──────────┘  └─────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Repository Structure (Multi-App Monorepo)

```
deepoints-source-code/              <- Git Root
├── ARCHITECTURE.md                 <- This file
├── PRD.md                          <- Product requirements & agent tasks
├── AGENTS.md                       <- AI Agent coding rules (READ FIRST)
├── SRS.md                          <- Software requirements spec
├── README.md
│
├── api/                            <- Fastify Backend Service
│   ├── Dockerfile
│   ├── prisma.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env                        <- DATABASE_URL, JWT secrets, LINE tokens
│   ├── prisma/
│   │   └── schema.prisma           <- SINGLE SOURCE OF TRUTH for DB schema
│   └── src/
│       ├── server.ts               <- Fastify bootstrap & plugin registration
│       ├── config/
│       │   ├── constants.ts        <- CONFIG object (API_PREFIX, JWT_SECRET…)
│       │   └── database.ts         <- Prisma client singleton
│       ├── routes/
│       │   ├── adminRoutes.ts      <- All /api/v1/admin/* endpoints
│       │   ├── customerRoutes.ts   <- All /api/v1/customer/* endpoints
│       │   └── apiDocs.ts
│       ├── controllers/
│       │   ├── adminController.ts  <- Request parsing + response shaping
│       │   └── customerController.ts
│       ├── services/
│       │   ├── authService.ts      <- JWT, bcrypt, refresh tokens, role hierarchy
│       │   ├── customerService.ts  <- Earn/Redeem atomic flows, LINE sync
│       │   ├── staffService.ts     <- QR gen, voucher execution, transactions
│       │   ├── managerService.ts   <- Customer mgmt, manual point adjustment
│       │   └── ownerService.ts     <- Admin CRUD, role management
│       ├── utils/
│       │   ├── apiResponse.ts      <- Standardized ApiResponse factory
│       │   ├── logger.ts           <- Logger utility
│       │   └── validation.ts       <- Shared validators (getValidatedVoucher…)
│       └── generated/
│           └── prisma/             <- Auto-generated Prisma client (DO NOT EDIT)
│
├── admins/                         <- Merchant Admin Portal (Web App)
│   ├── vite.config.ts
│   ├── components.json             <- Shadcn UI config
│   ├── .env                        <- VITE_API_BASE_URL
│   └── src/
│       ├── App.tsx                 <- Router root
│       ├── config/                 <- Axios instance, env config
│       ├── lib/                    <- Utility functions, cn()
│       ├── components/             <- Reusable Shadcn + custom components
│       └── app/
│           ├── views/              <- Full page components (one per route)
│           │   ├── LoginPage.tsx
│           │   ├── RegisterPage.tsx
│           │   ├── HomePage.tsx          <- Dashboard (FR-5)
│           │   ├── GenerateQrDialog.tsx  <- FR-1: QR Generation
│           │   ├── FindVoucherDialog.tsx <- FR-7: Voucher Settlement
│           │   ├── RewardPage.tsx        <- FR-3: Reward Catalog Management
│           │   └── AllTransactionsPage.tsx <- FR-4: Audit Logs
│           ├── models/             <- TypeScript interfaces & API types
│           └── viewmodels/         <- Business logic hooks (useXxx pattern)
│
└── customers/                      <- Customer LIFF App (LINE in-app browser)
    ├── vite.config.ts
    ├── components.json
    ├── .env                        <- VITE_API_BASE_URL, VITE_LIFF_ID
    └── src/
        ├── App.tsx                 <- Router root + LIFF init
        └── app/
            ├── views/
            │   ├── HomePage.tsx          <- Points balance + nav
            │   ├── QrScannerPage.tsx     <- Camera QR scan
            │   ├── EarningPointsPage.tsx <- FR-6: Post-scan earn confirmation
            │   ├── AvailableRewardsPage.tsx <- FR-7: Reward catalog
            │   └── HistoryPage.tsx       <- FR-8: Transaction history
            ├── models/
            └── viewmodels/
```

---

## 3. Database Schema (Prisma — Single Source of Truth)

> File: `api/prisma/schema.prisma`  
> **NEVER edit DB structure without a Prisma migration. See AGENTS.md.**

### Entity Relationships

```
Admin ─────────────────────────────────────────────┐
  │ (1:N)                                           │ adminId FK
  ▼                                                 │
QrCode ──── referenceId (in Transaction) ──────────►│
                                                    │
User ──────────────────────────────── Transaction ◄─┘
  │ (1:N)                       (1:N) │
  ▼                                   │
Voucher ──────────────────►  Reward   │
  │ (N:1)                             │
  └─── referenceId (in Transaction) ──┘

RefreshToken ──── Admin (1:1, unique adminId)
```

### Models Quick Reference

| Model | Key Fields | Notes |
|---|---|---|
| `Admin` | `id`, `role`, `username`, `passwordHashed` | Role: STAFF / MANAGER / OWNER / SYSTEM |
| `User` | `id`, `lineId` (unique), `totalPoints` | `lineId` = LINE UID string |
| `QrCode` | `hashedCodeString` (unique), `pointValue`, `used`, `expiresAt` | Raw code SHA-256 hashed before storage |
| `Transaction` | `type (EARN/REDEEM/CANCEL/EXPIRED)`, `pointsAmount`, `referenceId` | referenceId → QrCode.id or Voucher.id |
| `Reward` | `rewardName`, `pointsCost`, `imageUrl`, `active` | Filter `active: true` for customer-facing |
| `Voucher` | `voucherCode` (6-char alphanumeric, unique), `status`, `expiresAt` | 24hr validity after creation |
| `RefreshToken` | `hashedToken` (unique), `adminId` (unique, 1:1), `expiresAt` | Upsert pattern — one token per admin |

### Enum Values

| Enum | Values |
|---|---|
| `AdminRoles` | `STAFF`, `MANAGER`, `OWNER`, `SYSTEM` |
| `TransactionType` | `EARN`, `REDEEM`, `CANCEL`, `EXPIRED` |
| `VoucherStatus` | `PENDING`, `CLAIMED`, `EXPIRED`, `CANCELLED` |

---

## 4. API Design Specifications

### 4.1 Base URL & Prefix

```
Development:  http://localhost:3000/api/v1
Production:   https://<render-service>.onrender.com/api/v1
```
> Prefix is configured via `CONFIG.API_PREFIX` in `api/src/config/constants.ts`.

### 4.2 Authentication Flows

#### Admin Auth (Username/Password → JWT + HttpOnly Refresh Cookie)

```
Client                        Fastify API                    PostgreSQL
  │                               │                               │
  ├──POST /admin/login ──────────►│                               │
  │  { username, password }       │── findUnique(username) ──────►│
  │                               │◄── Admin record ──────────────┤
  │                               │── bcrypt.compare()            │
  │                               │── jwt.sign(payload, 15m)      │
  │                               │── generateRefreshToken()      │
  │                               │── upsert(refresh_tokens) ────►│
  │◄─ 200 { accessToken } ────────│                               │
  │   Set-Cookie: ARFT (httpOnly) │                               │
  │                               │                               │
  ├──GET /admin/auth/refresh ────►│  Cookie: ARFT                 │
  │                               │── hashToken(ARFT)             │
  │                               │── findUnique(hashedToken) ───►│
  │                               │◄── session + adminId ─────────┤
  │◄─ 200 { newAccessToken } ─────│                               │
```

**Admin JWT Payload:**
```typescript
{
  id: string;        // Admin UUID
  role: AdminRoles;  // STAFF | MANAGER | OWNER | SYSTEM
  username: string;
  firstname: string;
  lastname: string;
}
```

#### Customer Auth (LINE Access Token → Internal Customer JWT)

```
LINE LIFF                     Fastify API                    LINE API
  │                               │                               │
  ├──GET /customer/sync ─────────►│  Authorization: Bearer <lineAccessToken>
  │                               │── GET api.line.me/v2/profile ►│
  │                               │◄── { userId, displayName, pictureUrl }
  │                               │── prisma.user.upsert()
  │◄─ 200 { user, accessToken } ──│
```

**Customer JWT Payload:**
```typescript
{
  id: string;          // Internal User UUID (NOT lineId)
  lineId: string;      // LINE UID for push notifications
  displayName: string;
  pictureUrl: string;
  role: 'customer';
}
```

### 4.3 Role Authorization Hierarchy

```
SYSTEM (4) > OWNER (3) > MANAGER (2) > STAFF (1)
```

Enforced via `Auth.lowestAllowRole()` in `api/src/services/authService.ts`.  
Every protected endpoint MUST call this before executing business logic.

### 4.4 Complete Endpoint Map

#### Admin Endpoints (`/api/v1/admin/`)

| Method | Path | Min Role | Service | Feature |
|---|---|---|---|---|
| POST | `/register-owner` | Public | ownerService | One-time owner setup |
| GET | `/is-owner-exist` | Public | ownerService | Setup guard |
| POST | `/login` | Public | authService | Admin login → JWT |
| GET | `/auth/refresh` | Cookie | authService | Refresh access token |
| POST | `/logout` | Auth | authService | Revoke refresh token |
| GET | `/payload` | Auth | authService | Decode JWT payload |
| GET | `/profile` | Auth | authService | Full admin profile |
| POST | `/points-token` | STAFF | staffService | **FR-1**: Generate QR |
| GET | `/vouchers/:code` | STAFF | staffService | Query voucher by code |
| PATCH | `/vouchers/:code/settle` | STAFF | staffService | Mark CLAIMED |
| PATCH | `/vouchers/:code/cancel` | STAFF | staffService | Mark CANCELLED |
| GET | `/rewards` | STAFF | staffService | Fetch all rewards |
| POST | `/rewards` | MANAGER | managerService | **FR-3**: Create reward |
| DELETE | `/rewards/:id` | MANAGER | managerService | Delete reward |
| PATCH | `/rewards/:id/state-adjustment` | MANAGER | managerService | Toggle active |
| GET | `/customers` | MANAGER | managerService | **FR-2**: List customers |
| PATCH | `/customers/:id/points-adjustment` | MANAGER | managerService | **FR-2**: Manual adjust |
| GET | `/admins` | OWNER | ownerService | List admin directory |
| POST | `/admins` | OWNER | ownerService | Create admin account |
| PATCH | `/admins/:id/role-adjustment` | OWNER | ownerService | Change role |
| PATCH | `/admins/:id/password-reset` | OWNER | ownerService | Force password reset |
| DELETE | `/admins/:id` | OWNER | ownerService | Delete admin |
| GET | `/transactions` | MANAGER | staffService | **FR-4**: All transactions |
| GET | `/my-transactions` | STAFF | staffService | My own transactions |

#### Customer Endpoints (`/api/v1/customer/`)

| Method | Path | Auth | Service | Feature |
|---|---|---|---|---|
| GET | `/sync` | LINE Bearer | customerService | LINE profile upsert → JWT |
| GET | `/transactions` | Customer JWT | customerService | **FR-8**: History |
| POST | `/earn-points` | Customer JWT | customerService | **FR-6**: Atomic earn |
| GET | `/rewards` | Customer JWT | customerService | Reward catalog |
| POST | `/rewards/:id/redeem` | Customer JWT | customerService | **FR-7**: Atomic redeem |
| GET | `/pending-vouchers` | Customer JWT | customerService | Active vouchers |

### 4.5 Atomic Transaction Patterns (NFR-1)

#### Pattern A — QR Scan Earn Flow

File: `api/src/services/customerService.ts` → `earnPoints()`

```typescript
// ALL 4 operations inside ONE prisma.$transaction() — NFR-1 MANDATORY
await prisma.$transaction(async (tx) => {
  // Step 1: SELECT — find QR by hashed code
  const qrCodeRecord = await tx.qrCode.findUnique({ where: { hashedCodeString } });

  // Step 2: VALIDATE — not used, not expired
  if (qrCodeRecord.used) throw ...;
  if (new Date() > qrCodeRecord.expiresAt) throw ...;

  // Step 3: INCREMENT — user.totalPoints
  await tx.user.update({ data: { totalPoints: { increment: qrCodeRecord.pointValue } } });

  // Step 4: MARK USED — prevents double-spend
  await tx.qrCode.update({ where: { hashedCodeString }, data: { used: true } });

  // Step 5: LOG — create Transaction record
  await tx.transaction.create({ data: { type: 'EARN', ... } });
});
```

#### Pattern B — Reward Redemption Flow

File: `api/src/services/customerService.ts` → `redeemReward()`

```typescript
await prisma.$transaction(async (tx) => {
  // Step 1: VALIDATE reward (active: true)
  // Step 2: VALIDATE user.totalPoints >= reward.pointsCost
  // Step 3: DECREMENT user.totalPoints
  await tx.user.update({ data: { totalPoints: { decrement: reward.pointsCost } } });
  // Step 4: CREATE Voucher (Auth.createUniqueVoucher)
  // Step 5: Return { voucher, remainingPoints }
});
```

#### Pattern C — Voucher Execution (Staff)

File: `api/src/services/staffService.ts` → `executionVoucher()`

```typescript
await prisma.$transaction(async (tx) => {
  // Step 1: VALIDATE — voucher must be PENDING
  await Validation.getValidatedVoucher(tx, voucherCode);
  // Step 2: UPDATE — voucher.status = CLAIMED | CANCELLED
  // Step 3: LOG — Transaction record (type: REDEEM or CANCEL)
});
```

---

## 5. Security Architecture

### Token Model

| Token | Storage | Expiry | Transport |
|---|---|---|---|
| Admin Access JWT | Client in-memory | 15 min | `Authorization: Bearer` |
| Admin Refresh Token | HttpOnly Cookie (`ARFT`) | 30 days | Cookie (sameSite: none in prod) |
| Customer JWT | LIFF app memory | Configurable | `Authorization: Bearer` |
| QR Code Raw String | Never stored (in QR image only) | 5 min | Embedded in QR scan |
| QR Code Hashed | PostgreSQL `qr_codes.hashed_code_string` | 5 min | Server-side only |
| Voucher Code | PostgreSQL `vouchers.voucher_code` (plaintext 6-char) | 24 hr | Displayed on screen |

### QR Code Security Model

```
Staff generates:    uniqueCodeString = "PT-<32 random hex chars>"
Stored in DB:       hashedCodeString = SHA256(uniqueCodeString)
QR image contains:  raw uniqueCodeString
Customer scans:     sends codeString → API: SHA256 → DB lookup
```
The database NEVER stores the raw scannable string.

---

## 6. Infrastructure & Deployment

### Docker (api/)

```dockerfile
# api/Dockerfile — Multi-stage build
# Stage 1: Build TypeScript → dist/
# Stage 2: Production image (node:alpine)
# CMD: node dist/server.js
```

### Render Deployment

- **Backend API**: Docker Web Service on Render (NFR-4: auto-restart on crash)
- **Admin Portal**: Static Site deployment (Render or Vercel)
- **Customer LIFF**: Static Site, URL registered in LINE LIFF settings

### CORS Whitelist (server.ts)

```typescript
const allowedOrigins = [
  'http://localhost:5173',  // customers dev
  'http://localhost:5174',  // admins dev
  // Add production URLs here
];
```

### Environment Variables

#### `api/.env`
```env
# Token expiry
ACC_TOKEN_EXPIRY='15d'

# JWT signing secret
JWT_SECRET=<secret>

# Server port
PORT=3000

# Supabase connection (pgBouncer pooled — used by Prisma at runtime)
DATABASE_URL="postgresql://<user>:<password>@<host>:6543/<db>?pgbouncer=true"

# Supabase direct connection (used for Prisma migrations)
DIRECT_URL="postgresql://<user>:<password>@<host>:5432/<db>"

# LINE Messaging API — add when implementing NFR-3 push notifications
# LINE_CHANNEL_ACCESS_TOKEN=<token>
```

> **Note:** `SALT_ROUNDS`, `LINE_API`, and `NODE_ENV` are not currently in `.env` — they either use
> Prisma/library defaults or are planned additions. Add them when needed.

#### `admins/.env`
```env
# Run mode flag (consumed by frontend logic)
VITE_ISDEV_MODE=true

# Admin-scoped API base URL (note: suffix is /admin, not /api/v1)
VITE_API_BASE_URL=https://<api>.onrender.com/api/v1/admin

# Production customer app URL (used for QR deep-link generation)
VITE_CUSTOMER_SIDE_URL=https://<customer-app>.onrender.com/earn-points
```

#### `customers/.env`
```env
# Run mode flag
VITE_ISDEV_MODE=true

# Customer-scoped API base URL (note: suffix is /customer, not /api/v1)
VITE_API_BASE_URL=https://<api>.onrender.com/api/v1/customer

# LIFF ID — add when registering the LIFF app in LINE Developers Console
# VITE_LIFF_ID=<liff-id>
```

---

## 7. Known Issues & Technical Debt

> AI Agents: review and do NOT make these issues worse.

| ID | Issue | File | Impact |
|---|---|---|---|
| TDB-1 | `Auth.createUniqueVoucher()` runs `prisma.voucher.create()` **outside** the interactive tx in `redeemReward()` — voucher may persist if TX rolls back | `authService.ts:93`, `customerService.ts:236` | Data inconsistency |
| TDB-2 | **NFR-2 not implemented** — no `@fastify/rate-limit` or per-user throttle on `/earn-points` (1 scan per 30s rule missing) | `customerRoutes.ts` | Anti-fraud gap |
| TDB-3 | **NFR-3 not implemented** — no LINE Push Notification call after successful `earnPoints()` | `customerService.ts:154` | UX gap |
| TDB-4 | **FR-5 incomplete** — no `/dashboard` endpoint aggregating total users, daily scan count, total point liability | Missing endpoint | Feature gap |
| TDB-5 | Voucher expiry bug — `expiresAt.setDate(expiresAt.getHours() + 24)` should be `setHours(getHours() + 24)` | `authService.ts:71` | Incorrect expiry |
