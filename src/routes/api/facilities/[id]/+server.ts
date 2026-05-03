import { json } from '@sveltejs/kit';
import { getD1Repository } from '$lib/server/d1-repository';
import { jsonError } from '$lib/server/api';
import { toPublicFacility } from '$lib/server/public-facility';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, platform }) => {
	try {
		const repo = getD1Repository(platform);
		const facility = await repo.getFacilityById(params.id);
		if (!facility) {
			return jsonError('Facility not found', 404);
		}
		return json({ facility: toPublicFacility(facility) });
	} catch (error) {
		return jsonError(error instanceof Error ? error.message : 'Failed to load facility', 503);
	}
};
