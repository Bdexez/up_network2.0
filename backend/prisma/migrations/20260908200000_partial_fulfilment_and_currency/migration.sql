-- Expéditions et facturations partielles (quantités traitées par ligne de
-- commande) et documents multi-devises.
--
-- Reprise : les documents existants sont libellés dans la devise de leur
-- société avec un taux de 1, et leurs totaux convertis sont égaux aux totaux
-- d'origine. Les quantités expédiées et facturées sont déduites du statut :
-- une commande déjà expédiée ou facturée l'était intégralement.

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR';

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "baseTotalHT" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "baseTotalTTC" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "baseTotalHT" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "baseTotalTTC" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "OrderLine" ADD COLUMN     "invoicedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "shippedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "baseTotalHT" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "baseTotalTTC" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "baseTotalHT" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "baseTotalTTC" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1;


-- Reprise des données existantes ------------------------------------------

UPDATE "Quote"         SET "baseTotalHT" = "totalHT", "baseTotalTTC" = "totalTTC";
UPDATE "Order"         SET "baseTotalHT" = "totalHT", "baseTotalTTC" = "totalTTC";
UPDATE "Invoice"       SET "baseTotalHT" = "totalHT", "baseTotalTTC" = "totalTTC";
UPDATE "PurchaseOrder" SET "baseTotalHT" = "totalHT", "baseTotalTTC" = "totalTTC";

UPDATE "OrderLine" l SET "shippedQuantity" = l."quantity"
FROM "Order" o WHERE o."id" = l."orderId" AND o."status" IN ('SHIPPED', 'BILLED');

UPDATE "OrderLine" l SET "invoicedQuantity" = l."quantity"
FROM "Order" o WHERE o."id" = l."orderId" AND o."status" = 'BILLED';
