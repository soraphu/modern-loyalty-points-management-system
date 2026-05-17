## 📋 Software Requirements Specification (SRS) - DeePoints

### 1. Functional Requirements (FR)

#### A. Merchant Admin Portal (Web App)

* **FR-1: Dynamic QR Generation**
    * Employee inputs a point value.
    * System generates a **Unique UUID-based QR Code**.
    * QR code is marked `used: false` and stored with an `expires_at` timestamp (e.g., 5-minute window for security).


* **FR-2: Manual Point Adjustment**
    * Ability to search for a customer by LINE Display Name or Internal ID.
    * Interface to add/remove points with a mandatory "Reason" text field for audit trails.


* **FR-3: Reward Catalog Management**
    * Admins can create/edit rewards (e.g., "Free Thai Tea", "20% Discount").
    * Set point costs and upload reward icons.


* **FR-4: Audit & Activity Logs**
    * View a real-time feed of all events (Who scanned what, who redeemed what).


* **FR-5: Business Dashboard**
    * Total users, daily active scans, and "Point Liability" (total points currently held by all customers).



#### B. Customer Experience (LINE OA + LIFF)

* **FR-6: One-Time Earn Flow**
    * Customer scans merchant QR via LINE.
    * LIFF app validates: Is it used? Is it expired?
    * If valid, points are credited and the QR is marked `used: true`.


* **FR-7: Point Redemption Flow (The "Timer" Method)**
    * **Selection:** User selects a reward from the catalog.
    * **Validation:** System checks if `user_points >= reward_cost`.
    * **Activation:** User clicks "Redeem Now." Points are deducted immediately.
    * **The Voucher:** LIFF displays a **Digital Voucher** with:
    1. Reward Name.
    2. **Countdown Timer** (e.g., 5:00 minutes).
    3. Instruction: "Show this to staff to claim."


    * **Finalization:** A "Confirm Receipt" button that the user (or staff) clicks once the physical reward is handed over.


* **FR-8: Point History**
    * User can view their personal history of "Earned" and "Spent" points.



---

### 2. Non-Functional Requirements (NFR)

* **NFR-1: Anti-Fraud (Atomic Transactions)**
    * The system must use **Database Transactions**. If the QR update fails, the point addition must roll back. *Never allow points to be added if the QR isn't successfully marked as used.*


* **NFR-2: Security (Rate Limiting)**
    * Limit a single user to 1 scan per 30 seconds to prevent "brute force" scanning of generated codes.


* **NFR-3: UX (Instant Feedback)**
    * Trigger a **LINE Push Message** using the Messaging API immediately after a successful scan so the user's phone "pings" while they are still at the counter.


* **NFR-4: Availability**
    * The backend on **Render** must handle auto-restarts if the service crashes, ensuring the shop can always issue points.

---