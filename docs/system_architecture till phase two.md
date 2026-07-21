# Rentiq System Architecture (Phase 1 & 2)

This document breaks down exactly how the different pieces of technology we've built so far talk to each other to power the Rentiq platform. 

---

## 1. The Database Layer: PostgreSQL & Prisma

At the core of the app is **PostgreSQL**, hosted on Supabase. This is our relational database where we store structured data (Users, Properties, Conversations, and Messages).

We use **Prisma** as our ORM (Object-Relational Mapper). 
- **What it does:** Instead of writing raw SQL queries (like `SELECT * FROM users`), we use Prisma to write TypeScript code (`prisma.user.findMany()`). 
- **How it works:** We defined our database schema in `schema.prisma`. When we ran `npx prisma db push`, Prisma translated that schema into SQL and built the actual tables inside our Supabase Postgres database.
- **The Flow:** When the frontend requests the property feed, the NestJS backend asks Prisma for the data, Prisma fetches it from Postgres, and NestJS sends it back to the user as JSON.

---

## 2. The File Storage: Supabase Buckets

While Postgres is great for text and numbers, you should **never** save large files (like images or videos) directly inside a Postgres database. 

- **The Role of the Bucket:** The Supabase Storage "Bucket" is essentially a highly optimized hard drive in the cloud specifically designed for serving media. 
- **How it works:** 
  1. A user uploads an image via the frontend.
  2. The NestJS backend receives the file and runs our `MediaValidationPipe` to ensure it's under 2MB and is a valid JPEG/PNG.
  3. If it passes, NestJS uses the `@supabase/supabase-js` library to stream that file directly into your `properties` bucket.
  4. Supabase saves the image and gives us back a **Public URL** (e.g., `https://[your-project].supabase.co/storage/v1/object/public/properties/image.jpg`).
  5. We take that short text URL and save *that* into Prisma/Postgres under the property's `mediaUrls` array. When the frontend loads the property, it simply uses that URL in an `<img src="...">` tag.

---

## 3. Real-Time Chat: Socket.io

Standard HTTP requests (like fetching a feed or uploading a file) are "one-way": the client asks for something, the server responds, and the connection closes. This doesn't work for chat because if you receive a new message, the server has no way to "push" it to your screen unless you manually refresh the page.

To solve this, we use **Socket.io** (`@nestjs/websockets` and `@nestjs/platform-socket.io`).

- **Installation:** We installed it by running `npm install @nestjs/websockets @nestjs/platform-socket.io socket.io`.
- **How it works:**
  1. **The Handshake:** When the user opens a chat, the Next.js frontend opens a continuous, two-way WebSocket connection to the NestJS `ChatGateway`. It sends its JWT auth token to prove who it is.
  2. **Joining a Room:** The user emits a `joinRoom` event for a specific conversation. The server verifies they actually belong to that conversation, then puts them in an isolated "room" (so messages don't accidentally go to the wrong people).
  3. **Sending a Message:** When the user types a message and hits send, the frontend sends it through the open socket.
  4. **The Database Rule:** Before doing anything else, the backend takes that message and uses Prisma to save it permanently into Postgres. This guarantees we *never* lose chat history.
  5. **The Broadcast:** Once Postgres confirms the message is saved, the backend shouts out the `newMessage` event to everyone in that specific Socket room. The frontend hears this event instantly and injects the new message bubble onto the screen without the user having to refresh.

---

## 4. The Brain: NestJS (Backend)

NestJS orchestrates everything mentioned above. 

- **Controllers:** These handle incoming HTTP requests from the frontend (e.g., `PropertiesController` listens for `GET /properties`).
- **Services:** These hold the actual business logic. The controller takes the request and hands it to the Service (e.g., `PropertiesService`). The Service then talks to Prisma or Supabase to get the work done.
- **Modules:** These group Controllers and Services together to keep the code organized (e.g., `AuthModule`, `PropertiesModule`, `ConversationsModule`).

### Putting it all together (A Full Example)
Imagine a user logs in and posts a new property:
1. **Next.js (Frontend)** sends the form data (Title, Price, Images) to NestJS.
2. **PropertiesController** intercepts the request and runs the `MediaValidationPipe`.
3. The Images are sent to **Supabase Storage**, which returns Public URLs.
4. **PropertiesService** takes the Title, Price, and those Public URLs, and hands them to **Prisma**.
5. **Prisma** securely writes a new row into the **PostgreSQL** database.
6. NestJS responds with "Success", and the frontend redirects the user to their new listing!
