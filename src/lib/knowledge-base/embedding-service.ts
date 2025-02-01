import { JinaClient } from './jina-client';
import { ProcessedDocument, DocumentMetadata } from './types';

export class EmbeddingService {
	private static instance: EmbeddingService | null = null;
	private readonly batchSize: number = 32;

	private constructor() {}

	static getInstance(): EmbeddingService {
		if (!this.instance) {
			this.instance = new EmbeddingService();
		}
		return this.instance;
	}

	async embedText(input: string | { image: string }): Promise<number[]> {
		try {
			return await JinaClient.generateEmbeddings(input);
		} catch (error) {
			console.error('Failed to generate embeddings:', error);
			throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async embedChunks(chunks: (string | { image: string })[]): Promise<number[][]> {
		const embeddings: number[][] = [];
		const errors: { chunk: string | { image: string }, error: string }[] = [];
		
		// Process chunks in batches
		for (let i = 0; i < chunks.length; i += this.batchSize) {
			const batch = chunks.slice(i, i + this.batchSize);
			const batchResults = await Promise.allSettled(
				batch.map(chunk => this.embedText(chunk))
			);

			// Handle results and collect errors
			batchResults.forEach((result, index) => {
				if (result.status === 'fulfilled') {
					embeddings.push(result.value);
				} else {
					const chunk = batch[index];
					const error = result.reason instanceof Error ? result.reason.message : 'Unknown error';
					errors.push({ chunk, error });
					console.error(`Failed to process chunk ${i + index}:`, error);
				}
			});
		}

		if (errors.length > 0) {
			throw new Error(`Failed to process ${errors.length} chunks. First error: ${errors[0].error}`);
		}

		return embeddings;
	}

	async processDocument(file: File): Promise<ProcessedDocument> {
		try {
			return await JinaClient.processDocument(file);
		} catch (error) {
			console.error('Failed to process document:', error);
			throw new Error(`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async updateDocument(file: File, previousMetadata: DocumentMetadata): Promise<ProcessedDocument> {
		try {
			return await JinaClient.updateDocument(file, previousMetadata);
		} catch (error) {
			console.error('Failed to update document:', error);
			throw new Error(`Document update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async processDocumentBatch(files: File[]): Promise<ProcessedDocument[]> {
		const results = await Promise.allSettled(
			files.map(file => this.processDocument(file))
		);

		const processed: ProcessedDocument[] = [];
		const errors: { file: string, error: string }[] = [];

		results.forEach((result, index) => {
			if (result.status === 'fulfilled') {
				processed.push(result.value);
			} else {
				const fileName = files[index].name;
				const error = result.reason instanceof Error ? result.reason.message : 'Unknown error';
				errors.push({ file: fileName, error });
				console.error(`Failed to process file ${fileName}:`, error);
			}
		});

		if (errors.length > 0) {
			throw new Error(`Failed to process ${errors.length} files. First error: ${errors[0].error}`);
		}

		return processed;
	}
}

export const embeddingService = EmbeddingService.getInstance();
