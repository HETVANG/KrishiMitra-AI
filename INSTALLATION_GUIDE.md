# KrishiMitra AI - Local Installation & Dev Guide

This guide describes how to compile, configure, and initialize KrishiMitra AI in a local development environment.

---

## 📋 Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.x or higher recommended)
- **NPM** (v9.x or higher)
- **MongoDB** (Local Community Server v6.x+, or a MongoDB Atlas cloud cluster URL)

---

## 🛠️ Step-by-Step Backend Setup

### 1. Install Dependencies
Navigate into the backend project workspace and install the node dependencies:
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy the env template file and populate it with your credentials:
```bash
cp .env.example .env
```
Open `.env` in a text editor and fill in parameters:
- **`PORT`**: Local backend server port (defaults to `5000`).
- **`JWT_SECRET`**: Signature key for securing sessions.
- **`MONGODB_URI`**: MongoDB Connection URL. (If left blank, the app triggers local array-based cache fallovers automatically).
- **`GEMINI_API_KEY`**: Generative AI API Client key. (If left blank, the platform loads localized pre-configured mockup JSON responses).
- **`OPENWEATHER_API_KEY`**: Weather API key. (If left blank, a deterministic simulator calculates coordinates weather advice).

### 3. Initialize Compilation Server
Run the local compiler to start the backend:
```bash
npm run dev
```
The console will output:
`[Server] KrishiMitra AI Server listening on port 5000`

---

## 💻 Step-by-Step Frontend Setup

### 1. Install Dependencies
Navigate into the frontend project workspace and compile all modules:
```bash
cd ../frontend
npm install
```

### 2. Configure Endpoint Variables
Copy the env template file:
```bash
cp .env.example .env
```
Ensure the API endpoint matches your local backend URL:
`VITE_API_URL=http://localhost:5000/api`

### 3. Launch Development Web Server
Start the Vite developer environment:
```bash
npm run dev
```
Vite will compile in milliseconds and open the project at:
**[http://localhost:5173](http://localhost:5173)**

---

## 🔍 Validation Testing Checks
1. **Database Fallback Check**:
   - Stop your local MongoDB server or leave `MONGODB_URI` blank in the `.env` file.
   - Run the servers. Verify that you can still register, log in, view government schemes, search crop markets, and scan leaves.
2. **Multilingual Toggle**:
   - Change your language dropdown in the top-right header to **Hindi (हिन्दी)** or **Gujarati (ગુજરાતી)**.
   - Ask the AI Chatbot a question. Verify that the chatbot response renders immediately in the chosen script.
3. **Daily Limit Test**:
   - Navigate to the Pricing page.
   - Click the "Upgrade to Premium" button and select "UPI" to process the payment simulator.
   - Verify that your user card changes from **free** to **premium**, immediately unlocking unlimited downloads.
