-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "workingHoursStart" TEXT NOT NULL,
    "workingHoursEnd" TEXT NOT NULL,
    "slotStepMinutes" INTEGER NOT NULL DEFAULT 30,
    "bookingWindowDays" INTEGER NOT NULL DEFAULT 14
);

-- CreateTable
CREATE TABLE "EventType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventTypeId" TEXT NOT NULL,
    "eventTypeTitle" TEXT NOT NULL,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "EventType_createdAt_idx" ON "EventType"("createdAt");

-- CreateIndex
CREATE INDEX "Booking_start_idx" ON "Booking"("start");

-- CreateIndex
CREATE INDEX "Booking_eventTypeId_start_idx" ON "Booking"("eventTypeId", "start");
