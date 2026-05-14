import type { FacilityWithCategories } from '$lib/db/types';
import { isApprovedPublicMediaUrl, sanitizePublicText } from '../public-data-quality';

export type PublicCollectionEntry = {
	id: string;
	place_id: string;
	category_id: string;
	data_source_id: string;
	source_display_name: string | null;
	source_address: string | null;
	source_url: string | null;
	hours: string | null;
	notes: string | null;
	location_hint: string | null;
	image_url: string | null;
	image_alt: string | null;
	image_credit: string | null;
	image_source_url: string | null;
	mapillary_image_id: string | null;
	data_source_name?: string | null;
	data_source_url?: string | null;
};

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
	image_url: string | null;
	image_alt: string | null;
	image_credit: string | null;
	image_source_url: string | null;
	mapillary_image_id: string | null;
	categories: string[];
	collection_entries: PublicCollectionEntry[];
};

function publicMediaUrl(value: string | null | undefined): string | null {
	return isApprovedPublicMediaUrl(value) ? value.trim() : null;
}

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
		hours: sanitizePublicText(facility.hours),
		notes: sanitizePublicText(facility.notes),
		image_url: publicMediaUrl(facility.image_url),
		image_alt: sanitizePublicText(facility.image_alt),
		image_credit: sanitizePublicText(facility.image_credit),
		image_source_url: publicMediaUrl(facility.image_source_url),
		mapillary_image_id: sanitizePublicText(facility.mapillary_image_id),
		categories: facility.categories,
		collection_entries: (facility.collection_entries ?? [])
			.filter((entry) => entry.is_active !== 0)
			.map((entry) => ({
				id: entry.id,
				place_id: entry.place_id,
				category_id: entry.category_id,
				data_source_id: entry.data_source_id,
				source_display_name: sanitizePublicText(entry.source_display_name),
				source_address: sanitizePublicText(entry.source_address),
				source_url: publicMediaUrl(entry.source_url),
				hours: sanitizePublicText(entry.hours),
				notes: sanitizePublicText(entry.notes),
				location_hint: sanitizePublicText(entry.location_hint),
				image_url: publicMediaUrl(entry.image_url),
				image_alt: sanitizePublicText(entry.image_alt),
				image_credit: sanitizePublicText(entry.image_credit),
				image_source_url: publicMediaUrl(entry.image_source_url),
				mapillary_image_id: sanitizePublicText(entry.mapillary_image_id),
				data_source_name: sanitizePublicText(entry.data_source_name),
				data_source_url: publicMediaUrl(entry.data_source_url)
			}))
	};
}
