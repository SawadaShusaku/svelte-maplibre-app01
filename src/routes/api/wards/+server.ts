import { json } from '@sveltejs/kit';
import { getD1Repository } from '$lib/server/d1-repository';
import { jsonError } from '$lib/server/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform }) => {
	try {
		const repo = getD1Repository(platform);
		const wards = await repo.getWards();
		return json({ wards });
	} catch (error) {
		return jsonError(error instanceof Error ? error.message : 'Failed to load wards', 503);
	}
};
