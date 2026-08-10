-- 🛡️ Rentiq (KirayaPad) — Supabase / PostgreSQL Row Level Security (RLS) Policies
-- Enforces database-level tenant isolation & access control policies.

-- 1. Enable RLS on all primary database tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Property" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- 2. Property RLS Policies:
-- Allow anyone (public/authenticated) to read available properties or their own properties
CREATE POLICY "Public properties read access" ON "Property"
  FOR SELECT USING (status = 'AVAILABLE' OR "ownerId" = auth.uid()::text);

-- Allow authenticated owners to update/delete their own properties
CREATE POLICY "Owner property write access" ON "Property"
  FOR ALL USING ("ownerId" = auth.uid()::text);

-- 3. Conversation RLS Policies:
-- Only participants (buyer or owner) can read or modify conversations
CREATE POLICY "Participants conversation access" ON "Conversation"
  FOR ALL USING ("buyerId" = auth.uid()::text OR "ownerId" = auth.uid()::text);

-- 4. Message RLS Policies:
-- Only message sender can access chat messages
CREATE POLICY "Participants message access" ON "Message"
  FOR ALL USING ("senderId" = auth.uid()::text);
