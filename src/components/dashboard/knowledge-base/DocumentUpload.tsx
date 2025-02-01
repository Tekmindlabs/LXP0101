'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { DocumentProcessor } from '@/lib/knowledge-base/document-processor';
import { useToast } from '@/hooks/use-toast';
import { ProcessedDocument } from '@/lib/knowledge-base/types';

interface DocumentUploadProps {
	onUpload: (processedDoc: ProcessedDocument) => Promise<void>;
	folderId: string;
}

export function DocumentUpload({ onUpload, folderId }: DocumentUploadProps) {
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = React.useState(false);
	const { toast } = useToast();

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !folderId) return;

		try {
			setIsUploading(true);
			const processedDoc = await DocumentProcessor.processDocument(file);
			await onUpload(processedDoc);
			toast({
				title: "Success",
				description: "Document uploaded and processed successfully",
			});
		} catch (error) {
			console.error('Upload failed:', error);
			toast({
				title: "Error",
				description: "Failed to upload document",
				variant: "destructive",
			});
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	return (
		<div className="flex items-center gap-2">
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				className="hidden"
				accept=".txt,.md,.pdf,.doc,.docx"
			/>
			<Button
				onClick={() => fileInputRef.current?.click()}
				disabled={isUploading || !folderId}
				variant="secondary"
			>
				<Upload className="mr-2 h-4 w-4" />
				{isUploading ? 'Processing...' : 'Upload Document'}
			</Button>
		</div>
	);
}

