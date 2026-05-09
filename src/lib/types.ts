export type MarkerStyle = 'adaptive' | 'solid' | 'gradient';

export type LogoFont = 'zen-kaku-gothic' | 'm-plus-rounded' | 'klee-one';

export type FontTarget = 'logo' | 'popup' | 'ui';

export type FontChoices = Record<FontTarget, LogoFont>;

export type CategoryId =
  | 'rechargeable-battery'
  | 'e-bike-rechargeable-battery'
  | 'button-battery'
  | 'dry-battery'
  | 'small-appliance'
  | 'fluorescent'
  | 'ink-cartridge'
  | 'cooking-oil'
  | 'used-clothing'
  | 'paper-pack'
  | 'styrofoam'
  | 'heated-tobacco-device';

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
