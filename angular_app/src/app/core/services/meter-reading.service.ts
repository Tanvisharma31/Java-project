import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CustomerService } from './customer.service';
import { BillService } from './bill.service';
import { TariffService } from './tariff.service';
import { TestModeService } from './test-mode.service';
import { Bill } from '../models/bill.model';

export interface MeterReadingSubmission {
  consumerId: string;
  currentReading: number;
  readingDate: string;
  staffId: string;
  staffArea: string;
}

@Injectable({
  providedIn: 'root'
})
export class MeterReadingService {
  constructor(
    private customerService: CustomerService,
    private billService: BillService,
    private tariffService: TariffService,
    private testModeService: TestModeService
  ) {}

  submitReading(sub: MeterReadingSubmission): Observable<{ success: boolean; bill: Bill; message: string }> {
    const settings = this.testModeService.currentSettings;

    // 1. Fetch customer
    let customer: any;
    this.customerService.getCustomerByConsumerId(sub.consumerId).subscribe(c => customer = c);

    if (!customer) {
      return throwError(() => new Error('Invalid Consumer ID! Customer record not found in system.'));
    }

    if (customer.status !== 'Active') {
      return throwError(() => new Error(`Cannot submit reading for ${customer.status} customer account.`));
    }

    // 2. Area validation
    if (settings.simulateAreaMismatchError || (sub.staffArea && sub.staffArea !== customer.addressArea)) {
      return throwError(() => new Error(`Access Denied! Customer belongs to Area '${customer.addressArea}'. Staff '${sub.staffId}' is assigned to '${sub.staffArea}'.`));
    }

    // 3. Meter reading validation (Current >= Previous & non-negative)
    const prev = customer.previousMeterReading;
    if (settings.simulateNegativeReadingError || sub.currentReading < prev) {
      return throwError(() => new Error(`Invalid meter reading! Current reading (${sub.currentReading}) cannot be less than previous meter reading (${prev}).`));
    }

    // 4. Calculate Units Consumed
    const units = sub.currentReading - prev;

    // 5. Calculate Energy & Fixed Charges via Tariff Service
    const tariff = this.tariffService.getTariffForType(customer.connectionType);
    const energyCharge = this.tariffService.calculateEnergyCharge(units, tariff);
    const fixedCharge = tariff.fixedChargePerKw * customer.sanctionedLoadKw;
    const dutyTax = (energyCharge + fixedCharge) * tariff.electricityDutyPct;
    const totalAmount = energyCharge + fixedCharge + dutyTax;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const billId = 'BILL-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000).toString();

    const newBill: Bill = {
      billId,
      consumerId: customer.consumerId,
      customerName: customer.name,
      billingMonth: 'September 2026',
      billDate: sub.readingDate,
      dueDate: dueDateStr,
      previousReading: prev,
      currentReading: sub.currentReading,
      unitsConsumed: units,
      energyCharge,
      fixedCharge,
      dutyTax,
      amount: totalAmount,
      lateFee: 0,
      totalPayable: totalAmount,
      status: 'PENDING'
    };

    // Update customer's previous reading
    this.customerService.updateProfile(customer.consumerId, { previousMeterReading: sub.currentReading });
    this.billService.addBill(newBill);

    return of({
      success: true,
      bill: newBill,
      message: `Bill generated successfully for Consumer ID ${customer.consumerId}. Total Payable: ₹${totalAmount.toFixed(2)}`
    });
  }
}
