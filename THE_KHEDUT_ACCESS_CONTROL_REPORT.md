# THE KHEDUT — ACCESS CONTROL, RBAC & IDOR AUDIT REPORT

**Application:** The Khedut (`com.thekhedut.app`)  
**Scope:** Authentication Middlewares, Role-Based Access Control, Insecure Direct Object References (IDOR), and Tenant Data Isolation  
**Audit Date:** November 2026  
**Status:** PASS — ROBUST ACCESS CONTROL ENFORCED  

---

## 1. Access Control Architecture

The Khedut enforces a layered authorization architecture:
1. **Network Layer (CORS & Rate Limiting):** Strict origin validation and IP/User rate limits.
2. **Authentication Middleware (`authenticate`):** Validates signed JSON Web Tokens (JWT), extracts user claims, verifies active MongoDB account status, and checks `user.isBlocked`.
3. **Role-Based Access Control (`authorize`):** Validates caller role against allowed role list (`admin`, `farmer`, `provider`, `partner`).
4. **Data Ownership Layer (IDOR Prevention):** Every query fetching user-specific records explicitly matches `{ user: req.user._id }` or `{ userId: req.user._id }`.
5. **Multi-Farm Authorization (`FarmAuthorizationService`):** Verifies explicit farm membership before granting view/edit permissions across multi-tenant farm operations.

---

## 2. RBAC & Administrative Protection Audit

| Route Group | Path | Enforced Roles | Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **Admin Stats** | `/api/auth/admin/stats` | `admin` | `authenticate, authorize('admin')` |
| **Admin Reports** | `/api/reports/admin/*` | `admin` | `authenticate, authorize('admin')` |
| **Admin Providers** | `/api/admin/providers/*`| `admin` | `authenticate, authorize('admin')` |
| **Admin Partners** | `/api/admin/partners/*` | `admin` | `authenticate, authorize('admin')` |
| **Admin Platform** | `/api/admin/*` | `admin` | `authenticate, authorize('admin')` |
| **Farmer Dashboard** | `/api/crops`, `/api/expenses`, `/api/reports` | `farmer`, `user` | `authenticate` + Owner ID match |
| **Public Endpoints** | `/api/weather`, `/api/market`, `/api/schemes` | All | Read-only public reference data |
| **Public Verification**| `/api/reports/verify/:id` | All | Cryptographic report verification QR endpoint |

### Mass Assignment & Self-Registration Defense
- In `AuthController.ts`, `register` explicitly sets:
  ```typescript
  role: 'farmer' // Default role
  ```
  Even if an attacker supplies `role: 'admin'` or `role: 'OWNER'` in the registration JSON body, the field is ignored and constrained to `farmer`. Tested and verified in automated security test suite.

---

## 3. Insecure Direct Object Reference (IDOR) Analysis

### 3.1 Financial Expenses (`ExpenseController.ts`)
- **Vulnerability Checked:** Can Farmer A query or delete Farmer B's expenses by guessing the MongoDB ObjectId?
- **Implementation:**
  ```typescript
  // Get all expenses
  const expenses = await Expense.find({ user: req.user._id });

  // Delete expense
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  ```
- **Finding:** Every query enforces `{ user: req.user._id }`. Cross-tenant record deletion or access is impossible.

### 3.2 Crop Cycles & Farm Management (`CropController.ts`)
- **Vulnerability Checked:** Can unauthorized users view other farmers' crops?
- **Implementation:**
  ```typescript
  const crops = await Crop.find({ user: req.user._id });
  ```
- **Finding:** Fully scoped to authenticated session owner.

### 3.3 Disease Detection History (`DiseaseController.ts`)
- **Vulnerability Checked:** Can user access medical/crop scan records of others?
- **Implementation:**
  ```typescript
  const history = await DiseaseHistory.find({ user: req.user._id });
  ```
- **Finding:** Scoped to `req.user._id`.

### 3.4 Multi-Farm Membership & Tenant Isolation (`FarmAuthorizationService.ts`)
- Tested cross-user farm access with disjoint IDs:
  - User A: `60d5ecb8b5c9c22b10000001`
  - User B Farm: `60d5ecb8b5c9c22b10000003`
  - Result: `FarmAuthorizationService.canViewFarm(userA, farmB)` returned `false`. Cross-tenant farm data access is strictly blocked.

---

## 4. Session & Token Invalidation

- **JWT Expiration:** Tokens are signed with a standard 7-day expiration (`process.env.JWT_EXPIRES_IN || '7d'`).
- **Account Block Enforcement:** In `authenticate`:
  ```typescript
  if (user.isBlocked) {
    return res.status(403).json({ message: 'Account is blocked. Please contact support.' });
  }
  ```
  Deactivated or blocked users are immediately denied access on their next request, even if their JWT has not expired.
- **Password Hashes:** User queries use `.select('-password')` by default to ensure password hashes are never included in memory objects or serialized into API responses.

---

## 5. Access Control Certification

The Khedut's access control architecture satisfies OWASP API Security Top 10 standards for Broken Object Level Authorization (API1:2023) and Broken Function Level Authorization (API5:2023). Privileged operations and tenant boundaries are strictly enforced.
