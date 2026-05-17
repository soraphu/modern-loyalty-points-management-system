# 🎟️ DeePoints

### 🚀 Features

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