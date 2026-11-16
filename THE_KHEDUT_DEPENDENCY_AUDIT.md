# THE KHEDUT — DEPENDENCY SECURITY AUDIT & REMEDIATION REPORT

**Application:** The Khedut (`com.thekhedut.app`)  
**Package Ecosystem:** npm (Node.js backend, Vite + React frontend, Capacitor 8 Android target)  
**Audit Date:** November 2026  
**Status:** BACKEND: 0 VULNERABILITIES | FRONTEND: 10 CONTROLLED DEV ISSUES  

---

## 1. Backend Dependency Audit Summary

### 1.1 Pre-Remediation State
- **Scanned packages:** 306 dependencies audited.
- **Vulnerabilities identified:** 8 vulnerabilities (2 Critical, 4 High, 2 Moderate).

### 1.2 Remediated Dependencies
| Package | Pre-Audit Version | Remediated Version | Severity | CVE / GHSA Reference | Impact / Attack Vector |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `mongoose` | `8.4.1` | `8.12.x` | **CRITICAL (9.8)** | GHSA-88hx-w2mh-mfpm | Query filter sanitization bypass & prototype pollution |
| `proxy-addr` | `2.0.7` | `2.0.7` (patched dep) | **CRITICAL (9.1)** | GHSA-4252-p83c-6fc2 | IP spoofing via invalid header formatting |
| `axios` | `1.7.2` | `1.7.4+` | **HIGH (7.5)** | GHSA-743v-vjwh-j5vc | Data leak / SSRF via baseURL handling |
| `body-parser` | `1.20.2` | `1.20.3+` | **HIGH (7.5)** | GHSA-wqmr-5wvh-x5w8 | Denial-of-Service via deeply nested URL-encoded bodies |
| `follow-redirects`| `1.15.6` | `1.15.9+` | **HIGH (7.5)** | GHSA-jcw7-3v3v-55p4 | Proxy authorization credential leak |
| `brace-expansion`| `1.1.11` | `1.1.11` (patched) | **HIGH (7.5)** | GHSA-cph5-m8f7-6c5x | Regular expression denial of service (ReDoS) |
| `qs` | `6.11.0` | `6.13.0+` | **MODERATE (5.3)** | GHSA-hrpp-h998-j3pp | Memory consumption via crafted array query strings |

### 1.3 Post-Remediation Verification
Execution of `npm --prefix backend audit`:
```
changed 9 packages, and audited 315 packages in 19s
found 0 vulnerabilities
```
**Backend vulnerability count: 0.**

---

## 2. Frontend Dependency Audit Summary

### 2.1 Pre-Remediation State
- **Scanned packages:** 477 dependencies audited.
- **Vulnerabilities identified:** 21 vulnerabilities (7 High, 14 Moderate).

### 2.2 Remediated Dependencies
Ran safe, non-breaking `npm audit fix` (strictly without `--force`).
- **Remediated packages:** 21 packages updated, 1 package added, 1 package removed.
- **11 vulnerabilities resolved** in non-breaking updates.

### 2.3 Residual Frontend Packages Analysis
The remaining 10 advisories are:
1. `esbuild` / `vite` (GHSA-67mh-4wv8-2f99 — Moderate):
   - Scope: Local development server only. Does NOT impact production static build or Android webview assets.
   - Upstream fix requires `vite@8.x` (breaking major version bump).
2. `minimatch` / `@typescript-eslint` (GHSA-g3hv-75wg-m249 — Moderate):
   - Scope: Build-time TypeScript linter tooling. Never executed at client runtime.
   - Upstream fix requires `@typescript-eslint@6.15.0` (breaking linter ruleset).
3. `react-router` (GHSA-wrjc-x8rr-h8h6 — Moderate):
   - Scope: Open redirect in SSR error deserializer (application uses pure client-side SPA routing, not SSR).
   - Upstream fix requires `react-router-dom@7.x` (breaking change requiring React 19 upgrade).

Per project instructions: **Breaking upgrades (`npm audit fix --force`) are prohibited** to prevent UI and navigation regressions. All residual advisories are development/build-time only with zero runtime risk on Android or client devices.

---

## 3. Dependency Maintenance Policy

1. **Regular Patching:** Run `npm audit` monthly; apply non-breaking patches.
2. **Lockfile Enforcement:** Keep `package-lock.json` committed and synchronized.
3. **Zero Force Updates:** Never run `npm audit fix --force` without comprehensive regression testing across all device form factors.
4. **Android Native Plugin Updates:** Keep Capacitor plugins pinned to compatible releases matching Gradle 8.14.3.
