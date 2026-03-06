-- CreateTable
CREATE TABLE "ClientStatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientStatus_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Client" ADD COLUMN "statusId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ClientStatus_name_key" ON "ClientStatus"("name");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ClientStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert default statuses
INSERT INTO "ClientStatus" ("name", "color") VALUES
    ('Lead', '#3B82F6'),
    ('New Customer', '#10B981'),
    ('Follow Up', '#F59E0B'),
    ('Active', '#8B5CF6'),
    ('Inactive', '#6B7280');
