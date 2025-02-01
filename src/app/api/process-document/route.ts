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

		const result = await JinaService.processDocument(file);
		return NextResponse.json(result);
	} catch (error) {
		console.error('Failed to process document:', error);
		return NextResponse.json(
			{ error: 'Failed to process document' },
			{ status: 500 }
		);
	}
}