# Phase 2: Uploads, Chat Gateway, and Next.js Frontend Skeleton

We will execute the implementation for Phase 2 as outlined in the technical specification. This involves replacing our mock upload with a strict Supabase Storage pipeline, building the Conversations REST API, setting up the Socket.io real-time chat gateway, and bootstrapping the Next.js frontend.

## User Review Required

> [!IMPORTANT]
> Please review this plan. Once approved and the questions below are answered, I will proceed to execute the backend logic and scaffold the frontend.

## Open Questions

Before we execute, please clarify the following:

> [!WARNING]
> 1. **Supabase Storage Configuration:** To implement the file upload pipeline securely to Supabase Storage, we need a Storage Bucket. Have you created a public bucket (e.g., named `properties`), and do you have your `SUPABASE_URL` and `SUPABASE_KEY` ready to add to the `.env` file?
> 2. **Frontend Port Configuration:** The NestJS backend is currently running. For the Socket.io CORS policy and the frontend `create-next-app` initialization, should we enforce the standard `http://localhost:3000` for the Next.js frontend?
> 3. **shadcn/ui Initialization:** The spec mentions using `shadcn/ui` for the frontend. Are there any specific base colors or styles you prefer for the Next.js initialization (e.g., Slate vs Zinc, Default vs New York)?

## Proposed Changes

### 1. Supabase File Upload Pipeline
#### [MODIFY] `backend/src/properties/properties.controller.ts`
- Implement `MaxFileSizeValidator` and `FileTypeValidator`.
- Set strict limits: Max 4 images (2MB each, JPEG/PNG), Max 1 video (5MB, MP4).
- Stream accepted files directly to Supabase Storage via the `@supabase/supabase-js` SDK without saving them to the local disk.

### 2. Conversations Module
#### [NEW] `backend/src/conversations/conversations.module.ts`
- Create the module, controller, and service for handling chat threads.
#### [NEW] `backend/src/conversations/conversations.controller.ts`
- Implement `POST /conversations`: Checks if a thread exists; if not, creates one. Implements the self-messaging block (403 if `property.ownerId === req.user.id`).
- Implement `GET /conversations`: Fetches all chat threads for the logged-in user (as buyer or owner).
- Implement `GET /conversations/:id/messages`: Fetches paginated history with membership authorization.

### 3. Chat Gateway (Socket.io)
#### [NEW] `backend/src/chat/chat.module.ts` & `chat.gateway.ts`
- Implement `@WebSocketGateway()` with a JWT-authenticated handshake.
- Add `joinRoom` handler that verifies the user is a participant in the conversation before subscribing them to the room.
- Add `sendMessage` handler that **strictly writes to Postgres via Prisma first**, and only broadcasts to the room upon a successful database write.

### 4. Frontend Skeleton (Next.js)
#### [NEW] `frontend/` (Next.js Application)
- Initialize a fresh Next.js App Router project alongside the `backend/` folder.
- Install Tailwind CSS, `shadcn/ui`, and Socket.io client.
- Scaffold the required routing structure: `/(auth)/login`, `/feed`, `/properties/[id]`, `/properties/new`, `/chat/[conversationId]`, and `/dashboard`.
- Create a global Auth Context Provider that stores the JWT and attaches it to Axios/Fetch and the Socket.io handshake.

## Verification Plan

### Automated Tests
- Build both the NestJS server and Next.js frontend to ensure zero compilation errors.

### Manual Verification
- We will test the file validation pipeline in Postman to ensure large or invalid files are rejected before attempting a Supabase upload.
- We will open two separate WebSocket connections (simulating a buyer and an owner) and verify that messages are delivered in real-time *and* saved to the database.
