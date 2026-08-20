# DeePoints — AI Agent Rules & Coding Boundaries

> **Version:** 1.0.0 | **Last Updated:** 2026-08-20  
> These rules are NON-NEGOTIABLE. Every AI Agent working in this repository MUST follow them.  
> Violations can cause data loss, security breaches, or fraud exposure.

---

## 0. Onboarding Checklist (Read Before Writing Any Code)

Before touching any file, read these documents in order:

1. `ARCHITECTURE.md` — System overview, directory structure, DB schema, API map
2. `PRD.md` — Feature status, task backlog, acceptance criteria
3. `SRS.md` — Original software requirements
4. `api/prisma/schema.prisma` — The database schema (never edit without migration)
5. `api/src/server.ts` — Fastify bootstrap and plugin registration order

---

## 1. Database Rules

### RULE-DB-1: NEVER Modify Schema Without a Migration

```
❌ FORBIDDEN:
  - Editing api/prisma/schema.prisma and running prisma db push
  - Directly issuing ALTER TABLE or DROP COLUMN in SQL

✅ REQUIRED process:
  1. Edit api/prisma/schema.prisma
  2. Run: cd api && npx prisma migrate dev --name <descriptive_name>
  3. Commit BOTH schema.prisma AND the generated migration SQL file
  4. Run: npx prisma generate (to regenerate the client)
```

### RULE-DB-2: ALWAYS Use Atomic Transactions for Point-Balance Operations

Any code path that reads AND writes `users.total_points` MUST use `prisma.$transaction()`.

```typescript
// ✅ CORRECT — all point mutations inside a single atomic block
await prisma.$transaction(async (tx) => {
  await tx.user.update({ data: { totalPoints: { increment: N } } });
  await tx.qrCode.update({ data: { used: true } });
  await tx.transaction.create({ data: { type: 'EARN', ... } });
});

// ❌ FORBIDDEN — point mutation outside a transaction
await prisma.user.update({ data: { totalPoints: { increment: N } } }); // NEVER alone
```

This rule applies to ALL of the following operations:
- QR code scanning and point crediting (`customerService.earnPoints`)
- Reward redemption (`customerService.redeemReward`)
- Voucher execution/cancellation (`staffService.executionVoucher`)
- Manual point adjustment (`managerService`)

### RULE-DB-3: Never Use the Global Prisma Client Inside an Active Transaction

```typescript
// ❌ FORBIDDEN — mixing global prisma inside a tx block
await prisma.$transaction(async (tx) => {
  await tx.user.update(...);
  await prisma.voucher.create(...); // BUG: global prisma bypasses tx isolation
});

// ✅ CORRECT — use tx for all operations inside the transaction block
await prisma.$transaction(async (tx) => {
  await tx.user.update(...);
  await tx.voucher.create(...);
});
```

### RULE-DB-4: Never Expose Raw Database Errors to the Client

```typescript
// ❌ FORBIDDEN
catch (error) { reply.send(error); }

// ✅ REQUIRED — use the ApiResponse factory
catch (error: any) {
  if (error.payload) throw error; // Re-throw known ApiResponse errors
  throw ApiResponse.internalServerError('Descriptive safe message');
}
```

---

## 2. Security Rules

### RULE-SEC-1: NEVER Bypass LINE ID Token Validation for Customer Endpoints

All `/api/v1/customer/*` endpoints that perform write operations (earn, redeem) MUST validate the user's identity via the customer JWT issued after a successful `/customer/sync` call. The JWT is signed by the server — do NOT accept a raw LINE user ID from the request body as proof of identity.

```typescript
// ❌ FORBIDDEN — trusting client-supplied lineId
const { lineId } = request.body; // Never use this as identity proof

// ✅ REQUIRED — decode verified JWT
const payload = Auth.verifyAndDecodeAccessToken<CustomerTokenPayload>(token);
const userId = payload.id; // Internal UUID, verified by server signature
```

### RULE-SEC-2: Never Store Raw Tokens or Passwords

```typescript
// ❌ FORBIDDEN
await prisma.qrCode.create({ data: { codeString: rawCode } });
await prisma.admin.create({ data: { password: rawPassword } });

// ✅ REQUIRED — always hash before storage
const hashedCode = await Auth.hashToken(rawCode);       // SHA-256
const hashedPass = await Auth.hashPassword(rawPassword); // bcrypt
```

### RULE-SEC-3: Role Authorization is MANDATORY on All Non-Public Endpoints

Every protected endpoint controller MUST call `Auth.lowestAllowRole()` with the appropriate minimum role before executing business logic.

```typescript
// ✅ Correct pattern — verify role before proceeding
export const createRewardController = async (request, reply) => {
  const { id: adminId } = Auth.verifyAndDecodeAccessToken(getToken(request));
  await Auth.lowestAllowRole({ adminId, lowestAllowRole: AdminRoles.MANAGER });
  // ... business logic
};
```

Role hierarchy (from highest to lowest clearance):
```
SYSTEM (4) > OWNER (3) > MANAGER (2) > STAFF (1)
```

### RULE-SEC-4: Never Hardcode Secrets

```typescript
// ❌ FORBIDDEN
const secret = 'my-jwt-secret-123';
const token = 'ChannelAccessToken_abc123';

// ✅ REQUIRED — always from environment
const secret = process.env.JWT_SECRET;
const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
```

---

## 3. TypeScript Rules

### RULE-TS-1: Strict Types — No `any` in Service Layer

The service files (`api/src/services/*.ts`) MUST use explicit TypeScript interfaces and types. `any` is only permitted in `catch` blocks for error handling.

```typescript
// ❌ FORBIDDEN in service methods
public static async fetchCustomers(): Promise<any> { ... }
public static async earnPoints(userId: any, code: any) { ... }

// ✅ REQUIRED — explicit types
public static async earnPoints(userId: string, codeString: string): Promise<Transaction> { ... }
```

### RULE-TS-2: Use Generated Prisma Enums — Never String Literals

```typescript
// ❌ FORBIDDEN — raw string literals for enum values
await tx.transaction.create({ data: { type: 'EARN' } }); // fragile
await tx.voucher.update({ data: { status: 'CLAIMED' } }); // typo risk

// ✅ REQUIRED — import and use generated enums
import { TransactionType, VoucherStatus } from '../generated/prisma/enums';
await tx.transaction.create({ data: { type: TransactionType.EARN } });
await tx.voucher.update({ data: { status: VoucherStatus.CLAIMED } });
```

*Exception: `earnPoints()` currently uses `'EARN'` string — this is acceptable legacy, but new code must use enums.*

### RULE-TS-3: Validate Compilation Before Completing Any Task

```bash
# Run this from the api/ directory before marking any backend task done:
cd api && npx tsc --noEmit

# Run this from admins/ or customers/ for frontend tasks:
cd admins && npx tsc --noEmit
```

A task is NOT complete if TypeScript reports errors.

---

## 4. API & Fastify Rules

### RULE-API-1: All Responses MUST Use ApiResponse Factory

```typescript
// ❌ FORBIDDEN — raw reply.send with custom object
reply.status(200).send({ success: true, data: result });
reply.status(400).send({ error: 'something went wrong' });

// ✅ REQUIRED — use ApiResponse factory
import { ApiResponse } from '../utils/apiResponse';
const res = ApiResponse.success(result);
return reply.status(res.statusCode).send(res.payload);

const err = ApiResponse.fail({ statusCode: 400, msg: '...', error_code: 'ERROR_CODE' });
throw err;
```

### RULE-API-2: Add Route Schema Validation for New Endpoints

New Fastify routes MUST include a JSON Schema for request validation:

```typescript
const schema = {
  body: {
    type: 'object',
    required: ['fieldName'],
    properties: {
      fieldName: { type: 'string', minLength: 1, maxLength: 255 }
    },
    additionalProperties: false
  }
};
fastify.post('/my-route', { schema }, myController);
```

### RULE-API-3: Never Add Routes Directly to server.ts

All routes MUST be registered via the plugin functions in `api/src/routes/`. Use the appropriate file:
- Admin routes → `adminRoutes.ts`
- Customer routes → `customerRoutes.ts`

---

## 5. Logging Rules

### RULE-LOG-1: Use Logger Utility — Never Raw console.log

```typescript
// ❌ FORBIDDEN
console.log('Something happened:', data);
console.error('Error:', error);

// ✅ REQUIRED
import { Logger } from '../utils/logger';
const logs = new Logger('MyServiceName');
logs.info('Something happened:', data);
logs.error('Error:', error);
```

---

## 6. Frontend Rules (admins/ and customers/)

### RULE-FE-1: API Calls MUST Go Through the Configured Axios Instance

```typescript
// ❌ FORBIDDEN — using raw fetch, raw axios, or a hardcoded URL
const res = await fetch(`${baseUrl}/endpoint`);
const res = await axios.get('http://localhost:3000/...');

// ✅ REQUIRED — import the configured apiClient from config/apiClient.ts
import { apiClient } from '@/config/apiClient';
const res = await apiClient.get('/endpoint');

// ✅ ALSO CORRECT — import API_PATH constants alongside apiClient (customers/ pattern)
import { apiClient, API_PATH } from '@/config/apiClient';
const res = await apiClient.post(API_PATH.earnPoints, payload);
```

> **File locations:**
> - `admins/src/config/apiClient.ts` — exports `apiClient` (AxiosInstance with `withCredentials: true`)
> - `customers/src/config/apiClient.ts` — exports `apiClient` + `API_PATH` constants; includes a request interceptor that automatically attaches the LINE access token or in-memory server JWT.


### RULE-FE-2: Business Logic Belongs in Viewmodels, Not Views

```typescript
// ❌ FORBIDDEN — data fetching in the view component
// src/app/views/SomePage.tsx
const [data, setData] = useState([]);
useEffect(() => { fetch(...).then(setData); }, []);

// ✅ REQUIRED — extract to viewmodel hook
// src/app/viewmodels/useSomeData.ts
export function useSomeData() {
  const [data, setData] = useState([]);
  // fetch logic here
  return { data, isLoading, error };
}
// Then in SomePage.tsx:
const { data, isLoading } = useSomeData();
```

### RULE-FE-3: TypeScript Interfaces for All API Response Shapes

Define interfaces in `src/app/models/` for every API response consumed by the frontend. Never use `any` for API data.

---

## 7. Filesystem Rules

### RULE-FS-1: Generated Files Are Read-Only

```
api/src/generated/prisma/   ← Auto-generated by Prisma. NEVER edit manually.
```

### RULE-FS-2: .env Files Are Never Committed

`.env` files are in `.gitignore`. Never add secrets to `.env.example` — use placeholder values only.

### RULE-FS-3: New Service Files Follow Existing Naming Convention

```
api/src/services/<roleName>Service.ts   (e.g., staffService.ts, managerService.ts)
api/src/utils/<utilityName>.ts          (e.g., rateLimiter.ts, lineMessaging.ts)
```

---

## 8. Quick Reference — Key File Locations

| What you need | File |
|---|---|
| Prisma DB schema | `api/prisma/schema.prisma` |
| Fastify server config | `api/src/server.ts` |
| JWT & auth logic | `api/src/services/authService.ts` |
| QR generation | `api/src/services/staffService.ts` → `generatePointsToken()` |
| Earn points (atomic) | `api/src/services/customerService.ts` → `earnPoints()` |
| Redeem reward (atomic) | `api/src/services/customerService.ts` → `redeemReward()` |
| Voucher execution (atomic) | `api/src/services/staffService.ts` → `executionVoucher()` |
| ApiResponse factory | `api/src/utils/apiResponse.ts` |
| Admin routes | `api/src/routes/adminRoutes.ts` |
| Customer routes | `api/src/routes/customerRoutes.ts` |
| Role hierarchy enforcement | `api/src/services/authService.ts` → `Auth.lowestAllowRole()` |

---

## 9. Commit Message Convention

```
feat(scope): short description        ← New feature
fix(scope): short description         ← Bug fix
refactor(scope): short description    ← Code restructure, no behavior change
chore(scope): short description       ← Build, config, migration
test(scope): short description        ← Tests only

# Examples:
feat(api): add NFR-3 LINE push notification after earn
fix(auth): correct voucher expiresAt calculation bug (TDB-5)
refactor(customer): move createUniqueVoucher inside transaction boundary
chore(db): add prisma migration for voucher_code index
```
