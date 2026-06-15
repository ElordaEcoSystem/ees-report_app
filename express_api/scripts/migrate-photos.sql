-- Migration: photoUrl/beforePhotoUrl (String) → photoUrls/beforePhotoUrls (String[])
-- Run BEFORE prisma db push

ALTER TABLE "WorkLog" ADD COLUMN IF NOT EXISTS "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "WorkLog" ADD COLUMN IF NOT EXISTS "beforePhotoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "WorkLog" SET "photoUrls" = ARRAY["photoUrl"] WHERE "photoUrl" IS NOT NULL AND "photoUrl" != '';
UPDATE "WorkLog" SET "beforePhotoUrls" = ARRAY["beforePhotoUrl"] WHERE "beforePhotoUrl" IS NOT NULL AND "beforePhotoUrl" != '';

ALTER TABLE "WorkLog" DROP COLUMN IF EXISTS "photoUrl";
ALTER TABLE "WorkLog" DROP COLUMN IF EXISTS "beforePhotoUrl";
