-- Drop existing calendar-related tables if they exist
DROP TABLE IF EXISTS "RecurringEvent";
DROP TABLE IF EXISTS "Event";
DROP TABLE IF EXISTS "Calendar";

-- Create new tables with updated schema
CREATE TABLE "Calendar" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"name" TEXT NOT NULL,
	"type" TEXT NOT NULL,
	"status" TEXT NOT NULL DEFAULT 'active',
	"visibility" TEXT NOT NULL DEFAULT 'public',
	"metadata" JSONB,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Event" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"title" TEXT NOT NULL,
	"description" TEXT,
	"eventType" TEXT NOT NULL,
	"startDate" TIMESTAMP(3) NOT NULL,
	"endDate" TIMESTAMP(3) NOT NULL,
	"priority" TEXT,
	"visibility" TEXT NOT NULL DEFAULT 'public',
	"status" TEXT NOT NULL DEFAULT 'active',
	"metadata" JSONB,
	"calendarId" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "Event_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE CASCADE
);

CREATE TABLE "RecurringEvent" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"eventId" TEXT NOT NULL,
	"frequency" TEXT NOT NULL,
	"interval" INTEGER NOT NULL DEFAULT 1,
	"endDate" TIMESTAMP(3),
	"count" INTEGER,
	"daysOfWeek" INTEGER[],
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "RecurringEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX "Calendar_type_status_idx" ON "Calendar"("type", "status");
CREATE INDEX "Event_calendarId_idx" ON "Event"("calendarId");
CREATE INDEX "Event_startDate_endDate_idx" ON "Event"("startDate", "endDate");
CREATE INDEX "RecurringEvent_eventId_idx" ON "RecurringEvent"("eventId");

-- Add unique constraints
CREATE UNIQUE INDEX "Calendar_name_type_key" ON "Calendar"("name", "type");

