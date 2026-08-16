import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BillService } from '../../core/services/bill.service';
import { AuthService } from '../../core/services/auth.service';
import { Bill } from '../../core/models/bill.model';

@Component({
  selector: 'app-customer-bills',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="dashboard-layout">
        <app-sidebar role="CUSTOMER"></app-sidebar>
        <main class="main-content">
          <div class="card-header">
            <div>
              <h1>View & Pay Electricity Bills</h1>
              <p>Select single or multiple pending bills, or click 'Pay All Bills' to settle your account.</p>
            </div>
            <div class="header-actions">
              <button (click)="selectAllBills()" class="btn btn-secondary">Select All Bills</button>
              <button (click)="proceedToPayment()" [disabled]="selectedTotalPayable === 0" class="btn btn-primary btn-lg">
                Proceed to Pay ₹{{ selectedTotalPayable | number:'1.2-2' }}
              </button>
            </div>
          </div>

          <!-- Overdue 15 Days Delay Notice -->
          <div class="alert alert-danger" *ngIf="has15DayOverdue">
            <strong>⚠️ 15-DAY OVERDUE ACCOUNT NOTICE:</strong> You have 1 or more bills unpaid past 15 days from due date. Penalty charges have been levied. Please settle all bills immediately to prevent service disruption.
          </div>

          <!-- Bills Table Card -->
          <div class="card">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" [checked]="isAllSelected" (change)="toggleAll($event)" />
                    </th>
                    <th>Bill ID</th>
                    <th>Billing Month</th>
                    <th>Bill Date</th>
                    <th>Due Date</th>
                    <th>Units</th>
                    <th>Base Amount</th>
                    <th>Late Fee</th>
                    <th>Total Payable</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let b of bills" [class.selected-row]="b.selected">
                    <td>
                      <input type="checkbox" [checked]="b.selected" (change)="onBillSelect(b)" [disabled]="b.status === 'PAID'" />
                    </td>
                    <td><strong>{{ b.billId }}</strong></td>
                    <td>{{ b.billingMonth }}</td>
                    <td>{{ b.billDate }}</td>
                    <td>{{ b.dueDate }}</td>
                    <td>{{ b.unitsConsumed }} kWh</td>
                    <td>₹{{ b.amount | number:'1.2-2' }}</td>
                    <td [class.text-danger]="b.lateFee > 0">₹{{ b.lateFee | number:'1.2-2' }}</td>
                    <td><strong class="payable-text">₹{{ b.totalPayable | number:'1.2-2' }}</strong></td>
                    <td>
                      <span class="badge" [class.badge-success]="b.status === 'PAID'" [class.badge-warning]="b.status === 'PENDING'" [class.badge-danger]="b.status === 'OVERDUE'">
                        {{ b.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Sticky Summary Bar -->
            <div class="summary-bar">
              <div class="summary-info">
                <span>Selected Bills: <strong>{{ selectedBillsCount }}</strong> of {{ bills.length }}</span>
                <span class="total-badge">Total Payable: <strong>₹{{ selectedTotalPayable | number:'1.2-2' }}</strong></span>
              </div>
              <div class="summary-buttons">
                <button (click)="payAllBillsOneClick()" class="btn btn-success btn-lg">⚡ Pay All Bills (One-Click)</button>
                <button (click)="proceedToPayment()" [disabled]="selectedTotalPayable === 0" class="btn btn-primary btn-lg">
                  Proceed to Pay Selected
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .header-actions { display: flex; gap: 12px; align-items: center; }
    .selected-row { background-color: var(--primary-light) !important; }
    .text-danger { color: var(--danger); font-weight: 600; }
    .payable-text { font-size: 15px; color: var(--primary); }

    .summary-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: var(--surface-alt);
      border-top: 1px solid var(--border);
      margin-top: 16px;
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    }
    .summary-info { display: flex; align-items: center; gap: 20px; font-size: 14px; }
    .total-badge {
      font-size: 18px;
      color: var(--text-primary);
      background: var(--surface);
      padding: 6px 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .summary-buttons { display: flex; gap: 12px; }
  `]
})
export class CustomerBillsComponent implements OnInit {
  bills: Bill[] = [];
  consumerId = '1000987654321';
  has15DayOverdue = false;

  constructor(
    private billService: BillService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.consumerId = user?.consumerIds?.[0] || '1000987654321';

    this.billService.getBillsForConsumer(this.consumerId).subscribe(bList => {
      this.bills = bList.map(b => ({ ...b, selected: b.status !== 'PAID' }));
      this.has15DayOverdue = this.bills.some(b => b.isOverdue15Days || b.status === 'OVERDUE');
    });
  }

  get selectedBillsCount(): number {
    return this.bills.filter(b => b.selected && b.status !== 'PAID').length;
  }

  get selectedTotalPayable(): number {
    return this.bills
      .filter(b => b.selected && b.status !== 'PAID')
      .reduce((sum, b) => sum + b.totalPayable, 0);
  }

  get isAllSelected(): boolean {
    const pending = this.bills.filter(b => b.status !== 'PAID');
    return pending.length > 0 && pending.every(b => b.selected);
  }

  onBillSelect(bill: Bill): void {
    if (bill.status === 'PAID') return;
    bill.selected = !bill.selected;
  }

  toggleAll(event: any): void {
    const checked = event.target.checked;
    this.bills.forEach(b => {
      if (b.status !== 'PAID') b.selected = checked;
    });
  }

  selectAllBills(): void {
    this.bills.forEach(b => {
      if (b.status !== 'PAID') b.selected = true;
    });
  }

  payAllBillsOneClick(): void {
    this.selectAllBills();
    this.proceedToPayment();
  }

  proceedToPayment(): void {
    const selectedIds = this.bills.filter(b => b.selected && b.status !== 'PAID').map(b => b.billId);
    if (selectedIds.length === 0) return;

    this.router.navigate(['/customer/payments'], {
      queryParams: {
        billIds: selectedIds.join(','),
        totalAmount: this.selectedTotalPayable,
        consumerId: this.consumerId
      }
    });
  }
}
