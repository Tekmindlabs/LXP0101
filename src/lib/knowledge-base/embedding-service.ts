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
		return JinaClient.generateEmbeddings(input);
	}

	async embedChunks(chunks: (string | { image: string })[]): Promise<number[][]> {
		const embeddings: number[][] = [];
		
		// Process chunks in batches
		for (let i = 0; i < chunks.length; i += this.batchSize) {
			const batch = chunks.slice(i, i + this.batchSize);
			const batchPromises = batch.map(chunk => this.embedText(chunk));
			const batchEmbeddings = await Promise.all(batchPromises);
			embeddings.push(...batchEmbeddings);
		}

		return embeddings;
	}

	async processDocument(file: File): Promise<ProcessedDocument> {
		return JinaClient.processDocument(file);
	}

	async updateDocument(file: File, previousMetadata: DocumentMetadata): Promise<ProcessedDocument> {
		return JinaClient.updateDocument(file, previousMetadata);
	}

	async processDocumentBatch(files: File[]): Promise<ProcessedDocument[]> {
		const processPromises = files.map(file => this.processDocument(file));
		return Promise.all(processPromises);
	}
}

export const embeddingService = EmbeddingService.getInstance();
