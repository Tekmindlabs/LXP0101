import { JinaEmbeddings } from "@langchain/community/embeddings/jina";
import { env } from '@/env.mjs';

interface VersionInfo {
	timestamp: string;
	size: number;
}

interface DocumentMetadata {
	size: number;
	lastModified: string;
	fileType: string;
	embeddingDimension: number;
	processedAt: string;
	previousVersions: VersionInfo[];
}

class JinaService {
	private static instance: JinaEmbeddings | null = null;
	private static isInitializing = false;

	private static async getInstance(): Promise<JinaEmbeddings> {
		if (!this.instance && !this.isInitializing) {
			this.isInitializing = true;
			try {
				this.instance = new JinaEmbeddings({
					apiToken: env.JINA_API_KEY,
					model: env.JINA_MODEL_NAME || "jina-embeddings-v2-base-en"
				});
			} finally {
				this.isInitializing = false;
			}
		}
		return this.instance!;
	}

	static async generateEmbeddings(text: string): Promise<number[]> {
		const embeddings = await this.getInstance();
		const result = await embeddings.embedQuery(text);
		return result;
	}

	static async processDocument(file: File): Promise<{ 
		content: string; 
		embeddings: number[];
		metadata: DocumentMetadata;
	}> {
		const text = await file.text();
		const embeddings = await this.generateEmbeddings(text);
		
		const metadata: DocumentMetadata = {
			size: file.size,
			lastModified: new Date(file.lastModified).toISOString(),
			fileType: file.type,
			embeddingDimension: embeddings.length,
			processedAt: new Date().toISOString(),
			previousVersions: []
		};

		return { content: text, embeddings, metadata };
	}

	static async updateDocument(
		file: File, 
		previousMetadata: DocumentMetadata
	): Promise<{ 
		content: string; 
		embeddings: number[];
		metadata: DocumentMetadata;
	}> {
		const { content, embeddings, metadata } = await this.processDocument(file);
		
		metadata.previousVersions = [
			...(previousMetadata.previousVersions || []),
			{
				timestamp: previousMetadata.processedAt,
				size: previousMetadata.size
			}
		];

		return { content, embeddings, metadata };
	}
}

export default JinaService;