export type MarkerStyle = 'adaptive' | 'solid' | 'gradient';

export type CategoryId =
  | 'rechargeable-battery'
  | 'button-battery'
  | 'dry-battery'
  | 'small-appliance'
  | 'fluorescent'
  | 'ink-cartridge'
  | 'cooking-oil'
  | 'used-clothing'
  | 'paper-pack'
  | 'styrofoam';

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
