-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN "editedAt" TIMESTAMP(3),
ADD COLUMN "replyToId" TEXT;

-- CreateIndex
CREATE INDEX "ChatMessage_replyToId_idx" ON "ChatMessage"("replyToId");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
