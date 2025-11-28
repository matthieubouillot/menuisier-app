-- AlterTable
ALTER TABLE "User" ADD COLUMN "address" TEXT;
ALTER TABLE "User" ADD COLUMN "city" TEXT;
ALTER TABLE "User" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "siret" TEXT;
ALTER TABLE "User" ADD COLUMN "rcs" TEXT;
ALTER TABLE "User" ADD COLUMN "vatNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "legalMentions" TEXT;
ALTER TABLE "User" ADD COLUMN "paymentTerms" TEXT;

-- AlterTable
ALTER TABLE "Devis" ADD COLUMN "clientToken" TEXT;
ALTER TABLE "Devis" ADD COLUMN "cgvReference" TEXT;

-- AlterTable
ALTER TABLE "Facture" ADD COLUMN "clientToken" TEXT;
ALTER TABLE "Facture" ADD COLUMN "paymentTerms" TEXT;
ALTER TABLE "Facture" ADD COLUMN "legalMentions" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Devis_clientToken_key" ON "Devis"("clientToken");

-- CreateIndex
CREATE UNIQUE INDEX "Facture_clientToken_key" ON "Facture"("clientToken");

