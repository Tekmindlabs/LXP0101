-- Update Calendar table
ALTER TABLE "Calendar"
	ALTER COLUMN "status" TYPE "Status" USING status::text::"Status",
	ALTER COLUMN "type" SET NOT NULL,
	ADD CONSTRAINT "Calendar_name_type_key" UNIQUE ("name", "type");

-- Update Event table
ALTER TABLE "Event"
	ALTER COLUMN "eventType" TYPE "EventType" USING eventType::text::"EventType",
	ALTER COLUMN "status" TYPE "Status" USING status::text::"Status";

-- Add relation between Event and RecurringEvent
ALTER TABLE "RecurringEvent"
	ADD CONSTRAINT "RecurringEvent_eventId_fkey" 
	FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE;