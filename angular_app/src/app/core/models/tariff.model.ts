export interface TariffConfig {
  id: number;
  connectionType: 'RESIDENTIAL' | 'COMMERCIAL';
  fixedChargePerKw: number;
  slab1Rate: number; // 0-100 units
  slab2Rate: number; // 101-300 units
  slab3Rate: number; // 301+ units
  electricityDutyPct: number; // 0.05 (5%)
  effectiveFrom: string;
}
