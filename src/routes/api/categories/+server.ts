import { json } from '@sveltejs/kit';
import { getD1Repository } from '$lib/server/d1-repository';
import { jsonError, readCsvParam } from '$lib/server/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform, url }) => {
	try {
		const repo = getD1Repository(platform);
		const wardIds = readCsvParam(url, 'wards');
		const categories = wardIds.length > 0
			? await repo.getAvailableCategories(wardIds)
			: await repo.getCategories();
		const details = await repo.getAllCategoryDetails();
		return json({ categories, details });
	} catch (error) {
		return jsonError(error instanceof Error ? error.message : 'Failed to load categories', 503);
	}
};
