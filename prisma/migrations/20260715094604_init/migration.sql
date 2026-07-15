-- CreateTable
CREATE TABLE "Mission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "missionDate" DATETIME NOT NULL,
    "purpose" TEXT NOT NULL,
    "distanceKm" REAL NOT NULL,
    "fuelCost" REAL NOT NULL,
    "ticketCost" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
