import type { CategoryId } from './types.js';

export interface CategoryDef {
  id: CategoryId;
  label: string;
  color: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'battery',       label: '乾電池',             color: '#EAB308' },
  { id: 'fluorescent',   label: '蛍光灯',             color: '#22C55E' },
  { id: 'cooking-oil',   label: '廃食油',             color: '#F97316' },
  { id: 'ink-cartridge', label: 'インクカートリッジ', color: '#3B82F6' },
  { id: 'small-appliance', label: '小型家電',         color: '#A855F7' },
  { id: 'used-clothing',  label: '古布',             color: '#EC4899' },
];

export const CATEGORY_COLOR: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.color])
) as Record<CategoryId, string>;

export const CATEGORY_LABEL: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label])
) as Record<CategoryId, string>;
