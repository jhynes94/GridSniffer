-- Add columns with default values for existing records
ALTER TABLE "Event" 
ADD COLUMN "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "eventFingerprint" TEXT;

-- Create a function to generate the event fingerprint
CREATE OR REPLACE FUNCTION generate_event_fingerprint(
  event_name TEXT, 
  start_date TIMESTAMP, 
  event_id TEXT
) RETURNS TEXT AS $$
BEGIN
  RETURN MD5(event_name || start_date::TEXT || event_id);
END;
$$ LANGUAGE plpgsql;

-- Update existing rows with generated fingerprints
UPDATE "Event" 
SET "eventFingerprint" = generate_event_fingerprint("eventName", "startDate", id);

-- Now make the fingerprint column not nullable
ALTER TABLE "Event" 
ALTER COLUMN "eventFingerprint" SET NOT NULL;

-- Create index
CREATE INDEX "Event_eventFingerprint_scrapeJobId_idx" ON "Event"("eventFingerprint", "scrapeJobId");
