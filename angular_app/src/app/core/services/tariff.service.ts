import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { TariffConfig } from '../models/tariff.model';

@Injectable({
  providedIn: 'root'
})
export class TariffService {
  private mockTariffs: TariffConfig[] = [
    {
      id: 1,
      connectionType: 'RESIDENTIAL',
      fixedChargePerKw: 50.0,
      slab1Rate: 4.5, // 0-100 units
      slab2Rate: 6.5, // 101-300 units
      slab3Rate: 8.5, // 301+ units
      electricityDutyPct: 0.05, // 5%
      effectiveFrom: '2026-01-01'
    },
    {
      id: 2,
      connectionType: 'COMMERCIAL',
      fixedChargePerKw: 100.0,
      slab1Rate: 7.5,
      slab2Rate: 9.5,
      slab3Rate: 11.5,
      electricityDutyPct: 0.05,
      effectiveFrom: '2026-01-01'
    }
  ];

  private tariffsSubject = new BehaviorSubject<TariffConfig[]>(this.mockTariffs);
  public tariffs$ = this.tariffsSubject.asObservable();

  getTariffs(): Observable<TariffConfig[]> {
    return of(this.mockTariffs);
  }

  getTariffForType(type: 'RESIDENTIAL' | 'COMMERCIAL'): TariffConfig {
    return this.mockTariffs.find(t => t.connectionType === type) || this.mockTariffs[0];
  }

  updateTariff(id: number, updated: Partial<TariffConfig>): Observable<TariffConfig> {
    const idx = this.mockTariffs.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.mockTariffs[idx] = { ...this.mockTariffs[idx], ...updated };
      this.tariffsSubject.next(this.mockTariffs);
      return of(this.mockTariffs[idx]);
    }
    throw new Error('Tariff not found');
  }

  calculateEnergyCharge(units: number, tariff: TariffConfig): number {
    let charge = 0;
    if (units <= 100) {
      charge = units * tariff.slab1Rate;
    } else if (units <= 300) {
      charge = (100 * tariff.slab1Rate) + ((units - 100) * tariff.slab2Rate);
    } else {
      charge = (100 * tariff.slab1Rate) + (200 * tariff.slab2Rate) + ((units - 300) * tariff.slab3Rate);
    }
    return charge;
  }
}
