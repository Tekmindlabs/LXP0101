import type { DocumentMetadata, VersionInfo } from './jina.server';

export class JinaClient {
	static async generateEmbeddings(input: string | { image: string }): Promise<number[]> {
		const response = await fetch('/api/embeddings', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ input }),
		});

		if (!response.ok) {
			throw new Error('Failed to generate embeddings');
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

		const response = await fetch('/api/process-document', {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			throw new Error('Failed to process document');
		}

		return response.json();
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

		const response = await fetch('/api/update-document', {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			throw new Error('Failed to update document');
		}

		return response.json();
	}
}