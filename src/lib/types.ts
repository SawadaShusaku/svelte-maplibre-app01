export type CategoryId =
  | 'battery'
  | 'fluorescent'
  | 'cooking-oil'
  | 'ink-cartridge'
  | 'small-appliance';

export interface RecycleFacility {
  id: string;
  ward: string;
  name: string;
  address: string;
  categories: CategoryId[];
  hours: string;
  notes: string;
}
