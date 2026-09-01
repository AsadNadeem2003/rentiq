# 🏠 Rentiq (KirayaPad) — Peer-to-Peer Property Rental & Sales Platform

[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015%20(App%20Router)-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![NestJS 10](https://img.shields.io/badge/Backend-NestJS%2010-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20RLS-4169E1?style=for-the-badge&logo=postgresql)](https://supabase.com/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/RealTime-Socket.io-010101?style=for-the-badge&logo=socketdotio)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> **Rentiq (KirayaPad)** is an enterprise-grade, full-stack Peer-to-Peer (P2P) Property Rental & Sales platform built specifically for the Pakistani real estate market. It features CNIC identity verification (`Verified Renter 🛡️`), server-side AES-256-GCM message encryption, localized Pakistani currency formatting (`Lac` & `Crore`), real-time Socket.io chat, and an interactive Leaflet map interface.

---

## 🌐 Live Production Links

- **Live Web Application (Vercel):** [https://rentiq-snowy.vercel.app](https://rentiq-snowy.vercel.app)
- **Live Interactive Client Docs:** [https://rentiq-snowy.vercel.app/docs](https://rentiq-snowy.vercel.app/docs)
- **Live Backend REST API (Render):** [https://rentiq-backend-qmd6.onrender.com/api](https://rentiq-backend-qmd6.onrender.com/api)
- **API Swagger Documentation:** [https://rentiq-backend-qmd6.onrender.com/api/docs](https://rentiq-backend-qmd6.onrender.com/api/docs) *(Set `ENABLE_SWAGGER=true`)*

---

## ✨ Key Features & Architecture

### 1. Explore Feed & Interactive Map View (`/feed`)
- Dynamic filtering by City (Lahore, Karachi, Islamabad, Rawalpindi, etc.), Type (`RENT` / `SALE`), PKR Price Range, Bedrooms, and Roommate mode.
- Dual-view interface: Responsive Property Card Grid + Interactive **Leaflet Map View** with custom markers.

### 2. Tenant Identity Verification (`Verified Renter 🛡️`)
- 13-digit Pakistani CNIC validation (`35201-1234567-1`) with client-side Zod regex enforcement.
- Server-side **AES-256-GCM encryption** for CNIC data before storage in PostgreSQL.
- Earns trusted green `Verified Renter 🛡️` badge displayed across profiles, listings, and chat.

### 3. Property Details & Roommate Rent-Split Calculator (`/properties/[id]`)
- Interactive photo viewer with thumbnail selector strip, count badge (`1 / N`), and full-screen Lightbox overlay.
- Built-in **Roommate Rent-Split Calculator** (e.g. PKR 75,000 rent split 3 ways = PKR 25,000 / person).
- Owner management controls: Edit listing, mark status (`AVAILABLE`, `RENTED`, `SOLD`), or delete listing.

### 4. Post & Edit Property Listings (`/properties/new`)
- Form sections: Details, PKR Price & Value, Rent Sharing Settings, Media Uploads (max 5 files), Interactive Location Pin Picker (`LocationPickerMap`).
- Real-time Pakistani Currency formatter (`50 Lac`, `2.5 Crore`) with 1-click price adder buttons (`+ 1 Lac`, `+ 5 Lac`, `+ 50 Lac`, `+ 1 Crore`).

### 5. Encrypted Real-Time Inbox & Chat (`/inbox`, `/chat/[id]`)
- Socket.io WebSocket real-time delivery (`sendMessage`, `newMessage`, `joinRoom`).
- End-to-end server-side **AES-256-GCM text encryption** via `CryptoService`.
- Unread message counters & header badges.

### 6. Interactive Documentation Portal (`/docs`)
- Full React-docs style client documentation hub with component-by-component API data flow matrix, 3 interactive playgrounds (Rent Splitter, Lac/Crore Formatter, CNIC Validator), cURL snippets, and FAQs.

---

## 🔒 Security Architecture & Governance

1. **Dual-Token Authentication System:**
   - **Access Token:** Short-lived 15-minute JWT stored in memory.
   - **Refresh Token:** 7-day expiration, stored as a bcrypt hash in PostgreSQL.
   - **HttpOnly Cookie:** Transmitted via `HttpOnly`, `SameSite=Strict`, `Path=/api/auth` browser cookie (protected against XSS).
   - **Silent Token Renewal:** Axios 401 response interceptor in `AuthContext.tsx` automatically calls `/api/auth/refresh`.

2. **Data Encryption at Rest (AES-256-GCM):**
   - Chat messages and CNIC identity numbers encrypted prior to PostgreSQL SQL insertion.

3. **Database Row Level Security (RLS):**
   - RLS policies enforced on `User`, `Property`, `Conversation`, and `Message` tables on Supabase.

4. **Rate Limiting & Headers:**
   - Helmet HTTP security headers + `@nestjs/throttler` (5 auth attempts/min).
   - Strict CORS origin locking to `FRONTEND_URL`.

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technology | Primary Libraries / Packages |
|---|---|---|
| **Frontend** | Next.js 15 (App Router), React 19 | TypeScript, Tailwind CSS v4, Lucide Icons, Sonner Toasts, Zod Validation, React Hook Form, Leaflet Maps, Axios |
| **Backend** | NestJS 10 (Node.js) | TypeScript, Prisma ORM, Class Validator, Socket.io, Multer, Crypto, Throttler, Helmet, CookieParser |
| **Database** | PostgreSQL | Supabase (Hosted) with Row Level Security (RLS) policies |
| **Storage** | Supabase Storage | Bucket: `properties` |
| **Deployment** | Vercel & Render | Vercel (Frontend), Render Web Service (Backend), Cron-Job.org (24/7 Keep-Alive) |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js `v20.x` or higher
- PostgreSQL database or Supabase URL
- Git

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/AsadNadeem2003/rentiq.git
cd rentiq
```

### 2. Configure Environment Variables

#### Backend (`backend/.env`):
```env
DATABASE_URL="postgresql://user:pass@host:5432/postgres"
JWT_ACCESS_SECRET="your_access_secret_key"
JWT_REFRESH_SECRET="your_refresh_secret_key"
ENCRYPTION_KEY="64_character_hex_string"
FRONTEND_URL="http://localhost:3000"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your_supabase_service_role_key"
```

#### Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 3. Run Database Migrations
```bash
cd backend
npx prisma migrate dev
```

### 4. Start Development Servers

Terminal 1 (Backend API):
```bash
cd backend
npm run start:dev
```
*API runs at `http://localhost:3001/api`*

Terminal 2 (Frontend Web App):
```bash
cd frontend
npm run dev
```
*App runs at `http://localhost:3000`*

---

## 📜 License

Distributed under the MIT License. Built with ❤️ for the Pakistani Real Estate Community.
