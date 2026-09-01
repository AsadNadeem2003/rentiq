# 🛠️ Rentiq (KirayaPad) — Complete Tools, Technologies & Dependencies Inventory

This document lists every tool, library, framework, environment variable, and cloud infrastructure component utilized across the **Rentiq (KirayaPad)** monorepo.

---

## 1. Core Frameworks & Runtimes

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | Next.js (App Router) | `15.x` / `16.x` | React Server Components, file-system routing, SEO optimization, and static rendering |
| **UI Library** | React | `19.x` | Component-based UI engine |
| **Backend Framework** | NestJS | `10.x` | Enterprise modular Node.js backend framework with TypeScript support |
| **Runtime Environment** | Node.js | `v20.x` | JavaScript/TypeScript server-side runtime |
| **Language** | TypeScript | `v5.x` | Static typing, interface contracts, compile-time safety across frontend & backend |

---

## 2. Database, ORM & Cloud Infrastructure

| Tool / Service | Category | Purpose / Implementation |
|---|---|---|
| **Supabase (PostgreSQL)** | Cloud Database | Primary relational database hosting `User`, `Property`, `Conversation`, and `Message` tables |
| **PostgreSQL RLS** | Database Security | Row Level Security policies enforcing data access control at database level |
| **Prisma ORM** | Database ORM | Type-safe SQL query builder, data modeling (`schema.prisma`), and database migrations (`prisma migrate`) |
| **Supabase Storage** | Object Storage | Cloud file storage for property images/media (Bucket: `properties`) |
| **Vercel** | Web Hosting | Global edge deployment host for Next.js frontend (`https://rentiq-snowy.vercel.app`) |
| **Render** | Web Hosting | Linux cloud instance hosting NestJS backend API & WebSockets (`https://rentiq-backend-qmd6.onrender.com/api`) |
| **Cron-Job.org** | Uptime Automation | Automated 10-minute ping job keeping Render backend awake 24/7 (eliminating cold starts) |

---

## 3. Frontend Packages & Libraries (`frontend/package.json`)

| Package Name | Purpose / Use Case |
|---|---|
| `next` | Core Next.js 15 App Router framework |
| `react` / `react-dom` | Core React 19 UI rendering library |
| `typescript` | Static type checker |
| `tailwindcss` | Utility-first CSS framework for responsive layout design |
| `lucide-react` | Modern clean icon set (Activity, Building, Lock, Shield, Search, etc.) |
| `axios` | HTTP client with global 401 silent token refresh interceptors and 500 error handling |
| `zod` | Client-side schema validation (CNIC regex, property inputs, auth DTOs) |
| `react-hook-form` / `@hookform/resolvers` | Form state management and Zod integration |
| `leaflet` / `react-leaflet` / `leaflet-geosearch` | Interactive geographical property map view (`MapView`) and location picker (`LocationPickerMap`) |
| `socket.io-client` | Real-time WebSocket connection client for chat messaging (`SocketContext`) |
| `sonner` | Toast feedback notification system |
| `clsx` / `tailwind-merge` | Dynamic Tailwind class merging utility (`cn()`) |
| `next-themes` | Theme provider support |

---

## 4. Backend Packages & Libraries (`backend/package.json`)

| Package Name | Purpose / Use Case |
|---|---|
| `@nestjs/core` / `@nestjs/common` | Core NestJS architecture (Modules, Controllers, Services, Guards, Pipes, Interceptors) |
| `@nestjs/cli` | NestJS development CLI for building (`nest build`) |
| `@nestjs/jwt` / `passport-jwt` | JSON Web Token authentication strategy |
| `@nestjs/websockets` / `@nestjs/platform-socket.io` | WebSocket gateway implementation on port 3001 (`ChatGateway`) |
| `@nestjs/throttler` | Global rate-limiting middleware (5 login attempts/min) |
| `prisma` / `@prisma/client` | Type-safe database queries and migrations |
| `bcrypt` | Hashing passwords and refresh tokens (`hashedRefreshToken`) |
| `class-validator` / `class-transformer` | Global DTO validation pipe (`whitelist: true, forbidNonWhitelisted: true`) |
| `helmet` | HTTP security headers |
| `cookie-parser` | Express cookie parser for reading HttpOnly refresh token cookies |
| `multer` / `@supabase/supabase-js` | Multipart image file uploads and cloud bucket persistence |
| `@nestjs/swagger` / `swagger-ui-express` | OpenAPI / Swagger interactive API documentation generator |

---

## 5. Security & Cryptography Tools

| Tool / Mechanism | Specification | Description |
|---|---|---|
| **Symmetric Encryption** | `AES-256-GCM` | Node.js `crypto` module encrypting chat text & 13-digit CNIC numbers before SQL insertion |
| **Password Hashing** | `bcrypt` (10 rounds) | Salted password & refresh token hashing |
| **Access Tokens** | JWT (15-min expiry) | Short-lived in-memory authorization bearer tokens |
| **Refresh Tokens** | JWT (7-day expiry) | Long-lived `HttpOnly, SameSite=Strict` browser cookies |

---

## 6. Environment Variables Inventory

### Backend Environment Variables (`backend/.env`):
- `DATABASE_URL`: Connection string to PostgreSQL / Supabase
- `JWT_ACCESS_SECRET`: Secret key for signing 15-minute access tokens
- `JWT_REFRESH_SECRET`: Secret key for signing 7-day refresh tokens
- `ENCRYPTION_KEY`: 64-character hexadecimal key for AES-256-GCM encryption
- `FRONTEND_URL`: Allowed CORS origin (`https://rentiq-snowy.vercel.app` in prod)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase service role / API key
- `ENABLE_SWAGGER`: Toggle to enable Swagger API docs in production (`true`/`false`)

### Frontend Environment Variables (`frontend/.env.local`):
- `NEXT_PUBLIC_API_URL`: Base API endpoint URL (`https://rentiq-backend-qmd6.onrender.com/api` in prod)
