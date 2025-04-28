/*
  Warnings:

  - Added the required column `scrapeStrategy` to the `EventSource` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventSource" ADD COLUMN     "scrapeStrategy" "ScrapeStrategy" NOT NULL;
