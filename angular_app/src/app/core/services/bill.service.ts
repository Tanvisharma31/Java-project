import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Bill } from '../models/bill.model';
import { TestModeService } from './test-mode.service';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private mockBills: Bill[] = [
    {
      billId: 'BILL-2026-0801',
      consumerId: '1000987654321',
      customerName: 'Tanvi Sharma',
      billingMonth: 'August 2026',
      billDate: '2026-08-01',
      dueDate: '2026-08-16',
      previousReading: 1000,
      currentReading: 1250,
      unitsConsumed: 250,
      energyCharge: 1550.0,
      fixedCharge: 175.0,
      dutyTax: 86.25,
      amount: 1811.25,
      lateFee: 0.0,
      totalPayable: 1811.25,
      status: 'PENDING'
    },
    {
      billId: 'BILL-2026-0701',
      consumerId: '1000987654321',
      customerName: 'Tanvi Sharma',
      billingMonth: 'July 2026',
      billDate: '2026-07-01',
      dueDate: '2026-07-16',
      overdueDate: '2026-07-31',
      previousReading: 750,
      currentReading: 1000,
      unitsConsumed: 250,
      energyCharge: 1550.0,
      fixedCharge: 175.0,
      dutyTax: 86.25,
      amount: 1811.25,
      lateFee: 250.0,
      totalPayable: 2061.25,
      status: 'OVERDUE',
      isOverdue15Days: true
    },
    {
      billId: 'BILL-2026-0601',
      consumerId: '1000987654321',
      customerName: 'Tanvi Sharma',
      billingMonth: 'June 2026',
      billDate: '2026-06-01',
      dueDate: '2026-06-16',
      previousReading: 500,
      currentReading: 750,
      unitsConsumed: 250,
      energyCharge: 1550.0,
      fixedCharge: 175.0,
      dutyTax: 86.25,
      amount: 1811.25,
      lateFee: 0.0,
      totalPayable: 1811.25,
      status: 'PAID',
      paymentMethod: 'CARD',
      paymentDate: '2026-06-10'
    },
    {
      billId: 'BILL-2026-0802',
      consumerId: '1000987654322',
      customerName: 'Tanvi Sharma (Plot 2)',
      billingMonth: 'August 2026',
      billDate: '2026-08-01',
      dueDate: '2026-08-16',
      previousReading: 4300,
      currentReading: 4800,
      unitsConsumed: 500,
      energyCharge: 4250.0,
      fixedCharge: 500.0,
      dutyTax: 237.5,
      amount: 4987.5,
      lateFee: 0.0,
      totalPayable: 4987.5,
      status: 'PENDING'
    }
  ];

  private billsSubject = new BehaviorSubject<Bill[]>(this.mockBills);
  public bills$ = this.billsSubject.asObservable();

  constructor(private testModeService: TestModeService) {
    this.testModeService.settings$.subscribe(settings => {
      if (settings.simulate15DayOverdue) {
        this.mockBills.forEach(b => {
          if (b.status === 'PENDING') {
            b.status = 'OVERDUE';
            b.isOverdue15Days = true;
            b.lateFee = 350.0;
            b.totalPayable = b.amount + b.lateFee;
          }
        });
        this.billsSubject.next(this.mockBills);
      }
    });
  }

  getBillsForConsumer(consumerId: string): Observable<Bill[]> {
    const list = this.mockBills.filter(b => b.consumerId === consumerId);
    return of(list);
  }

  getPendingBills(consumerId: string): Observable<Bill[]> {
    const list = this.mockBills.filter(b => b.consumerId === consumerId && b.status !== 'PAID');
    return of(list);
  }

  getAllBills(): Observable<Bill[]> {
    return of(this.mockBills);
  }

  markBillsAsPaid(billIds: string[], paymentMethod: 'CARD' | 'UPI' | 'NET_BANKING', paymentDate: string): void {
    this.mockBills.forEach(b => {
      if (billIds.includes(b.billId)) {
        b.status = 'PAID';
        b.paymentMethod = paymentMethod;
        b.paymentDate = paymentDate;
        b.isOverdue15Days = false;
      }
    });
    this.billsSubject.next(this.mockBills);
  }

  addBill(newBill: Bill): void {
    this.mockBills.unshift(newBill);
    this.billsSubject.next(this.mockBills);
  }
}
