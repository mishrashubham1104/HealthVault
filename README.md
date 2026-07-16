# 🏥 HealthVault — Digital Health Records Manager

> A secure, HIPAA-inspired personal health records platform built with the MERN stack. Manage, encrypt, share, and access your medical data from anywhere.

---

## 📸 Overview

HealthVault is a full-stack web application that lets patients securely store and manage their medical records, prescriptions, lab reports, vaccination cards, and more — all encrypted at rest and accessible via a clean, modern dashboard.

---

## ✨ Features

### 🔐 Security & Authentication
- JWT-based authentication with HTTP-only token handling
- **Two-Factor Authentication (2FA)** via TOTP (Google Authenticator compatible)
- AES-256 file encryption for all uploaded medical records
- Password hashing with bcrypt
- Rate limiting on all auth endpoints
- Helmet.js security headers

### 📁 Medical Records
- Upload and store lab reports, prescriptions, imaging/scans, vaccination cards, insurance documents, and more
- AI-assisted auto-categorization of uploaded documents
- Secure file download with decryption on-the-fly
- Record detail modal with metadata display

### 🩺 Health Dashboard
- Visual health analytics with charts (Recharts)
- Health visit history tracking
- Medication reminders with customizable schedules
- Upcoming appointment tracking

### 🆘 Emergency Profile & QR Code
- Shareable emergency QR code containing critical health info (blood group, allergies, conditions, emergency contact)
- Public emergency profile page accessible without login
- Configurable emergency contact details

### 🔗 Secure Sharing
- Generate time-limited sharing links with PIN protection
- Share specific records with doctors or specialists
- Access level controls (Read-Only / Read & Download / Full Audit)
- Doctor Portal for secure third-party record access

### 👨‍👩‍👧 Family Members
- Manage health records for multiple family members under one account

### ⚙️ Settings & Privacy
- Profile visibility controls (Private / Emergency Only / Restricted)
- HIPAA compliance mode toggle
- Notification preferences (appointments, reminders, security alerts)
- Upload quality preferences
- Data export (full JSON backup of all your health data)
- Account deletion

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, TailwindCSS, Redux Toolkit |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose) |
| **Auth** | JWT, bcrypt, speakeasy (TOTP 2FA) |
| **Encryption** | AES-256 (Node.js `crypto`) |
| **File Storage** | Local disk (`uploads/` directory) |
| **Charts** | Recharts |
| **Security** | Helmet, express-rate-limit, CORS |

---

## 📂 Project Structure

```
Health/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # Login, Register, Dashboard, Records, Settings...
│   │   ├── components/     # Reusable UI components
│   │   ├── store/          # Redux slices & store
│   │   └── index.css       # Global styles + Tailwind
│   ├── .env.example        # Environment variable template
│   └── vite.config.js
│
└── backend/                # Express.js REST API
    ├── controllers/        # Route logic
    ├── models/             # Mongoose schemas
    ├── routes/             # API route definitions
    ├── middleware/         # Auth, error handling
    ├── utils/              # Encryption, helpers
    ├── uploads/            # Encrypted file storage
    ├── .env.example        # Environment variable template
    └── server.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/healthvault.git
cd healthvault
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_jwt_secret_min_32_chars
ENCRYPTION_KEY=your_32_byte_aes_key_exactly_here
TWO_FACTOR_APP_NAME=HealthVault
UPLOAD_DIR=uploads
FRONTEND_URL=http://localhost:5173
```

> ⚠️ `ENCRYPTION_KEY` must be **exactly 32 characters** for AES-256.

Start the backend:

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create your `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🌐 Deployment

### Frontend
Build the production bundle:

```bash
cd frontend
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).

Set the environment variable on your hosting platform:
```
VITE_API_URL=https://your-backend-domain.com
```

### Backend
Deploy to any Node.js host (Railway, Render, Heroku, DigitalOcean, etc.).

Set these environment variables on your server:
```
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_secret
ENCRYPTION_KEY=your_32_byte_key
FRONTEND_URL=https://your-frontend-domain.com
```

---

## 🔒 Security Notes

- All uploaded files are **AES-256 encrypted** before being saved to disk
- Passwords are hashed with **bcrypt** (salt rounds: 12)
- **JWT tokens** expire and are validated on every protected route
- **Rate limiting** protects auth endpoints (10 requests / 15 minutes)
- **CORS** is restricted to the configured frontend origin only
- `.env` files are git-ignored — **never commit secrets**

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/profile` | Get current user profile |
| `PUT` | `/api/auth/profile` | Update profile details |
| `POST` | `/api/auth/change-password` | Change password |
| `POST` | `/api/auth/2fa/setup` | Setup 2FA (returns QR) |
| `POST` | `/api/auth/2fa/verify` | Verify and enable 2FA |
| `POST` | `/api/auth/2fa/disable` | Disable 2FA |
| `GET` | `/api/records` | List all records |
| `POST` | `/api/records/upload` | Upload encrypted record |
| `GET` | `/api/records/:id/download` | Download and decrypt record |
| `DELETE` | `/api/records/:id` | Delete a record |
| `POST` | `/api/sharing/create` | Create a sharing link |
| `GET` | `/api/sharing/active` | List active share links |
| `GET` | `/api/sharing/access/:code` | Access via share code |
| `GET` | `/api/reminders` | List reminders |
| `POST` | `/api/reminders` | Create reminder |
| `PUT` | `/api/reminders/:id` | Update reminder |
| `DELETE` | `/api/reminders/:id` | Delete reminder |
| `GET` | `/api/health/visits` | List health visits |
| `POST` | `/api/health/visits` | Log health visit |
| `GET` | `/api/healthcheck` | Server health status |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Shubh Mishra**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

---

> Built with ❤️ for personal health data sovereignty. Your records, your control.
