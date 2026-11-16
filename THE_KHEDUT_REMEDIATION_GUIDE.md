# THE KHEDUT — DEVELOPER & OPERATOR SECURITY REMEDIATION GUIDE

**Application:** The Khedut (`com.thekhedut.app`)  
**Target Audience:** Software Engineers, DevOps Engineers, and Platform Administrators  
**Date:** November 2026  
**Document Purpose:** Maintain long-term defensive security posture post-launch  

---

## 1. Secrets & Environment Variable Standards

### Mandatory Environment Keys
Every deployment environment (Development, Staging, Production) must configure:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=<cryptographically-random-string-at-least-32-chars>
PORT=5000
NODE_ENV=production
CLIENT_URL=https://krishimitra-ai.vercel.app
```

### Production Safeguards:
1. **Never use fallbacks:** `JWT_SECRET` must never be given a hardcoded default string in code. If missing, the application is designed to abort bootstrap immediately.
2. **Key Generation:** To generate a high-entropy production JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```
3. **Log Sanitization:** When adding new configuration specs in `backend/src/config/envValidator.ts`, always set `isSecret: true`. `EnvValidator.maskSecret` guarantees that secrets are output strictly as `[CONFIGURED]`.

---

## 2. NoSQL Injection & Input Sanitization Rules

### Global Middleware
- The application automatically registers `noSqlSanitizer` in `backend/src/app.ts` after body parsing.
- Any request parameter containing a key starting with `$` (e.g. `$ne`, `$gt`, `$where`, `$regex`, `$in`) or containing a dot `.` is stripped before reaching route controllers.

### Mongoose Query Best Practices
1. **Sanitize Filter Enabled:** `mongoose.set('sanitizeFilter', true)` is active globally.
2. **Explicit Casting & Extraction:** When querying by ObjectId or user ID, always cast or extract primitive strings:
   ```typescript
   // Correct
   const userId = req.user._id.toString();
   const record = await Expense.findOne({ _id: req.params.id, user: userId });

   // Avoid passing raw unvalidated objects directly into queries
   ```

---

## 3. Tiered Rate Limiting Policy

Rate limiters are defined in `backend/src/middleware/rateLimiters.ts`. When creating new routes, bind them to the appropriate tier:

| Tier | Window | Max Requests | Purpose | Target Endpoints |
| :--- | :--- | :--- | :--- | :--- |
| **`authLimiter`** | 15 min | 10 | Brute-force & credential stuffing defense | `/api/auth/login`, `/api/auth/register`, `/api/auth/reset-password` |
| **`aiLimiter`** | 15 min | 15 | AI quota and cost control | `/api/diseases/analyze`, `/api/diseases/diagnose`, `/api/chatbot/*`, `/api/copilot/*` |
| **`reportLimiter`** | 15 min | 20 | PDF rendering CPU protection | `/api/reports/generate`, `/api/reports/download` |
| **`paymentLimiter`** | 15 min | 20 | Fraud and card testing prevention | `/api/create-order`, `/api/verify-payment`, `/api/payments/*` |
| **`generalLimiter`** | 15 min | 200 | General API traffic | All `/api/*` routes |

---

## 4. File Upload & Binary Signature Enforcement

### Allowed Image Formats
Only genuine JPEG, PNG, and WebP images are permitted:
- **JPEG:** First 3 bytes: `0xFF, 0xD8, 0xFF`
- **PNG:** First 4 bytes: `0x89, 0x50, 0x4E, 0x47`
- **WebP:** Bytes 0..3: `0x52, 0x49, 0x46, 0x46` (`RIFF`), Bytes 8..11: `0x57, 0x45, 0x42, 0x50` (`WEBP`)

### Middleware Usage:
When accepting image files via Multer, chain `validateImageSignature`:
```typescript
import { upload, validateImageSignature } from '../middleware/upload';

router.post('/upload-image',
  upload.single('image'),
  validateImageSignature,
  MyController.handleImage
);
```

---

## 5. Error Handling & Sanitization Rules

In `backend/src/middleware/errorHandler.ts`:
- Errors originating from Mongoose (`CastError`, `ValidationError`), MongoDB (`11000` duplicate key), Multer (`LIMIT_FILE_SIZE`), and JWT are caught and converted to safe HTTP status codes with user-friendly messages.
- In production (`process.env.NODE_ENV === 'production'`), 500-level error messages are masked as `'An unexpected error occurred. Please contact support.'`.
- Stack traces are suppressed in production.
- **Rule for Developers:** Never return `res.status(500).json({ error: err.message })` manually inside controllers. Always pass the error to `next(err)`.

---

## 6. Dependency Maintenance Workflow

1. Audit dependencies:
   ```bash
   npm --prefix backend audit
   npm --prefix frontend audit
   ```
2. Apply non-breaking updates:
   ```bash
   npm --prefix backend audit fix
   npm --prefix frontend audit fix
   ```
3. **STRICT RULE:** Never run `npm audit fix --force`. Doing so introduces breaking major version jumps (e.g. `vite@8`, `react-router-dom@7`, `esbuild@0.24`) which destabilize existing React 18 and Capacitor 8 Android builds.
4. Verify tests and build after updating packages:
   ```bash
   npm --prefix backend run build
   node backend/dist/tests/pre_launch_security_hardening.test.js
   npm --prefix frontend run build
   npm --prefix frontend run cap:sync
   ```
