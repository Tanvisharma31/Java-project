import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BillService } from '../../core/services/bill.service';
import { Bill } from '../../core/models/bill.model';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="dashboard-layout">
        <app-sidebar role="ADMIN"></app-sidebar>
        <main class="main-content">
          <div class="card-header">
            <div>
              <h1>Revenue Analytics & Defaulters Report</h1>
              <p>Audit system revenue collection, unpaid outstanding balances, and late-fee defaulters.</p>
            </div>
            <button (click)="exportReport()" class="btn btn-primary">📥 Export Analytics Report (CSV)</button>
          </div>

          <div class="grid-3">
            <div class="card stat-card">
              <span class="stat-icon">💰</span>
              <div>
                <span class="stat-label">Total Realized Revenue</span>
                <h2 class="stat-value text-success">₹{{ totalRealizedRevenue | number:'1.2-2' }}</h2>
              </div>
            </div>

            <div class="card stat-card">
              <span class="stat-icon">⚠️</span>
              <div>
                <span class="stat-label">Total Unpaid Dues</span>
                <h2 class="stat-value text-danger">₹{{ totalUnpaidDues | number:'1.2-2' }}</h2>
              </div>
            </div>

            <div class="card stat-card">
              <span class="stat-icon">📈</span>
              <div>
                <span class="stat-label">Late Fee Penalties Collected</span>
                <h2 class="stat-value text-warning">₹{{ totalLateFees | number:'1.2-2' }}</h2>
              </div>
            </div>
          </div>

          <!-- Defaulters List Card -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title text-danger">⚠️ Overdue Defaulters List (>15 Days Unpaid)</h3>
            </div>

            <div class="table-responsive">
              <table class="table" *ngIf="defaulters.length > 0; else noDefaulters">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Consumer ID</th>
                    <th>Customer Name</th>
                    <th>Billing Month</th>
                    <th>Base Amount</th>
                    <th>Late Fee</th>
                    <th>Total Payable</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let b of defaulters">
                    <td><strong>{{ b.billId }}</strong></td>
                    <td><strong class="monospace">{{ b.consumerId }}</strong></td>
                    <td>{{ b.customerName }}</td>
                    <td>{{ b.billingMonth }}</td>
                    <td>₹{{ b.amount | number:'1.2-2' }}</td>
                    <td class="text-danger">₹{{ b.lateFee | number:'1.2-2' }}</td>
                    <td><strong class="text-danger">₹{{ b.totalPayable | number:'1.2-2' }}</strong></td>
                    <td><span class="badge badge-danger">OVERDUE</span></td>
                  </tr>
                </tbody>
              </table>
              <ng-template #noDefaulters>
                <div class="empty-state"><p>✅ No accounts in 15-day overdue defaulter status.</p></div>
              </ng-template>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; }
    .stat-icon { font-size: 32px; }
    .stat-label { font-size: 11px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; }
    .stat-value { font-size: 22px; font-weight: 800; margin: 0; }
    .text-success { color: var(--success); }
    .text-danger { color: var(--danger); font-weight: 700; }
    .text-warning { color: var(--warning); }
    .monospace { font-family: monospace; }
    .empty-state { padding: 40px; text-align: center; color: var(--text-secondary); }
  `]
})
export class AdminReportsComponent implements OnInit {
  bills: Bill[] = [];
  defaulters: Bill[] = [];
  totalRealizedRevenue = 0;
  totalUnpaidDues = 0;
  totalLateFees = 0;

  constructor(private billService: BillService) {}

  ngOnInit(): void {
    this.billService.getAllBills().subscribe(list => {
      this.bills = list;
      this.totalRealizedRevenue = list.filter(b => b.status === 'PAID').reduce((sum, b) => sum + b.totalPayable, 0);
      this.totalUnpaidDues = list.filter(b => b.status !== 'PAID').reduce((sum, b) => sum + b.totalPayable, 0);
      this.totalLateFees = list.reduce((sum, b) => sum + b.lateFee, 0);

      this.defaulters = list.filter(b => b.status === 'OVERDUE' || b.isOverdue15Days);
    });
  }

  exportReport(): void {
    let csv = 'Bill ID,Consumer ID,Customer Name,Billing Month,Base Amount,Late Fee,Total Payable,Status\n';
    this.bills.forEach(b => {
      csv += `${b.billId},${b.consumerId},"${b.customerName || ''}",${b.billingMonth},${b.amount},${b.lateFee},${b.totalPayable},${b.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VidyutSeva_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
