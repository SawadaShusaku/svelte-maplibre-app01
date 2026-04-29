import type { Category, CategoryDetail } from './types';

// Static import of categories.json
import categoriesData from './categories.json';

export interface CategoriesConfig {
	categories: Category[];
	details: Array<{
		category_id: string;
		field: string;
		content: string;
	}>;
}

// Export typed data
export const CATEGORIES: Category[] = categoriesData.categories;

export const CATEGORY_DETAILS = categoriesData.details;

// Lookup maps for performance
export const CATEGORY_COLOR: Record<string, string> = Object.fromEntries(
	CATEGORIES.map(c => [c.id, c.color])
);

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
	CATEGORIES.map(c => [c.id, c.label])
);

export const CATEGORY_ICON: Record<string, string> = Object.fromEntries(
	CATEGORIES.map(c => [c.id, c.icon])
);

// Get details for a category
export function getCategoryDetails(categoryId: string): Record<string, string> {
	const details: Record<string, string> = {};
	for (const detail of CATEGORY_DETAILS) {
		if (detail.category_id === categoryId) {
			details[detail.field] = detail.content;
		}
	}
	return details;
}
