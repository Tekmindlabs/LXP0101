-- Add workspace association fields
ALTER TABLE "documents" ADD COLUMN "workspaceId" TEXT;

-- Create workspace_document_associations table
CREATE TABLE "workspace_document_associations" (
	"id" TEXT NOT NULL,
	"documentId" TEXT NOT NULL,
	"workspaceId" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT "workspace_document_associations_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint to prevent duplicate associations
CREATE UNIQUE INDEX "workspace_document_associations_documentId_workspaceId_key" ON "workspace_document_associations"("documentId", "workspaceId");

-- Add foreign key constraints
ALTER TABLE "workspace_document_associations" ADD CONSTRAINT "workspace_document_associations_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;