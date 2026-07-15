# KrishiMitra AI - REST API Endpoint Documentation

This document describes all API endpoints exposed by the KrishiMitra AI Node/Express backend. 

All endpoints are prefixed with `/api` (e.g. `POST http://localhost:5000/api/auth/register`).

---

## 🔑 Authentication Endpoints

### 1. Register User
- **Route**: `POST /auth/register`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "Rajesh Kumar",
    "email": "rajesh@gmail.com",
    "password": "securepassword123",
    "phone": "9876543210",
    "role": "farmer"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "60d...",
      "name": "Rajesh Kumar",
      "email": "rajesh@gmail.com",
      "role": "farmer",
      "plan": "free",
      "subscriptionStatus": "trialing",
      "trialEndDate": "2026-10-13T23:32:00.000Z"
    }
  }
  ```

### 2. Login User
- **Route**: `POST /auth/login`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "rajesh@gmail.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK)**:
  - Returns `success: true`, JWT `token`, and `user` payload.

### 3. Fetch Current Profile
- **Route**: `GET /auth/me`
- **Auth Required**: Yes (Bearer Token in `Authorization` header)
- **Response (200 OK)**:
  - Returns `success: true` and the authenticated user's schema model (with subscription counters).

---

## 🌾 Crop & Soil Advisory Endpoints

### 1. Get Crop Recommendations (Premium)
- **Route**: `POST /crops/recommend`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "state": "Haryana",
    "district": "Karnal",
    "soilType": "Loamy",
    "season": "Rabi",
    "waterAvailability": "Tube Well",
    "budget": 50000,
    "farmSize": 5
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "recommendations": [
      {
        "name": "Wheat",
        "profitEstimation": 140000,
        "expectedYield": 9000,
        "marketDemand": "High",
        "growingDuration": 120,
        "riskLevel": "Low",
        "description": "Sow wheat crops during mid-November..."
      }
    ]
  }
  ```

### 2. Evaluate Soil NPK (Premium)
- **Route**: `POST /crops/soil-analysis`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "pH": 6.5,
    "N": 240,
    "P": 45,
    "K": 180,
    "organicCarbon": 0.55
  }
  ```
- **Response (200 OK)**:
  - Returns suitable crops, custom NPK balance instructions, and organic restoration tips.

---

## 🍁 Plant Pathology Diagnosis Endpoints

### 1. Diagnose Leaf Disease (Free - 10/day limit)
- **Route**: `POST /diseases/diagnose`
- **Auth Required**: Yes
- **Query Parameter**: `?lang=en` (supports en, hi, gu, mr, etc.)
- **Request Body**: `multipart/form-data` containing image file field `image`.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "diagnosis": {
      "name": "Tomato Early Blight",
      "scientificName": "Alternaria solani",
      "confidenceScore": 0.94,
      "symptoms": ["Dark concentric spots on leaves"],
      "organicTreatment": ["Apply Neem oil weekly"],
      "pesticideDetails": {
        "localName": "Mancozeb",
        "englishName": "Mancozeb",
        "brands": ["Dithane M-45"],
        "dosage": "2g per liter of water",
        "mixingMethod": "Mix well and spray at sunrise",
        "precautions": "Wear gloves and face mask",
        "waitingPeriod": "7 days before harvest"
      }
    }
  }
  ```

---

## 💳 Billing & Upgrade Endpoints

### 1. Initialize Mock Checkout Session
- **Route**: `POST /billing/checkout`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "planType": "monthly",
    "paymentProvider": "upi",
    "couponCode": "KRISHI50",
    "isStudent": true
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "checkoutUrl": "upi://pay?pa=krishimitra@upi...",
    "amount": 25,
    "user": {
      "id": "60d...",
      "plan": "premium",
      "subscriptionStatus": "active"
    },
    "message": "Premium upgraded successfully!"
  }
  ```
- **Description**: Applies discount formulas for NGO/Government/Student credentials and automatically promotes the profile to `premium` in mock dev environments.
