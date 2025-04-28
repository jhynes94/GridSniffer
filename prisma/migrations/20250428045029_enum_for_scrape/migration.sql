/*
  Warnings:

  - The values [generic_ai,css_calendar] on the enum `ScrapeStrategy` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ScrapeStrategy_new" AS ENUM ('html', 'pdf', 'image', 'screenshot');
ALTER TABLE "ScrapeJob" ALTER COLUMN "scrapeStrategy" TYPE "ScrapeStrategy_new" USING ("scrapeStrategy"::text::"ScrapeStrategy_new");
ALTER TYPE "ScrapeStrategy" RENAME TO "ScrapeStrategy_old";
ALTER TYPE "ScrapeStrategy_new" RENAME TO "ScrapeStrategy";
DROP TYPE "ScrapeStrategy_old";
COMMIT;
