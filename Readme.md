# MediCare AI — Doctor Assignment System

AI-powered healthcare workflow system that routes patients to the right doctor category based on their uploaded medical reports.

---

## Project Structure

```
medicare/
├── client/                          # React + Vite Frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx                  # All routes defined here
│       ├── main.jsx
│       ├── index.css                # Tailwind + custom classes
│       ├── context/
│       │   └── AuthContext.jsx      # JWT auth context
│       ├── services/
│       │   └── api.js               # Axios instance with JWT interceptor
│       ├── components/
│       │   ├── common/
│       │   │   ├── ProtectedRoute.jsx  # Role-based route guard
│       │   │   └── StatusBadge.jsx     # PENDING/ASSIGNED/REVIEWED badge
│       │   └── layout/
│       │       └── Sidebar.jsx         # Shared sidebar for all roles
│       └── pages/
│           ├── auth/
│           │   ├── Login.jsx           # Role tab login (Patient/Doctor/Admin)
│           │   └── Register.jsx        # Patient registration
│           ├── patient/
│           │   ├── PatientDashboard.jsx
│           │   ├── UploadReport.jsx    # Upload + OCR + AI analysis
│           │   ├── MyReports.jsx
│           │   └── ReportDetail.jsx
│           ├── admin/
│           │   ├── AdminDashboard.jsx
│           │   ├── AdminReports.jsx    # Filter by status
│           │   ├── AdminReportDetail.jsx # Manual reassign + reanalyze
│           │   ├── AdminPatients.jsx
│           │   └── AdminDoctors.jsx    # Add doctor modal
│           └── doctor/
│               ├── DoctorDashboard.jsx
│               ├── AssignedReports.jsx
│               └── DoctorReportDetail.jsx # Mark as reviewed
│
└── server/                          # Node.js + Express Backend
    ├── index.js                     # Entry point
    ├── package.json
    ├── .env.example
    ├── config/
    │   └── db.js                    # MongoDB Atlas connection
    ├── middleware/
    │   ├── auth.js                  # verifyToken + requireRole
    │   └── upload.js                # Multer (JPG/PNG/PDF, 10MB limit)
    ├── models/
    │   ├── User.js                  # PATIENT / DOCTOR / ADMIN
    │   ├── PatientProfile.js
    │   ├── DoctorProfile.js         # category, availability, shift
    │   ├── PatientReport.js         # transcript, aiResult, status
    │   └── AIAnalysisLog.js         # input, model used, response
    ├── controllers/
    │   └── authController.js        # register, login, getMe
    ├── routes/
    │   ├── auth.js                  # /api/auth/*
    │   ├── doctors.js               # /api/doctors/*
    │   ├── reports.js               # /api/reports/* (patient)
    │   ├── admin.js                 # /api/admin/*
    │   └── doctorRoutes.js          # /api/doctor/*
    ├── services/
    │   ├── ocrService.js            # tesseract.js + pdf-parse
    │   ├── classifierService.js     # Rule-based keyword classifier
    │   ├── geminiService.js         # Gemini Flash + fallback
    │   └── assignmentService.js     # Auto doctor assignment
    ├── seeds/
    │   └── seed.js                  # Demo data seeder
    └── uploads/                     # Uploaded files (auto-created)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT + bcryptjs |
| Upload | Multer |
| OCR | tesseract.js (images) + pdf-parse (PDFs) |
| AI | Gemini Flash (optional) + Rule-based fallback |
| HTTP Client | Axios |

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd medicare
```

### 2. Setup the Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and fill in your values:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/medicare
JWT_SECRET=your_super_secret_key_here_make_it_long
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=          # Optional — leave empty to use fallback
USE_GEMINI=false          # Set to true if you have a Gemini key
USE_LOCAL_OCR=true
UPLOAD_DIR=uploads
```

### 3. Seed the Database
```bash
cd server
npm run seed
```

### 4. Start the Backend
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 5. Setup the Frontend
```bash
cd ../client
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@medicare.com | admin123 |
| Doctor (Cardiologist) | drrohan@medicare.com | doctor123 |
| Doctor (Dermatologist) | drpriya@medicare.com | doctor123 |
| Doctor (Orthopedic) | dramit@medicare.com | doctor123 |
| Doctor (General) | drneha@medicare.com | doctor123 |
| Doctor (Neurologist) | drvikram@medicare.com | doctor123 |
| Doctor (Diabetologist) | drsunita@medicare.com | doctor123 |
| Patient | naman@gmail.com | patient123 |

---

## API Reference

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Any role |

### Reports (Patient)
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/reports/upload | PATIENT |
| GET | /api/reports/my | PATIENT |
| GET | /api/reports/:id | PATIENT |
| POST | /api/reports/:id/extract-text | PATIENT |
| POST | /api/reports/:id/analyze | PATIENT |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/admin/reports | ADMIN |
| GET | /api/admin/reports/:id | ADMIN |
| PATCH | /api/admin/reports/:id/assign-doctor | ADMIN |
| POST | /api/admin/reports/:id/reanalyze | ADMIN |
| GET | /api/admin/patients | ADMIN |
| GET | /api/admin/stats | ADMIN |
| GET | /api/doctors | ADMIN |
| POST | /api/doctors | ADMIN |
| PATCH | /api/doctors/:id | ADMIN |

### Doctor
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/doctor/reports | DOCTOR |
| GET | /api/doctor/reports/:id | DOCTOR |
| PATCH | /api/doctor/reports/:id/mark-reviewed | DOCTOR |
| GET | /api/doctor/stats | DOCTOR |

---

## Core Workflow

```
Patient registers/logs in
    → Uploads prescription/report (JPG, PNG, PDF)
    → System extracts text (tesseract.js / pdf-parse)
    → If extraction fails → manual transcript input
    → AI classifier analyzes transcript
        → Gemini Flash (if key available)
        → Rule-based fallback (always works)
    → Returns: category, confidence, urgency, reason, keywords
    → Best available doctor in that category auto-assigned
    → Admin can review, reassign, or reanalyze
    → Doctor reviews transcript + AI reason, marks case as reviewed
```

---

## AI Classification

### Gemini Flash (when API key provided)
Returns structured JSON with category, confidence, urgency, reason, keywords.

### Rule-Based Fallback (always available)
Keyword matching across 9 doctor categories:

| Category | Example Keywords |
|---|---|
| Cardiologist | ECG, chest pain, blood pressure, cardiac |
| Dermatologist | rash, skin, eczema, allergy |
| Orthopedic | fracture, bone, X-ray, joint pain |
| Neurologist | headache, seizure, stroke, nerve |
| Diabetologist | blood sugar, glucose, HbA1c, insulin |
| Gynecologist | pregnancy, menstrual, PCOS |
| Pediatrician | child, infant, vaccination |
| ENT Specialist | ear, nose, throat, sinus |
| General Physician | fever, cold, cough, weakness |

---

## Security

- Passwords hashed with bcryptjs (12 rounds)
- JWT tokens (7 day expiry) stored in localStorage
- Role-based middleware on every protected route
- Patient can only see their own reports
- Doctor can only access reports assigned to them
- Admin has full access with manual override capability
- File type validation (JPG, PNG, PDF only)
- File size limit (10MB)

---

## .env.example

```env
PORT=5000
MONGO_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=
USE_GEMINI=false
USE_LOCAL_OCR=true
UPLOAD_DIR=uploads
```

---

## What Is Built

- ✅ Full authentication (register, login, JWT, role guard)
- ✅ Patient report upload (JPG, PNG, PDF)
- ✅ OCR text extraction (tesseract.js + pdf-parse)
- ✅ Manual transcript fallback
- ✅ AI classification with Gemini + rule-based fallback
- ✅ Auto doctor assignment by category
- ✅ All 3 role dashboards (Patient, Admin, Doctor)
- ✅ Admin manual reassign + reanalyze
- ✅ Doctor mark as reviewed
- ✅ Status flow: PENDING → ASSIGNED → REVIEWED
- ✅ AI result display (confidence, urgency, reason, keywords)


---

## AI Tools Used

Built with assistance from Claude (Anthropic) for code scaffolding. All architecture decisions, debugging, and implementation ownership by the candidate.