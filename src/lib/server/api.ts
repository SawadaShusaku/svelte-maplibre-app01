import { json } from '@sveltejs/kit';

export function jsonError(message: string, status = 500): Response {
	return json({ error: message }, { status });
}

export function readCsvParam(url: URL, name: string): string[] {
	return (url.searchParams.get(name) ?? '')
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);
}
