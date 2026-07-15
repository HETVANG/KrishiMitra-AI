# KrishiMitra AI - Cloud Deployment Guide

This guide details steps for deploying the KrishiMitra AI platform to cloud hosting providers for production.

---

## 1. Database: MongoDB Atlas (Cloud Cluster)
1. Register a free account at **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**.
2. Build a new Shared Database Cluster (e.g. Cluster0 under AWS free tier).
3. Under **Network Access**, add IP whitelist rules: `0.0.0.0/0` (Allows serverless hosting providers like Render/Vercel to connect).
4. Under **Database Access**, create a user account with read/write credentials.
5. Retrieve your connection string URI:
   `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/krishimitra?retryWrites=true&w=majority`

---

## 2. Backend Hosting: Render (Web Service)
1. Log in to **[Render](https://render.com/)** and link your Git repository.
2. Select **New Web Service** and configure:
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build` (or compiling ts to js)
   - **Start Command**: `cd backend && node dist/app.js` (Ensure your typescript config compiles to `/dist`)
3. Under **Advanced / Environment Variables**, add:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your Atlas Mongo Connection String*
   - `JWT_SECRET`: *A secure random string*
   - `GEMINI_API_KEY`: *Your Google Gemini AI API Client Key*
   - `OPENWEATHER_API_KEY`: *Your Weather API key token*
4. Click **Deploy Web Service** and copy your deployment URL (e.g. `https://krishimitra-backend.onrender.com`).

---

## 3. Frontend Hosting: Vercel (Static Web)
1. Log in to **[Vercel](https://vercel.com/)** and import your Git repository.
2. Select the **frontend** subdirectory as the project root.
3. Configure the framework presets:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the environment variable:
   - `VITE_API_URL`: *Your Render backend URL* (e.g. `https://krishimitra-backend.onrender.com/api`)
5. Click **Deploy**. Vercel will compile and output your production website URL.

---

## 🔒 Production Hardening & Optimization
- **CORS Rules**: In `backend/src/app.ts`, change the CORS origin setting from `*` to your specific Vercel frontend URL.
- **helmet headers**: Keep Helmet enabled to write secure HTTP response headers (XSS filters, referrer constraints).
- **Rate Limit**: Keep the express rate limiter set to protect against automated DDoS requests.
- **Build Checks**: Always run `npm run build` locally in both folders to verify all TypeScript compiler statements pass before committing to Git.
