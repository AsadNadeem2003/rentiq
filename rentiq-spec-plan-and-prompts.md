# Rentiq (KirayaPad) — Technical Spec, Implementation Plan & Antigravity Prompts

## 1. Project Overview

Rentiq is a peer-to-peer property rental/sales marketplace for Pakistan, combining a map-based
discovery feed with real-time negotiation chat between buyers/tenants and owners/sellers.

**Core loop:** browse feed → view property on map → message owner → negotiate in real-time chat.

## 1.5 Full Project Scenario (Read This First)

This section exists so you understand the *whole system* before touching any code — not just the
isolated piece each prompt asks for. Every prompt after this builds on the same shared context.

**Who uses this app:** Two roles, but one `User` model — anyone can be a buyer/tenant on one
property and an owner/seller on another, simultaneously. There's no role field or separate
signup flow for "owner" vs "buyer."

**The end-to-end journey:**

1. **Signup/Login** — A user creates an account (email + password, hashed) and gets a JWT back.
   That JWT is attached to every future request and to the Socket.io handshake.

2. **Discovery Feed** — On landing, the user sees a split-screen: a scrollable grid of property
   cards on the left (image, price, beds/baths, city), and a live Leaflet/OpenStreetMap on the
   right showing a pin for every property currently visible in the grid. Clicking a pin pops up
   a mini info card for that listing. This is a browsing experience, not a search-first one —
   the map and grid are always in sync.

3. **Listing a Property** — Any logged-in user can become an "owner" simply by creating a
   listing. They fill a form (title, description, price, type RENT/SALE, beds, baths, city) and
   place the pin on an interactive map by clicking it — `useMapEvents` captures the click
   coordinates and silently fills the `lat`/`lng` fields. They upload up to 4 images (2MB each)
   and optionally 1 short video (5MB). The backend is a strict gatekeeper here: it validates size
   and type *before* anything touches Supabase Storage, because the whole project is running on
   Supabase's 1GB free tier and one bad upload could eat the budget.

4. **Viewing a Property** — Clicking a card/pin opens the full detail page. If the viewer is
   *not* the owner, they see a "Message Owner" button. If they *are* the owner, that button is
   hidden/blocked — you cannot message yourself about your own listing. This is enforced on the
   backend, not just hidden in the UI.

5. **Starting a Conversation** — Clicking "Message Owner" calls `POST /conversations` with the
   `propertyId`. The backend checks: has this exact buyer already messaged this exact owner about
   this exact property before? If yes, it returns the existing conversation (no duplicate
   threads). If no, it creates one. The user is then dropped into a chat panel.

6. **Real-Time Negotiation** — The chat is a classic split-pane messenger UI. Under the hood, the
   client connects via Socket.io using the JWT from step 1. It emits `joinRoom` for that specific
   conversation's room. When either party sends a message, the flow is strict and non-negotiable:
   the message is written to Postgres via Prisma **first**, and only *after* that write succeeds
   does the server broadcast it to everyone in the room. This ordering exists so that if a socket
   drops or the page refreshes mid-conversation, nobody ever loses message history — the DB is
   always the source of truth, sockets are just the live-update layer on top of it.

7. **Dashboard** — A user can see "My Listings" (properties they own) and "My Conversations"
   (threads where they're either the buyer or the owner) in one place.

**Why these specific guardrails exist (so you don't "fix" them):**
- File size caps and server-side validation → protecting the free-tier storage budget.
- Self-messaging block → basic sanity/product logic, not a technical constraint.
- Unique `[propertyId, buyerId, ownerId]` conversation → prevents duplicate chat threads
  cluttering the inbox.
- DB-write-before-broadcast → zero chat history loss is a hard requirement, not a nice-to-have.
- Stream-to-storage with no local disk writes → keeps the NestJS server stateless and lean.

Keep this full picture in mind for every prompt below — even when a prompt only asks for one
module, that module still has to behave consistently with this overall scenario (e.g., the
Properties module code should assume a Conversation module will exist and reference it via
`ownerId`, even on Day 1 before Conversations are built).

## 2. Tech Stack (validated, no changes)

| Layer | Tech |
|---|---|
| Backend | NestJS (TypeScript) |
| Frontend | Next.js + Tailwind CSS + shadcn/ui |
| Database | Supabase Postgres |
| ORM | Prisma |
| Auth | Custom NestJS AuthGuard, stateless JWT |
| File Storage | Supabase Storage |
| Real-time | Socket.io (`@nestjs/websockets`) |
| Maps | React-Leaflet + OpenStreetMap |

Socket.io is correct here since NestJS runs as a persistent server (not serverless) — no need for
Ably/Pusher. If ever horizontally scaled, add a Redis adapter later; not needed for this build.

## 3. Database Schema (Prisma)

Unified `User` model — every user can be buyer and owner.

```prisma
model User {
  id                   String         @id @default(uuid())
  email                String         @unique
  password             String
  name                 String
  properties           Property[]
  conversationsAsBuyer Conversation[] @relation("BuyerConversations")
  conversationsAsOwner Conversation[] @relation("OwnerConversations")
  messages             Message[]
  createdAt            DateTime       @default(now())
}

model Property {
  id            String         @id @default(uuid())
  title         String
  description   String
  price         Float
  type          String         // "RENT" or "SALE"
  beds          Int
  baths         Int
  city          String
  lat           Float
  lng           Float
  mediaUrls     String[]
  ownerId       String
  owner         User           @relation(fields: [ownerId], references: [id])
  conversations Conversation[]
  createdAt     DateTime       @default(now())
}

model Conversation {
  id         String    @id @default(uuid())
  propertyId String
  property   Property  @relation(fields: [propertyId], references: [id])
  buyerId    String
  buyer      User      @relation("BuyerConversations", fields: [buyerId], references: [id])
  ownerId    String
  owner      User      @relation("OwnerConversations", fields: [ownerId], references: [id])
  messages   Message[]
  createdAt  DateTime  @default(now())

  @@unique([propertyId, buyerId, ownerId])
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  senderId       String
  sender         User         @relation(fields: [senderId], references: [id])
  text           String
  createdAt      DateTime     @default(now())
}
```

## 4. Backend Modules & Endpoints (NestJS)

### 4.1 Auth Module
- `POST /auth/signup` — hash password, create user, return JWT
- `POST /auth/login` — verify credentials, return JWT
- `AuthGuard` — validates JWT on protected routes, attaches `req.user`

### 4.2 Properties Module
- `GET /properties` — paginated feed, filterable by `city`, `type`, `beds`, price range
- `GET /properties/:id` — single property detail
- `POST /properties` — multipart/form-data, protected route
  - `MaxFileSizeValidator` + `FileTypeValidator`: max 4 images (2MB each, JPEG/PNG), max 1 video
    (5MB, MP4)
  - Files streamed directly to Supabase bucket — never written to local disk
- `PATCH /properties/:id` — owner-only edit
- `DELETE /properties/:id` — owner-only delete

### 4.3 Conversations Module
- `POST /conversations` — body `{ propertyId }`
  - Derives `ownerId` from property, `buyerId` from `req.user.id`
  - **Self-messaging block**: if `property.ownerId === req.user.id` → 403
  - Upsert on `[propertyId, buyerId, ownerId]` unique constraint
- `GET /conversations` — current user's conversations (as buyer or owner)
- `GET /conversations/:id/messages` — paginated history; authorize membership first

### 4.4 Chat Gateway (Socket.io)
- `@WebSocketGateway()` with JWT-authenticated handshake
- `joinRoom` — join `conversation:{id}` room, server verifies membership first
- `sendMessage` — payload `{ conversationId, text }`
  1. Verify sender is a participant
  2. Write to Postgres via Prisma **first**
  3. Broadcast to room only after successful write (DB-first, zero history loss)

## 5. Frontend Structure (Next.js App Router)

```
/app
  /(auth)/login, /signup
  /feed                  → split-screen: property grid (left) + Leaflet map (right)
  /properties/[id]       → detail view + "Message Owner" button
  /properties/new        → Add Property form w/ interactive map pin (useMapEvents)
  /chat/[conversationId] → split-pane chat panel, Socket.io client
  /dashboard             → "My Listings" + "My Conversations"
```

Key components: `PropertyCard`, `PropertyGrid` (infinite scroll), `MapView` (React-Leaflet, pins
synced to feed), `LocationPicker` (`useMapEvents` → hidden lat/lng fields), `ChatPanel` (Socket.io
client, optimistic UI + DB reconciliation), `useAuth` (JWT context for REST + socket handshake).

## 6. Edge Cases Checklist

- [ ] Self-messaging blocked at `POST /conversations`
- [ ] File size/type/count validated server-side before any Supabase upload
- [ ] No local disk writes for uploads (stream-through only)
- [ ] Messages persist to DB before socket broadcast
- [ ] Conversation membership verified on both REST fetch and socket `joinRoom`
- [ ] Owner-only edit/delete enforced server-side, not just hidden in UI

---

## 7. 3-Day Implementation Plan

### Day 1 (Sat) — Backend foundation
- NestJS project setup, Prisma connected to Supabase Postgres, first migration
- Auth module: signup/login, JWT strategy, AuthGuard
- Properties module CRUD (upload validation stubbed for now)
- Seed script: ~15-20 dummy properties across a few Pakistani cities
- **Checkpoint:** signup/login work, properties CRUD confirmed in Postman

### Day 2 (Sun) — Uploads, chat backend, frontend skeleton
- File upload validation pipeline + Supabase Storage integration (replaces stub)
- Conversations module: create/list/get-messages, self-messaging block, upsert logic
- Chat Gateway: joinRoom + sendMessage, DB-first broadcast, JWT-authenticated sockets
- Next.js scaffold: Tailwind + shadcn/ui, auth pages, routing, auth context wrapper
- **Checkpoint:** two socket clients exchange messages in real time, persisted in Postgres

### Day 3 (Mon) — Frontend integration + polish
- Feed page: property grid + Leaflet map, wired to real API
- Property detail + "Message Owner" flow → conversation → chat redirect
- Add Property form with map pin + file upload UI
- Chat panel: Socket.io client, optimistic send + reconciliation
- Bug pass on all Section 6 edge cases
- **Checkpoint:** full journey works — signup → feed → property → message → live chat

### Stretch (only if time remains)
- Search/filter UI on feed (city/type/price)
- Loading/empty states polish
- Deploy (Vercel frontend, Railway/Render backend)

---

## 8. Antigravity Handoff Prompts

Feed these **one at a time**, in order, matching the 3-day plan above. Attach this file to the
chat before Prompt 1 so Antigravity has the actual schema — don't just reference it by name.

### 🟢 Prompt 1 — Day 1: Backend Foundation

```
We're building Rentiq (KirayaPad). I'm attaching our finalized technical spec
(this file) — treat it as the source of truth. Do not modify the schema, module
structure, or architecture from the spec. If you think something should change,
flag it to me and wait — don't silently "improve" it.

Today we're doing Day 1: Backend Foundation only. Do not generate Day 2 or Day 3
code in this response. Generate complete, production-ready code for:

1. The complete schema.prisma file with User, Property, Conversation, Message
   exactly as specified in the spec (Section 3).
2. AuthModule, AuthController, and a stateless JWT AuthGuard for protecting
   private routes.
3. PropertiesModule with CRUD (GET /properties, GET /properties/:id,
   POST /properties) using Prisma. Stub the image/video upload function for
   now — focus on standard JSON fields including lat/lng.

Fully written code, strict TypeScript types, clean imports, zero placeholders
or TODOs — I need to copy-paste and run this directly.

Also give me the exact .env variables you expect and the migration command to run.
```

**Checkpoint before Prompt 2:** signup returns a JWT, login works, `POST /properties`
creates a real row, `GET /properties` returns it. Verify in Postman/Thunder Client
before moving on.

### 🟡 Prompt 2 — Day 2: Uploads, Chat Gateway, Next.js Skeleton

```
Day 1 backend is verified and working — auth and properties CRUD confirmed via
Postman. Continuing from the same spec, still no architecture changes.

Now Day 2 only. Generate:

1. MaxFileSizeValidator / FileTypeValidator pipeline for POST /properties — max
   4 images (2MB each, JPEG/PNG), max 1 video (5MB, MP4), rejected before
   touching Supabase Storage. Wire it into the real endpoint, replacing the
   Day 1 stub.
2. ConversationsModule: create/list/get-messages, self-messaging block (403 if
   property.ownerId === req.user.id), upsert logic on the
   [propertyId, buyerId, ownerId] unique constraint.
3. Chat Gateway (@WebSocketGateway()) with JWT-authenticated handshake, joinRoom
   (verify membership before allowing join), sendMessage (DB write via Prisma
   first, then broadcast — no exceptions to this order).
4. Next.js App Router folder skeleton per the spec's frontend structure (Section
   5), plus an auth context wrapper that stores the JWT and attaches it to both
   REST requests and the socket handshake.

Same rules: complete code, strict types, zero placeholders.
```

**Checkpoint before Prompt 3:** open two socket connections (script or two
browser tabs), confirm a message sent in one shows up in the other, and confirm
it's actually persisted in Postgres after reload.

### 🔵 Prompt 3 — Day 3: Frontend Integration

```
Day 1 and Day 2 backend fully verified — chat working end-to-end with DB
persistence confirmed. Same spec, no architecture drift.

Day 3 only — this is the final push, so it needs to be complete and wired to
the real backend, not mocked. Generate:

1. Split-screen Feed page: PropertyGrid (left, infinite scroll) + React-Leaflet
   map (right) with pins synced to visible feed items, popup on pin click.
   Wire to real GET /properties.
2. Property detail page with "Message Owner" button → calls POST /conversations
   → redirects into the chat view.
3. Add Property form with LocationPicker (useMapEvents, click sets hidden
   lat/lng fields) plus the file upload UI wired to the Day 2 validation
   endpoint.
4. Split-pane ChatPanel: Socket.io client, room join on mount, optimistic send
   with reconciliation against the DB-confirmed message from the server.

After this, walk me through testing the full user journey: signup → browse
feed → view property on map → message owner → real-time chat both directions.
```

---

*Do not paste all three prompts in a single message. Feed sequentially, verify
each checkpoint, then proceed to the next.*
