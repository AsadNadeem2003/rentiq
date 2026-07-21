# Day 1: Backend Foundation — Walkthrough

## What Was Done

We set up the complete NestJS backend foundation for Rentiq (KirayaPad) with Auth and Properties CRUD, following the technical spec exactly.

---

## 1. Project Setup

### NestJS Initialization
```bash
npx -y @nestjs/cli@latest new backend --package-manager npm --skip-git --strict
```
- Created the `backend/` directory with the standard NestJS folder structure
- `--strict` enabled strict TypeScript for better type safety
- `--skip-git` avoided creating a nested git repo

### Dependencies Installed

**Production packages** (`npm install`):
| Package | Purpose |
|---|---|
| `@prisma/client` | ORM client for database queries |
| `@nestjs/jwt` | JWT token creation/verification |
| `@nestjs/passport` | NestJS integration with Passport.js |
| `passport` / `passport-jwt` | Auth middleware + JWT strategy |
| `bcrypt` | Password hashing (salted) |
| `class-validator` / `class-transformer` | DTO validation decorators |
| `@nestjs/config` | Loads `.env` variables |

**Dev packages** (`npm install -D`):
| Package | Purpose |
|---|---|
| `prisma` | CLI tool for migrations and client generation |
| `@types/bcrypt` | TypeScript types for bcrypt |
| `@types/passport-jwt` | TypeScript types for passport-jwt |
| `dotenv` | Loads `.env` files (used by prisma.config.ts) |

---

## 2. Prisma & Database Schema

### Initialization
```bash
npx prisma init --datasource-provider postgresql
```
Created `prisma/schema.prisma`, `prisma.config.ts`, and `.env`.

### Schema ([schema.prisma](file:///d:/Amperor%20Tech%20Internship%20Projects/Rentiq%20(KirayaPad)/backend/prisma/schema.prisma))
4 models defined exactly per spec:
- **User** — id, email (unique), hashed password, name, relations to properties/conversations/messages
- **Property** — id, title, description, price, type (RENT/SALE), beds, baths, city, lat, lng, mediaUrls[], ownerId
- **Conversation** — id, propertyId, buyerId, ownerId with `@@unique([propertyId, buyerId, ownerId])` constraint
- **Message** — id, conversationId, senderId, text

### Client Generation
```bash
npx prisma generate
```
Generated TypeScript client at `backend/generated/prisma/` with typed methods like `prisma.user.create()`.

---

## 3. Backend Architecture (File Tree)

```
backend/
├── prisma/
│   ├── schema.prisma          ← Database models
│   └── seed.ts                ← Dummy data script (3 users, 16 properties)
├── generated/
│   └── prisma/                ← Auto-generated Prisma Client (don't edit)
├── src/
│   ├── main.ts                ← Entry point (ValidationPipe, CORS, /api prefix)
│   ├── app.module.ts          ← Root module (imports Config, Prisma, Auth, Properties)
│   ├── prisma/
│   │   ├── prisma.module.ts   ← Global module (available everywhere)
│   │   └── prisma.service.ts  ← Wraps PrismaClient with NestJS lifecycle hooks
│   ├── auth/
│   │   ├── auth.module.ts     ← Wires Passport + JWT + controller + service
│   │   ├── auth.controller.ts ← POST /auth/signup, POST /auth/login
│   │   ├── auth.service.ts    ← Signup (bcrypt hash), Login (compare), JWT generation
│   │   ├── dto/
│   │   │   └── auth.dto.ts    ← SignupDto, LoginDto with validators
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts ← @UseGuards(JwtAuthGuard) for protected routes
│   │   └── strategies/
│   │       └── jwt.strategy.ts   ← Extracts + verifies Bearer token, attaches req.user
│   └── properties/
│       ├── properties.module.ts     ← Properties module
│       ├── properties.controller.ts ← GET/POST/PATCH/DELETE routes
│       ├── properties.service.ts    ← CRUD logic with owner-only enforcement
│       └── dto/
│           └── property.dto.ts      ← CreatePropertyDto, UpdatePropertyDto, QueryPropertyDto
├── .env                        ← DATABASE_URL + JWT_SECRET (you need to fill in)
├── prisma.config.ts            ← Prisma config (reads DATABASE_URL from .env)
├── package.json                ← Dependencies + prisma seed config
└── tsconfig.json               ← TypeScript config
```

---

## 4. API Routes Created

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create account, returns JWT |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/properties` | Public | Paginated feed with filters |
| GET | `/api/properties/:id` | Public | Single property detail |
| POST | `/api/properties` | JWT Required | Create a listing |
| PATCH | `/api/properties/:id` | JWT + Owner | Edit own listing |
| DELETE | `/api/properties/:id` | JWT + Owner | Delete own listing |

### Query Parameters for GET /properties
- `city` — Filter by city (case-insensitive)
- `type` — "RENT" or "SALE"
- `beds` — Minimum number of bedrooms
- `minPrice` / `maxPrice` — Price range filter
- `page` / `limit` — Pagination (default: page 1, 12 items)

---

## 5. Key Design Decisions Explained

1. **Global ValidationPipe** in `main.ts` — Makes DTO decorators actually work. Without it, `@IsEmail()` would be ignored.
2. **`whitelist: true`** — Strips unknown fields from requests (security against injection)
3. **`/api` global prefix** — All routes are under `/api/...` to avoid conflicts with the frontend
4. **CORS configured for `localhost:3000`** — The Next.js frontend will run on port 3000
5. **Owner-only enforcement in service layer** — Not just hidden in UI, enforced server-side (spec Section 6)
6. **`mediaUrls: []` stub** — Upload pipeline comes Day 2; the field exists but is empty for now

---

## 6. Environment Variables Needed

Edit [.env](file:///d:/Amperor%20Tech%20Internship%20Projects/Rentiq%20(KirayaPad)/backend/.env):

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
```

> [!IMPORTANT]
> Get your `DATABASE_URL` from **Supabase Dashboard → Settings → Database → Connection String → URI**

---

## 7. Next Steps (Remaining for Day 1)

Once you set your real `DATABASE_URL` in `.env`:

```bash
# Create the tables in your Supabase database
npx prisma migrate dev --name init

# Populate with dummy data
npx prisma db seed

# Start the dev server
npm run start:dev
```

Then verify with Postman/Thunder Client:
1. `POST http://localhost:3001/api/auth/signup` with `{ "email": "test@test.com", "password": "password123", "name": "Test User" }`
2. `POST http://localhost:3001/api/auth/login` with `{ "email": "test@test.com", "password": "password123" }`
3. `POST http://localhost:3001/api/properties` with the JWT in Authorization header
4. `GET http://localhost:3001/api/properties`
