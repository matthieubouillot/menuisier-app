-- CreateTable
CREATE TABLE "DemoData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DemoData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DemoData_entityType_entityId_key" ON "DemoData"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "DemoData_userId_idx" ON "DemoData"("userId");

-- CreateIndex
CREATE INDEX "DemoData_entityType_idx" ON "DemoData"("entityType");

