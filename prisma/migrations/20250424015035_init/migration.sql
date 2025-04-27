-- CreateEnum
CREATE TYPE "ScrapeStrategy" AS ENUM ('generic_ai', 'pdf', 'image', 'css_calendar');

-- CreateEnum
CREATE TYPE "ScrapeStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'ERROR');

-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "scrapeStrategy" "ScrapeStrategy" NOT NULL,
    "customSelectors" JSONB,
    "lastScraped" TIMESTAMP(3),
    "scrapeStatus" "ScrapeStatus" NOT NULL DEFAULT 'PENDING',
    "scrapeMessage" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Website_url_key" ON "Website"("url");
