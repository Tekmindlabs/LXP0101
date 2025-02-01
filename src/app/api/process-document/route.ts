import { NextResponse } from 'next/server';
import JinaService from '@/lib/knowledge-base/jina.server';

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const file = formData.get('file') as File;
		
		if (!file) {
			return NextResponse.json(
				{ error: 'No file provided' },
				{ status: 400 }
			);
		}

		// Add file validation
		const validTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
		if (!validTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: `Unsupported file type: ${file.type}. Supported types: ${validTypes.join(', ')}` },
				{ status: 400 }
			);
		}

		// Add size validation (10MB limit)
		const MAX_SIZE = 10 * 1024 * 1024;
		if (file.size > MAX_SIZE) {
			return NextResponse.json(
				{ error: 'File size exceeds limit (10MB)' },
				{ status: 400 }
			);
		}

		try {
			const result = await JinaService.processDocument(file);
			return NextResponse.json(result);
		} catch (error) {
			console.error('JinaService processing error:', error);
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to process document' },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('Route handler error:', error);
		return NextResponse.json(
			{ error: 'Failed to process document request' },
			{ status: 500 }
		);
	}
}