export type CategoryId =
  | 'battery'
  | 'fluorescent'
  | 'cooking-oil'
  | 'ink-cartridge'
  | 'small-appliance'
  | 'used-clothing';

export interface RecycleFacility {
  id: string;
  prefecture: string;
  city: string;
  cityLabel: string;
  name: string;
  address: string;
  categories: CategoryId[];
  hours: string;
  notes: string;
}
