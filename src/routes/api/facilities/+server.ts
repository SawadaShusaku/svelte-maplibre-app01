import { json } from '@sveltejs/kit';
import { getD1Repository } from '$lib/server/d1-repository';
import { jsonError, readCsvParam } from '$lib/server/api';
import { toPublicFacility } from '$lib/server/public-facility';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform, url }) => {
	try {
		const repo = getD1Repository(platform);
		const wardIds = readCsvParam(url, 'wards');
		const categoryIds = readCsvParam(url, 'categories');
		const query = url.searchParams.get('q')?.trim() ?? '';
		const facilities = query
			? await repo.searchFacilities(query, wardIds)
			: await repo.getFacilities(wardIds, categoryIds);

		return json({ facilities: facilities.map(toPublicFacility) });
	} catch (error) {
		return jsonError(error instanceof Error ? error.message : 'Failed to load facilities', 503);
	}
};
