# DeePoints — Product Requirements Document (PRD)
## AI-Agent Task Breakdown

> **Version:** 1.0.0 | **Last Updated:** 2026-08-20  
> This document maps all requirements to agent-executable tasks.  
> Each task is scoped to be completable by an AI Agent in **under 15 minutes**.

---

## Part 1: Feature Status Dashboard

### Functional Requirements

| ID | Feature | Status | Blocker |
|---|---|---|---|
| FR-1 | Dynamic QR Generation (Staff) | ✅ Complete | — |
| FR-2 | Manual Point Adjustment (Manager) | ✅ Complete | — |
| FR-3 | Reward Catalog Management (Admin) | ✅ Complete | — |
| FR-4 | Audit & Activity Logs | ✅ Complete | — |
| FR-5 | Business Dashboard & Point Liability | ❌ Missing | No `/dashboard` endpoint |
| FR-6 | One-Time Earn Flow (Customer LIFF) | ✅ Complete | — |
| FR-7 | Redemption with 5-min Voucher Countdown Timer | ⚠️ Partial | Timer UI needs wiring to voucher `expiresAt`; voucher tx bug (TDB-1) |
| FR-8 | Transaction History (Customer LIFF) | ✅ Complete | — |

### Non-Functional Requirements

| ID | Requirement | Status | Blocker |
|---|---|---|---|
| NFR-1 | Atomic DB Transactions (Anti-Fraud) | ✅ Complete | Minor: TDB-1 in `redeemReward()` |
| NFR-2 | Rate Limit (1 scan per 30s per user) | ❌ Missing | Not implemented |
| NFR-3 | LINE Push Notification on scan | ❌ Missing | Not implemented |
| NFR-4 | High Availability (Render auto-restart) | ✅ Complete | Docker + Render config in place |

---

## Part 2: Agent Task Backlog

> Tasks are ordered by priority. Each task is independent unless marked `[DEPENDS ON: TASK-XX]`.

---

### CRITICAL — Bugs & Data Safety

---

#### TASK-01: Fix Voucher Expiry Date Calculation Bug

**File:** `api/src/services/authService.ts`  
**Priority:** 🔴 Critical  
**Estimated Time:** 5 min

**Context:**  
The `createUniqueVoucher()` method has a bug at line 71.  
`expiresAt.setDate(expiresAt.getHours() + 24)` is incorrect.  
`setDate()` sets the day of the month, not hours. It should use `setHours()`.

**Exact Change:**
```typescript
// BEFORE (BUGGY):
expiresAt.setDate(expiresAt.getHours() + 24);

// AFTER (CORRECT):
expiresAt.setHours(expiresAt.getHours() + 24);
```

**Acceptance Criteria:**
- [ ] `expiresAt` is exactly 24 hours after voucher creation time
- [ ] No other changes to the method
- [ ] TypeScript compiles without errors (`tsc --noEmit` in `api/`)

---

#### TASK-02: Fix Voucher Creation Transaction Boundary (TDB-1)

**File:** `api/src/services/customerService.ts` + `api/src/services/authService.ts`  
**Priority:** 🔴 Critical  
**Estimated Time:** 15 min

**Context:**  
In `redeemReward()`, `Auth.createUniqueVoucher()` calls `prisma.voucher.create()` using the global `prisma` client, NOT the transaction proxy `tx`. If the parent `$transaction` rolls back after voucher creation, the voucher row will persist — causing phantom vouchers without a matching point deduction.

**Task:**  
Refactor `Auth.createUniqueVoucher()` to accept an optional `tx` (Prisma transaction client) parameter. In `redeemReward()`, pass `tx` so the voucher creation is inside the atomic block.

**Acceptance Criteria:**
- [ ] `Auth.createUniqueVoucher(userId, rewardId, tx?)` accepts optional tx parameter
- [ ] When `tx` is provided, all `prisma.voucher.*` calls use `tx.voucher.*`
- [ ] `redeemReward()` passes `tx` to `createUniqueVoucher()`
- [ ] A simulated rollback scenario does NOT leave orphaned voucher rows
- [ ] TypeScript compiles without errors

---

### HIGH — Missing Non-Functional Requirements

---

#### TASK-03: Implement NFR-2 — Per-User Scan Rate Limit (1 per 30s)

**File:** `api/src/routes/customerRoutes.ts` + `api/src/controllers/customerController.ts`  
**Priority:** 🟠 High  
**Estimated Time:** 15 min

**Context:**  
The `/earn-points` endpoint currently has no rate limiting. A bad actor can submit QR codes in rapid succession. The SRS requires max 1 scan per 30 seconds per User UUID.

**Implementation Strategy (no Redis required — use in-memory map):**
```typescript
// api/src/utils/rateLimiter.ts (NEW FILE)
const userScanTimestamps = new Map<string, number>(); // userId -> lastScanMs
const SCAN_COOLDOWN_MS = 30_000;

export function checkScanRateLimit(userId: string): boolean {
  const last = userScanTimestamps.get(userId) ?? 0;
  const now = Date.now();
  if (now - last < SCAN_COOLDOWN_MS) return false; // Too soon
  userScanTimestamps.set(userId, now);
  return true;
}
```

Apply in `earnPointsController` BEFORE calling `CustomerService.earnPoints()`.

**Acceptance Criteria:**
- [ ] A user who scans twice within 30 seconds gets a `429` response on the second attempt
- [ ] Response body matches `ApiResponse.fail({ statusCode: 429, msg: '...', error_code: 'RATE_LIMITED' })`
- [ ] A user can successfully scan again after 30 seconds have elapsed
- [ ] Rate limit state is keyed by the internal User UUID (from JWT payload), NOT by IP
- [ ] TypeScript compiles without errors
- [ ] NOTE: In-memory map resets on server restart — acceptable for MVP; document this limitation

---

#### TASK-04: Implement NFR-3 — LINE Push Notification After Successful Earn

**File:** `api/src/services/customerService.ts` + `api/src/utils/lineMessaging.ts` (NEW)  
**Priority:** 🟠 High  
**Estimated Time:** 15 min

**Context:**  
After a successful QR scan and point credit, the customer should receive an instant LINE Push Message confirming their earned points. The LINE Channel Access Token is available via `process.env.LINE_CHANNEL_ACCESS_TOKEN`.

**Implementation:**
```typescript
// api/src/utils/lineMessaging.ts (NEW FILE)
import axios from 'axios';

export async function pushEarnNotification(lineId: string, pointsEarned: number, newTotal: number): Promise<void> {
  await axios.post(
    'https://api.line.me/v2/bot/message/push',
    {
      to: lineId,
      messages: [{
        type: 'text',
        text: `🎉 You earned ${pointsEarned} points!\nYour total balance: ${newTotal} points.`
      }]
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
}
```

Call `pushEarnNotification()` in `customerService.earnPoints()` AFTER the `prisma.$transaction()` resolves successfully. Use fire-and-forget (`.catch(logs.error)`) so a LINE API failure never breaks the earn flow.

**Acceptance Criteria:**
- [ ] After a successful earn, the user's LINE account receives a push message
- [ ] Push message contains points earned and new total balance
- [ ] LINE API error does NOT cause the `/earn-points` endpoint to return an error (fire-and-forget)
- [ ] `LINE_CHANNEL_ACCESS_TOKEN` is read from environment, never hardcoded
- [ ] TypeScript compiles without errors

---

### HIGH — Missing Feature: Dashboard (FR-5)

---

#### TASK-05: Create Dashboard Stats API Endpoint

**File:** `api/src/services/managerService.ts` + `api/src/controllers/adminController.ts` + `api/src/routes/adminRoutes.ts`  
**Priority:** 🟠 High  
**Estimated Time:** 15 min

**Context:**  
FR-5 requires a business dashboard showing: total registered users, total scans today, and total "point liability" (sum of all `users.total_points`).

**New Endpoint:**  
`GET /api/v1/admin/dashboard` — Requires MANAGER role minimum.

**Service Method to Add (managerService.ts):**
```typescript
public static async getDashboardStats() {
  const [totalUsers, totalPointLiability, todayScans] = await Promise.all([
    prisma.user.count(),
    prisma.user.aggregate({ _sum: { totalPoints: true } }),
    prisma.transaction.count({
      where: {
        type: 'EARN',
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    })
  ]);

  return {
    totalUsers,
    totalPointLiability: totalPointLiability._sum.totalPoints ?? 0,
    todayScans
  };
}
```

**Acceptance Criteria:**
- [ ] `GET /api/v1/admin/dashboard` returns `{ totalUsers, totalPointLiability, todayScans }`
- [ ] Endpoint requires minimum MANAGER role (call `Auth.lowestAllowRole`)
- [ ] Response uses `ApiResponse.success(data)` format
- [ ] TypeScript compiles without errors

---

#### TASK-06: Build Dashboard Stats UI Component (Admin Portal)

**File:** `admins/src/app/views/HomePage.tsx`  
**Priority:** 🟡 Medium  
**Estimated Time:** 15 min  
**DEPENDS ON: TASK-05**

**Context:**  
`HomePage.tsx` is the dashboard but currently shows static or placeholder data. Wire it to the new `GET /admin/dashboard` endpoint.

**Task:**
1. Add a `viewmodel/useDashboard.ts` hook that calls `GET /api/v1/admin/dashboard`
2. Display three stat cards: "Total Customers", "Today's Scans", "Point Liability"
3. Use Shadcn UI `Card` components with loading skeleton states

**Acceptance Criteria:**
- [ ] Three stat cards render with real data from the API
- [ ] Cards show a Shadcn `Skeleton` while loading
- [ ] Error state shows a toast notification, not a blank screen
- [ ] Data refreshes on page focus or after 60s auto-interval

---

### MEDIUM — Customer LIFF Improvements

---

#### TASK-07: Wire Voucher Countdown Timer to expiresAt (FR-7)

**File:** `customers/src/app/views/AvailableRewardsPage.tsx` (or voucher display component)  
**Priority:** 🟡 Medium  
**Estimated Time:** 10 min

**Context:**  
The SRS requires a 5-minute countdown timer displayed after redeeming a reward. The backend creates a voucher with `expiresAt` set to 24 hours from now. The countdown timer in the UI should compute remaining time from `voucher.expiresAt` — NOT a hardcoded 5-minute value.

**Task:**
1. After calling `POST /rewards/:id/redeem`, display the returned `voucher.expiresAt`
2. Create a `useCountdown(expiresAt: string)` hook that returns `{ minutes, seconds, isExpired }`
3. Render countdown as `MM:SS` format on the voucher display
4. When `isExpired`, show "Voucher Expired" state and disable the confirm button

**Acceptance Criteria:**
- [ ] Countdown timer displays remaining time calculated from `voucher.expiresAt`
- [ ] Timer updates every second via `setInterval`
- [ ] `clearInterval` is called on component unmount (no memory leaks)
- [ ] Expired state displays clearly in the UI
- [ ] TypeScript compiles without errors

---

#### TASK-08: Add Transaction Type Badges to History Page (FR-8)

**File:** `customers/src/app/views/HistoryPage.tsx`  
**Priority:** 🟡 Medium  
**Estimated Time:** 10 min

**Context:**  
The transaction history should visually distinguish EARN vs REDEEM vs CANCEL vs EXPIRED with colored badges and +/- point indicators.

**Acceptance Criteria:**
- [ ] EARN transactions show green `+N pts` badge
- [ ] REDEEM transactions show red `-N pts` badge
- [ ] CANCEL transactions show gray badge with restored points amount
- [ ] EXPIRED transactions show orange badge
- [ ] Dates are formatted as human-readable (e.g., "Aug 20, 2026")

---

### LOW — Code Quality & Security Hardening

---

#### TASK-09: Add Fastify Route Schema Validation to All Customer Endpoints

**File:** `api/src/routes/customerRoutes.ts`  
**Priority:** 🟢 Low  
**Estimated Time:** 15 min

**Context:**  
Fastify supports JSON Schema validation on route bodies and params. The customer routes currently pass raw bodies without validation. Adding schemas provides both security and auto-documented types.

**Example for `/earn-points`:**
```typescript
const earnPointsSchema = {
  body: {
    type: 'object',
    required: ['codeString'],
    properties: {
      codeString: { type: 'string', minLength: 10, maxLength: 100 }
    }
  }
};
fastify.post('/earn-points', { schema: earnPointsSchema }, earnPointsController);
```

**Acceptance Criteria:**
- [ ] All customer routes have `schema` objects with body/params validation
- [ ] Invalid requests return `400` with Fastify's built-in validation error format
- [ ] TypeScript types remain consistent with schema definitions

---

#### TASK-10: Add Production CORS Origins to server.ts

**File:** `api/src/server.ts`  
**Priority:** 🟢 Low  
**Estimated Time:** 5 min

**Context:**  
`allowedOrigins` currently only includes `localhost` URLs. Production domains must be added to unblock deployed apps.

**Acceptance Criteria:**
- [ ] Production admin portal URL added to `allowedOrigins`
- [ ] Production customer LIFF URL added to `allowedOrigins`
- [ ] Origins are loaded from environment variables (not hardcoded)

---

## Part 3: Acceptance Criteria — Critical NFRs

### NFR-1: Atomicity Contract (MUST NEVER BE BROKEN)

Every operation that modifies point balances MUST be wrapped in `prisma.$transaction()`.

**Test checklist for any QR-related change:**
- [ ] Simulate DB failure AFTER `user.update()` but BEFORE `qrCode.update()` → points increment must NOT persist
- [ ] Simulate DB failure AFTER `qrCode.update()` but BEFORE `transaction.create()` → both previous ops must rollback
- [ ] A QR code scanned twice in rapid parallel requests → only ONE succeeds (Prisma handles locking)

### NFR-2: Rate Limit Contract

**Test checklist:**
- [ ] User A scans at T=0s → 200 OK
- [ ] User A scans at T=15s → 429 RATE_LIMITED
- [ ] User A scans at T=31s → 200 OK
- [ ] User B scans at T=0s (same time as User A's second scan) → 200 OK (rate limit is per-user)

### NFR-3: Push Notification Contract

**Test checklist:**
- [ ] Successful scan at T=0 → push notification received within 3 seconds
- [ ] LINE API unavailable → scan still succeeds, notification failure is logged, no 500 returned to client

---

## Part 4: Definition of Done (DoD)

A task is **Done** when ALL of the following are true:

1. ✅ Code compiles: `cd api && tsc --noEmit` exits with code 0
2. ✅ No existing functionality is broken (manual smoke test of happy paths)
3. ✅ Follows patterns established in `AGENTS.md`
4. ✅ No raw `console.log()` — use `new Logger('ServiceName').info/error()`
5. ✅ No hardcoded secrets, URLs, or magic numbers
6. ✅ Error paths use `ApiResponse.fail()` or `ApiResponse.internalServerError()`
7. ✅ No schema.prisma changes without a migration file
