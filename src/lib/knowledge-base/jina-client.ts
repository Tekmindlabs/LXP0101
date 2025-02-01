import type { DocumentMetadata, VersionInfo } from './jina.server';

export class JinaClient {
	static async generateEmbeddings(input: string | { image: string }): Promise<number[]> {
		const response = await fetch('/api/embeddings', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ input }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to generate embeddings');
		}

		const data = await response.json();
		return data.embeddings;
	}

	static async processDocument(file: File): Promise<{
		content: string;
		embeddings: number[];
		metadata: DocumentMetadata;
	}> {
		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch('/api/process-document', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to process document');
			}

			return response.json();
		} catch (error) {
			console.error('Document processing error:', error);
			throw error;
		}
	}

	static async updateDocument(
		file: File,
		previousMetadata: DocumentMetadata
	): Promise<{
		content: string;
		embeddings: number[];
		metadata: DocumentMetadata;
	}> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('previousMetadata', JSON.stringify(previousMetadata));

		try {
			const response = await fetch('/api/update-document', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to update document');
			}

			return response.json();
		} catch (error) {
			console.error('Document update error:', error);
			throw error;
		}
	}
}