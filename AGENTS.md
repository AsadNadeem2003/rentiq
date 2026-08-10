# 🏠 Rentiq (KirayaPad) — AI Agent Guidelines & Project Blueprint

> **Notice for AI Agents:** This document is the Single Source of Truth for the **Rentiq (KirayaPad)** monorepo. Read this file carefully before making architectural, security, design, or code changes.

---

## 1. Project Overview

**Rentiq (KirayaPad)** is a Peer-to-Peer (P2P) Property Rental & Sales platform designed specifically for the Pakistani real estate market.

- **Frontend:** Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS, Lucide Icons, Sonner Toasts, Zod Validation) — Runs on `http://localhost:3000`
- **Backend:** NestJS 10 (TypeScript, Prisma ORM, Class Validator, Socket.io, Multer, Crypto, Throttler, Helmet, CookieParser) — Runs on `http://localhost:3001/api`
- **Database:** PostgreSQL with Row Level Security (RLS) policies (Hosted on Supabase / Local)
- **Storage:** Supabase Storage (Bucket: `properties`)
- **Real-Time Communications:** Socket.io (Port 3001)

---

## 2. Core Feature Architecture

1. **Explore Feed & Search (`/feed`):**
   - Dynamic filters by City, Type (`RENT` / `SALE`), Price Range (PKR), Beds, and Roommate mode.
   - Dual view: Responsive Property Cards grid + Interactive Leaflet Map View (`MapView`).

2. **Property Details (`/properties/[id]`):**
   - Responsive main photo viewer with interactive thumbnail selector strip, image count badge (`1 / N`), and full-screen Image Lightbox overlay.
   - Rent Sharing / Roommate Rent-Split calculator (e.g. Total PKR 50,000 → Split 2 ways = PKR 25,000 / person).
   - Owner controls: Edit listing, mark status (`AVAILABLE`, `RENTED`, `SOLD`), delete listing.
   - Buyer controls: Direct "Message Owner" initiation.

3. **Post & Edit Listings (`/properties/new`, `/properties/[id]/edit`):**
   - Form sections: Property Details, PKR Price & Value, Rent Sharing Settings, Media Uploads (max 5 files), Interactive Map Pin Picker (`LocationPickerMap`).
   - Client-side **Zod validation** with red field highlights and inline error messages.
   - Live Pakistani Currency preview formatted in Lac / Crore (e.g. `2.5 Crore` / `50 Lac`).
   - Quick 1-click price adder buttons (`+ 1 Lac`, `+ 5 Lac`, `+ 50 Lac`, `+ 1 Crore`).

4. **Encrypted Real-Time Chat (`/inbox`, `/chat/[id]`):**
   - End-to-end server-side encryption via AES-256-GCM before database insertion (`CryptoService`).
   - Real-time socket message delivery (`sendMessage`, `newMessage`, `joinRoom`).
   - Verified Renter 🛡️ badge displayed next to verified users in chat headers and property listings.

5. **Account Settings (`/settings`):**
   - Profile information update.
   - **Tenant Verification:** 13-digit National CNIC identity verification with Zod validation regex (`^\d{5}-\d{7}-\d{1}$`) to earn the green `Verified Renter 🛡️` badge.
   - Display preferences (Marla / Kanal / Sq. Ft., PKR / USD).
   - Notification channel toggles.
   - Security & Password change.

---

## 3. Security Guidelines & Constraints (NON-NEGOTIABLE)

1. **Dual-Token Authentication System:**
   - **Access Token:** Short-lived **15-minute expiration** (in-memory / state).
   - **Refresh Token:** Long-lived **7-day expiration**, stored as a bcrypt hash (`hashedRefreshToken`) in PostgreSQL.
   - **HttpOnly Cookie:** Sent as an `HttpOnly`, `SameSite=Strict`, `Path=/api/auth` browser cookie (unreadable by JavaScript/XSS).
   - **Silent Token Renewal:** Axios 401 response interceptor in `AuthContext.tsx` automatically calls `/api/auth/refresh` and retries failed requests seamlessly.

2. **Message & CNIC Privacy (AES-256-GCM):**
   - All chat message texts and 13-digit CNIC numbers MUST be encrypted by `CryptoService` before DB insertion and decrypted upon retrieval.
   - Key is stored in `ENCRYPTION_KEY` in `.env`.

3. **Global Headers, Rate Limiting & HTTPS:**
   - Global `helmet()` middleware registered in `main.ts`.
   - Rate limiting via `@nestjs/throttler` (5 attempts/min on `/auth/login` and `/auth/signup`).
   - HTTPS redirect middleware active in production (`NODE_ENV === 'production'`).
   - Swagger `/api/docs` route hidden in production.

4. **Database Row Level Security (RLS):**
   - RLS policies active on `User`, `Property`, `Conversation`, and `Message` tables in PostgreSQL/Supabase.

5. **CORS & WebSocket Protection:**
   - API & Socket CORS origins MUST be strictly locked to `process.env.FRONTEND_URL`, never `*`.

6. **Ownership Verification:**
   - Any modification (`PATCH`, `DELETE`) on properties or conversations MUST verify `property.ownerId === req.user.sub` at the NestJS service level.

---

## 4. Validation Rules & Field Constraints

All backend HTTP requests MUST pass DTO validation via `class-validator` (`main.ts` uses `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`). All frontend forms MUST pass client-side **Zod validation** (`@/lib/schemas.ts`).

| Field | Type | Constraint | Error Message / Format |
|-------|------|------------|------------------------|
| **title** | String | 5 to 100 characters | `Title must be between 5 and 100 characters` |
| **description** | String | 15 to 2,000 characters | `Description must be between 15 and 2000 characters` |
| **price** | Number | 1,000 to 2,000,000,000 PKR | `Price must be between PKR 1,000 and 2 Billion (200 Crore)` |
| **type** | String | `RENT` or `SALE` | `Type must be either RENT or SALE` |
| **beds** | Integer | 0 to 30 | `Maximum 30 bedrooms allowed` |
| **baths** | Integer | 0 to 30 | `Maximum 30 bathrooms allowed` |
| **city** | String | 2 to 60 characters | `City name must be between 2 and 60 characters` |
| **cnicNumber** | String | Pakistani CNIC Regex | `^\d{5}-\d{7}-\d{1}$` (e.g. `35201-1234567-1`) |
| **media** | Files | Max 5 files total | JPEG/PNG images & MP4 videos only |

> **Note on UI Form Labels:** Do NOT display technical constraint text like `(Max 100 chars)` or `(0 - 30)` in frontend input labels. Keep UI labels clean and user-friendly (`Property Title`, `Description`, `Bedrooms`). Render inline red error text below fields only when validation fails.

---

## 5. UI/UX & Formatting Guidelines

1. **Pakistani Currency Utility:**
   - Always use `formatPakistaniCurrency(price)` from `@/lib/utils` for user-facing prices.
   - Format rules:
     - `>= 1 Crore` (10,000,000) → `X.XX Crore`
     - `>= 1 Lac` (100,000) → `X.XX Lac`
     - `< 1 Lac` → Standard comma format `PKR XX,XXX`

2. **Mobile Responsiveness:**
   - Always design mobile-first (`w-full`, `max-w-7xl mx-auto`).
   - Use `overflow-x-hidden` on main containers to prevent horizontal scrolling.
   - Mobile navigation uses slide-down drawer menu with hamburger toggle (`Menu` / `X` icons).
   - Tab bars on mobile stack horizontally in scrollable pill rows.

3. **Feedback & Toasts:**
   - Every user action (save, edit, delete, verification, status update) MUST trigger a visual toast feedback using `sonner` (`toast.success(...)` / `toast.error(...)`).
   - Global Axios response interceptor displays automatic toast alerts for network drops or 500 server errors.

---

## 6. Git & Deployment Commands

When creating or committing features:
- Use feature branches (`git checkout -b feature/name`).
- Do NOT commit `backend/dist/` or `node_modules/` (gitignored).
- Test types before pushing (`npx tsc --noEmit` in frontend, `npm run build` in backend).
- Production deployment builds use `npx prisma migrate deploy --schema=prisma/schema.prisma`.
