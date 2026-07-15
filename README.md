# KrishiMitra AI - Production-Ready Smart Agriculture Platform

KrishiMitra AI is an enterprise-grade, highly responsive, and multilingual AI-powered digital agriculture companion designed to support smallholders, tenant farmers, and cooperatives. The platform provides localized meteorological advisories, multimodal crop leaf disease diagnostics, soil chemical NPK optimization planners, market price index charts, national subsidy finders, interactive forums, and direct specialist scheduling.

---

## 🌟 Key Features
1. **Multimodal Leaf Pathology Diagnosis**:
   - Scans leaf photos to detect crop diseases (e.g. Tomato Early Blight).
   - Generates Latin classifications, localized disease names, symptom lists, pathogen causes, and detailed organic and chemical pesticide guides (complete with mixing directions, application instructions, and post-spray harvest waiting indices).
   - Returns compared visual leaf charts (healthy, diseased, pathogen cells).
2. **Soil Chemistry & NPK Balancing**:
   - Formulates targeted fertilizer suggestions based on soil NPK values, pH, and organic carbon content.
   - Embeds a localized fertilizer bag estimator calculating raw Urea, DAP, and Potash requirements per acre.
3. **Hyper-Local Climate Forecasts**:
   - Connects with Live OpenWeather API (with offline deterministic simulators) mapping 7-day agricultural forecasts.
   - Translates raw conditions into warning advisories (e.g. frost, heatwave warnings, wind vector guidance) matching local languages.
4. **Mandi Market Rates Index**:
   - Tracks minimum, maximum, and average crop commodity rates across districts, indicating MSP (Minimum Support Price) status.
5. **Government Subsidies & Schemes Finder**:
   - Indexes active subsidies (PM-KISAN, crop insurances) with detailed lists of eligibility, benefits, required documents, deadlines, and direct apply links.
6. **Bilingual AI Chatbot & Voice Assistant**:
   - Integrates voice-activated speech recognition (Speech-to-text) and vocal synthesis (Text-to-speech) support.
   - Dual-language engine: Generates AI responses directly in the selected language, while preserving English debug statements.
7. **Premium Subscription Billing Engine**:
   - Automatically provisions a **3-month Premium Trial** on user registration.
   - Dynamically protects advanced crop planning, expert calendars, NPK calculators, and PDF report downloads.
   - Supports coupons (e.g. `KRISHI50`), referral rebates, student waivers, and NGO/Government subsidies.
   - Implements rate limiters (20 chat queries/day, 10 disease scans/day) for Free plan accounts after trial expiry.
8. **Admin Control Center**:
   - Displays real-time user metrics, total revenue earnings, crop demographics, disease diagnostics charts, and moderator queues.

---

## 🛠️ Technical Stack
- **Frontend**: React.js, Vite, TypeScript, Tailwind CSS, Recharts, Leaflet Maps, Framer Motion, i18next
- **Backend**: Node.js, Express.js, TypeScript, Multer, PDFKit
- **Database**: MongoDB Atlas, Mongoose ODM (with automated offline failover memory cache adapters)
- **AI Engine**: Gemini 1.5 Flash API (Multimodal Vision + Chatbot)
- **Weather Services**: OpenWeather Map API

---

## 📂 Project Structure
```text
AI farma/
├── backend/
│   ├── src/
│   │   ├── config/             # DB and configuration binders
│   │   ├── controllers/        # Express REST Controllers (Auth, Crop, Weather, Billing, Admin)
│   │   ├── middleware/         # Security, JWT auth, Multer uploaders, Rate Limiters, Subscriptions
│   │   ├── models/             # Mongoose Schemas (User, Farm, Disease, Weather, Expenses)
│   │   ├── routes/             # Router declarations
│   │   ├── services/           # Decoupled Core Services (Gemini AI, OpenWeather, PDFKit, Billing)
│   │   ├── utils/              # Failover cache drivers
│   │   └── app.ts              # Express initialization
│   ├── .env.example            # Environment variables template
│   └── tsconfig.json           # TS compiling configurations
├── frontend/
│   ├── src/
│   │   ├── components/         # Global widgets (Navbar, Sidebar, Voice Assistant, Skeletons)
│   │   ├── context/            # Global React Contexts (Auth, Theme)
│   │   ├── locales/            # Multilingual i18next JSON dictionaries
│   │   ├── pages/              # Routing views (Dashboard, Soil, Pathology, Pricing, Admin)
│   │   ├── services/           # Axios Client interfaces
│   │   ├── App.tsx             # Route Splitting lazy-load router
│   │   └── main.tsx            # DOM Mount entry point
│   ├── .env.example            # Front connection variables
│   └── vite.config.ts          # Vite build packagers
```

---

## 🚀 Quick Start
### 1. Initialize Backend
```bash
cd backend
npm install
# Copy env variables template
cp .env.example .env
# Start local compilation server
npm run dev
```

### 2. Initialize Frontend
```bash
cd ../frontend
npm install
# Copy env variables template
cp .env.example .env
# Launch dev web server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📄 Documentation Index
Detailed documentation manuals are available in the project root:
- [Installation Guide](file:///C:/Users/raman/AI%20farma/INSTALLATION_GUIDE.md)
- [API Documentation](file:///C:/Users/raman/AI%20farma/API_DOCUMENTATION.md)
- [Architecture & Database ERD](file:///C:/Users/raman/AI%20farma/ARCHITECTURE_DOCUMENTATION.md)
- [User Manual (Farmer Guide)](file:///C:/Users/raman/AI%20farma/USER_MANUAL.md)
- [Admin Control Guide](file:///C:/Users/raman/AI%20farma/ADMIN_MANUAL.md)
- [Cloud Deployment Guide](file:///C:/Users/raman/AI%20farma/DEPLOYMENT_GUIDE.md)
