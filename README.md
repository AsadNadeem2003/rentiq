# KirayaPad (Rentiq) 🏡

KirayaPad is a modern, real-time real estate platform that connects property owners with renters and buyers. Built with a full-stack JavaScript architecture, it provides a seamless and responsive user experience.

## Project Structure

This repository is structured to contain both the frontend and backend applications in one place:

- **/frontend**: Next.js App Router (React, TailwindCSS, Shadcn/ui)
- **/backend**: NestJS (TypeScript, Prisma, PostgreSQL, Socket.io)

## Getting Started

To run this project locally, you will need to open two terminal windows to start both the backend server and the frontend interface.

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run start:dev
```
The backend API will be available at `http://localhost:3001`.

### 2. Start the Frontend App
```bash
cd frontend
npm install
npm run dev
```
The frontend website will be available at `http://localhost:3000`.

## Key Features
- **Real-time Chat & Notifications:** Built using Socket.io so buyers and sellers can message instantly.
- **Interactive Map:** Integrated location picker for precise property locations.
- **Secure Authentication:** JWT-based user login and registration system.
- **Image Management:** Direct image uploads powered by Supabase.
