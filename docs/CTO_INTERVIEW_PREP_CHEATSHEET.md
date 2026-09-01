# 🏆 CTO Final Review & Hiring Master Cheat Sheet: Rentiq (KirayaPad)

> **Purpose:** This cheat sheet is your complete technical study guide for your final review meeting with CTO Saqib. It covers the full-stack architecture, security mechanisms, deployment troubleshooting, and exact answers to technical interview questions.

---

## Part 1: The 60-Second CTO Elevator Pitch

If CTO Saqib asks: *"Give me an overview of what you built in Rentiq and its technical architecture."*

**Your Answer:**
> *"Rentiq (KirayaPad) is an enterprise-grade Peer-to-Peer real estate platform tailored specifically for the Pakistani market. 
> 
> On the **Frontend**, it's built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**, featuring interactive Leaflet map integration, client-side Zod validation, a live Pakistani currency formatter (`Lac` & `Crore`), and a dedicated React-docs style documentation portal at `/docs`.
> 
> On the **Backend**, it runs a **NestJS 10** microservice architecture with **Prisma ORM** connecting to a hosted **Supabase PostgreSQL** database protected by **Row Level Security (RLS)**.
> 
> Security is non-negotiable in Rentiq: we implemented a **Dual-Token Auth system** (15-min Access Token + 7-day HttpOnly `SameSite=Strict` Refresh Cookie with silent Axios renewal), server-side **AES-256-GCM encryption** for CNIC identity numbers and chat text, **Socket.io real-time WebSockets** for instant buyer-landlord messaging, and full production deployment on **Vercel** and **Render** with 24/7 keep-alive automation."*

---

## Part 2: Full-Stack Component-by-Component Data Flow

Understanding how data travels from your React UI down to PostgreSQL is critical:

```
[React 19 UI Component] 
       ↓ (Zod Client Validation)
[Axios / Socket.io Client] 
       ↓ (HTTPS / WSS Request)
[NestJS Global Pipes & Guards] (ValidationPipe, JwtAuthGuard, Throttler, Helmet)
       ↓
[NestJS Controller & Service]
       ↓ (CryptoService: AES-256-GCM Encryption)
[Prisma ORM]
       ↓ (SQL Queries)
[PostgreSQL Database (Supabase)] (Protected by Row Level Security - RLS)
```

### Detailed Component Trace:
1. **`Navbar.tsx`**: Reads authentication state via `AuthContext`, checks unread messages via `SocketContext`, and triggers silent refresh calls to `/api/auth/refresh`.
2. **`signup/page.tsx` & `login/page.tsx`**: Sends auth DTOs to `POST /api/auth/signup` and `POST /api/auth/login`. Receives 15-min Access Token in memory and sets 7-day `HttpOnly` refresh cookie.
3. **`feed/page.tsx` & `MapView.tsx`**: Sends query parameters (`city`, `type`, `minPrice`, `maxPrice`, `beds`, `isRoommateAllowed`) to `GET /api/properties`. Prisma executes optimized filtered SQL queries.
4. **`properties/new/page.tsx` & `LocationPickerMap.tsx`**: Validates inputs with Zod (`@/lib/schemas.ts`), submits multipart form data to `POST /api/properties`. `MulterModule` uploads media files to Supabase Storage bucket `properties`.
5. **`settings/page.tsx`**: Submits 13-digit CNIC (`35201-1234567-1`) to `PATCH /api/auth/verify`. `CryptoService` encrypts CNIC using **AES-256-GCM** before database update, setting `isVerified = true` and awarding the green **Verified Renter 🛡️** badge.
6. **`inbox/page.tsx` & `chat/[id]/page.tsx`**: Listens to WebSocket events (`joinRoom`, `sendMessage`, `newMessage`) on Socket.io Gateway (Port 3001). Messages are encrypted at rest with AES-256-GCM and decrypted on-the-fly for authorized participants.

---

## Part 3: The 6 Security Pillars of Rentiq

If CTO Saqib asks: *"What security measures did you implement to protect user data and APIs?"*

1. **Dual-Token Authentication Strategy:**
   - **Access Token:** Short-lived 15-minute JWT held in memory.
   - **Refresh Token:** Long-lived 7-day JWT stored as a salted `bcrypt` hash in PostgreSQL.
   - **HttpOnly Cookie:** Sent via `HttpOnly`, `SameSite=Strict`, `Path=/api/auth` browser cookie (protected against XSS).
   - **Silent Token Renewal:** Axios 401 response interceptor catches expired access tokens, calls `/api/auth/refresh`, and seamlessly retries failed requests without interrupting the user.

2. **AES-256-GCM Data Encryption at Rest:**
   - Standard database encryption is insufficient if a DB dump is leaked. All 13-digit CNIC numbers and direct chat message texts are encrypted by `CryptoService` before SQL insertion using Node.js `crypto` with `AES-256-GCM` authentication tags.

3. **PostgreSQL Row Level Security (RLS):**
   - RLS policies on Supabase ensure database-level access control. A user cannot read another user's private messages or update properties they do not own.

4. **Strict DTO & Schema Validation:**
   - Backend: NestJS `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true, transform: true`.
   - Frontend: Zod schemas (`@/lib/schemas.ts`) providing inline red error text and red input borders.

5. **Rate Limiting & Security Headers:**
   - `@nestjs/throttler` limits auth attempts to 5 per minute to prevent brute-force attacks.
   - Express `helmet()` configures HTTP security headers.
   - Production HTTPS redirect middleware converts HTTP requests to HTTPS automatically.

6. **Swagger Production Protection:**
   - OpenAPI / Swagger documentation (`/api/docs`) is hidden in production by default behind `process.env.ENABLE_SWAGGER === 'true'` to avoid exposing API signatures to attackers.

---

## Part 4: Deployment Nuances & Troubleshooting (How We Solved Real Production Bugs)

If CTO Saqib asks: *"What deployment issues did you face on Render and Vercel, and how did you resolve them?"*

### Bug 1: Render `sh: 1: nest: not found` Error
- **Cause:** Render installs packages under `NODE_ENV=production`, skipping `devDependencies`.
- **Solution:** Moved `@nestjs/cli`, `typescript`, `prisma`, `ts-loader`, and `tsconfig-paths` from `devDependencies` into `dependencies` in `backend/package.json`.

### Bug 2: TypeScript Output Directory (`Cannot find module dist/main.js`)
- **Cause:** Having `prisma.config.ts` in the root of `backend/` caused TypeScript to emit output as `dist/src/main.js` instead of `dist/main.js`.
- **Solution:** Updated `start:prod` script in `backend/package.json` to `"node dist/src/main"`.

### Bug 3: Health Check 404 Log Noise (`Cannot GET /`)
- **Cause:** Render's health checker hits root `/`, but NestJS routed everything under global prefix `/api`.
- **Solution:** Configured `app.setGlobalPrefix('api', { exclude: ['/'] })` in `main.ts` and created a root `@Get()` health check handler in `AppController` returning `{ status: 'OK' }`.

### Bug 4: Vercel Monorepo Deployment (`404 NOT_FOUND`)
- **Cause:** Vercel tried building from repository root instead of the `frontend` subdirectory.
- **Solution:** Configured Vercel **Root Directory** = `frontend`, set `NEXT_PUBLIC_API_URL`, and updated CORS `FRONTEND_URL` on Render.

### Bug 5: Render 15-Minute Sleep & Cold Starts
- **Cause:** Render free tier sleeps after 15 minutes of inactivity, causing 50-second cold starts.
- **Solution:** Set up an automated 10-minute ping job via `cron-job.org` pointing to `https://rentiq-backend-qmd6.onrender.com/`, keeping the server 100% awake 24/7!

---

## Part 5: Top 10 Technical Questions CTO Saqib Might Ask & Winning Answers

### Q1: Why NestJS over plain Express?
> *"NestJS provides an out-of-the-box modular architecture with Dependency Injection, TypeScript support, built-in validation pipes, microservice modules, and WebSocket gateways. Plain Express requires writing custom boilerplate for routing, middleware, and dependency management."*

### Q2: Why Next.js 15 App Router instead of Pages Router?
> *"The App Router leverages React Server Components, server-side streaming, automatic code splitting, optimized layouts, and enhanced SEO performance out of the box."*

### Q3: How do you handle Pakistani currency values in Rentiq?
> *"We built a custom utility `formatPakistaniCurrency(price)` in `@/lib/utils`. Amounts >= 1 Crore (10M) format as `X.XX Crore`, amounts >= 1 Lac (100k) format as `X.XX Lac`, and smaller amounts use comma formatting `PKR XX,XXX`. We also provide 1-click price adder buttons (`+ 1 Lac`, `+ 1 Crore`) in property forms."*

### Q4: Why use AES-256-GCM instead of plain AES-CBC or base64?
> *"AES-256-GCM is an Authenticated Encryption mode. It not only encrypts the data using a 256-bit key but also generates an Authentication Tag that guarantees data integrity and protects against tamper attacks."*

### Q5: How does Socket.io handle authenticated chat rooms?
> *"When a user opens a conversation, the client emits `joinRoom` with the `conversationId`. The server verifies that the requesting user is a participant in that conversation, joins the socket room, and emits `newMessage` payloads strictly to members of that room."*

### Q6: Why store Refresh Tokens in HttpOnly cookies instead of LocalStorage?
> *"LocalStorage is accessible by JavaScript, making it vulnerable to XSS (Cross-Site Scripting) attacks where a malicious script steals the token. `HttpOnly` cookies are unreadable by JavaScript, making them far more secure for long-lived refresh tokens."*

### Q7: How does Prisma ORM handle database schema migrations?
> *"Prisma uses declarative data modeling in `schema.prisma`. We run `npx prisma migrate dev` locally to generate SQL migration scripts and apply them. In production, we run `npx prisma migrate deploy` to safely apply migrations to Supabase."*

### Q8: What is Row Level Security (RLS) in PostgreSQL?
> *"RLS allows us to define fine-grained security policies directly on database tables (e.g. `Property`, `Message`). Even if an unauthorized SQL query is attempted, PostgreSQL enforces that users can only view or modify records where their user ID matches the owner/sender foreign key."*

### Q9: How do you validate user input on both client and server?
> *"On the client, we use **Zod** schemas in `@/lib/schemas.ts` integrated with `react-hook-form` to display instant inline red error text. On the server, NestJS uses **class-validator** DTOs with `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` to reject invalid payloads at the API boundary."*

### Q10: How do you prevent cold starts on Render's free tier?
> *"We configured an automated 10-minute HTTP `GET` ping via `cron-job.org` targeting our backend health route. This keeps the Node.js process active 24/7 without shutting down."*
