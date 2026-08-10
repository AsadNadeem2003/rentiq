-- Migration: add_user_verification_and_refresh_token
-- Adds verification fields, encrypted CNIC, hashedRefreshToken to User table
-- Adds roommate fields to Property table
-- These columns were added via `db push` and are now tracked properly.

-- AlterTable User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cnicNumber" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hashedRefreshToken" TEXT;

-- AlterTable Property
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "isRoommateAllowed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "roommatesCount" INTEGER;
