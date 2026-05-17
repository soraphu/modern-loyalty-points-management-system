# 🎟️ DeePoints

A modern loyalty points management system for merchants using LINE. Customers earn points by scanning QR codes and redeem them for rewards through a seamless LINE LIFF experience. Built with Fastify, React, and PostgreSQL for reliability and performance.

### 🚀 Features

#### 👨‍💼 Merchant Admin Portal

| ID | Feature | Description |
|---|---|---|
| **FR-1** | Dynamic QR Generation | Generate unique UUID-based QR codes with point values and expiration timestamps (5-min window) |
| **FR-2** | Manual Point Adjustment | Search customers by name/ID and adjust points with mandatory reason field for audit trails |
| **FR-3** | Reward Catalog Management | Create/edit rewards with point costs and icon uploads |
| **FR-4** | Audit & Activity Logs | Real-time feed of all transactions (scans, redemptions, adjustments) |
| **FR-5** | Business Dashboard | Display total users, daily active scans, and point liability metrics |

#### 👥 Customer Experience (LINE OA + LIFF)

| ID | Feature | Description |
|---|---|---|
| **FR-6** | One-Time Earn Flow | Customer scans QR → Auto-validate (used/expired) → Credit points instantly |
| **FR-7** | Point Redemption (Timer) | Select reward → Deduct points → Digital voucher with 5-min countdown timer → Confirm receipt |
| **FR-8** | Point History | View personal earned/spent transaction history with timestamps |

#### 🔒 Security & Reliability

| ID | Requirement | Details |
|---|---|---|
| **NFR-1** | Atomic Transactions | QR + point updates both succeed or both rollback (anti-fraud) |
| **NFR-2** | Rate Limiting | Max 1 scan per 30 seconds per user |
| **NFR-3** | Instant Feedback | LINE push notification immediately after successful scan |
| **NFR-4** | High Availability | Auto-restart on backend crashes (Render) |

---

### 🧱 Tech Stack

| Category | Technology |
|---|---|
| Frontend (Admin/LIFF) | Vite + React + TypeScript |
| Styling & UI | Tailwind CSS + Shadcn UI |
| Backend | Node.js + TypeScript |
| API Framework | Fastify |
| Messaging | Messaging API (LINE SDK) |
| Database | PostgreSQL (Supabase) |
| Authentication | JWT + LINE ID Token |
| Containerization | Docker |
| Deployment | Render |

---

### 📊 Database

|Table|	Columns|	Purpose|
|-----|--------|-----------|
|**users** |	`id`, `line_id`, `line_display_name`, `line_picture_url`, `total_points`, `created_at` | Customer data. |
|**admins** |	`id`, `role`, `username`, `realname`, `password_hashed` ,`created_at`, `updated_at` |	Shop Owner / Manager / Staff |
|**qr_codes** |	`id`, `admin_id`, `code_string`, `point_value`, `used`, `created_at`,`expires_at` |	logs generated qr codes.  |
|**transactions** |	`id`, `user_id`, `reference_id`, `points_amount`, `type`, `created_at`	| logs point transactions. |
|**rewards** |	`id`, `name`, `points_cost`, `active`,`created_at`	| Rewards available. | 
|**redemptions** |	`id`, `user_id`, `reward_id`, `status`,`created_at`, `expires_at` |	Redeem reward request. |

