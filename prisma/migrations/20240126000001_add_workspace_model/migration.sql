-- Create workspaces table
CREATE TABLE "workspaces" (
	"id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"description" TEXT,
	"status" "Status" NOT NULL DEFAULT 'ACTIVE',
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- Update document_folders to use workspace instead of knowledge base
ALTER TABLE "document_folders" DROP CONSTRAINT IF EXISTS "document_folders_knowledgeBaseId_fkey";
ALTER TABLE "document_folders" DROP COLUMN "knowledgeBaseId";
ALTER TABLE "document_folders" ADD COLUMN "workspaceId" TEXT NOT NULL;
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update workspace_documents to reference workspace
ALTER TABLE "workspace_documents" ADD CONSTRAINT "workspace_documents_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update workspace settings to reference workspace
ALTER TABLE "workspace_settings" ADD CONSTRAINT "workspace_settings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update workspace chats to reference workspace
ALTER TABLE "workspace_chats" ADD CONSTRAINT "workspace_chats_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;