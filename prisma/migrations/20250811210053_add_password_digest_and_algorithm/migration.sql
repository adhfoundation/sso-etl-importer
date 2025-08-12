-- AlterTable
ALTER TABLE "stg_user" ADD COLUMN     "password_algorithm" TEXT,
ADD COLUMN     "password_digest" VARCHAR(256);
