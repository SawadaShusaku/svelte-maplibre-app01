import type { FacilityWithCategories } from '$lib/db/types';

export type PublicFacility = {
	id: string;
	ward_id: string;
	prefecture: string;
	city_label: string;
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	url: string | null;
	official_url: string | null;
	category_urls: string | null;
	hours: string | null;
	notes: string | null;
	categories: string[];
};

export function toPublicFacility(facility: FacilityWithCategories): PublicFacility {
	return {
		id: facility.id,
		ward_id: facility.ward_id,
		prefecture: facility.prefecture ?? facility.ward_id,
		city_label: facility.city_label ?? facility.ward_id,
		name: facility.name,
		address: facility.address,
		latitude: facility.latitude,
		longitude: facility.longitude,
		url: facility.url,
		official_url: facility.official_url,
		category_urls: facility.category_urls,
		hours: facility.hours,
		notes: facility.notes,
		categories: facility.categories
	};
}
