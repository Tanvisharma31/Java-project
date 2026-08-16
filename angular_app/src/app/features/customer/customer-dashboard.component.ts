import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { BillService } from '../../core/services/bill.service';
import { CustomerService } from '../../core/services/customer.service';
import { ComplaintService } from '../../core/services/complaint.service';
import { Bill } from '../../core/models/bill.model';
import { Customer } from '../../core/models/customer.model';
import { Complaint } from '../../core/models/complaint.model';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="dashboard-layout">
        <app-sidebar role="CUSTOMER"></app-sidebar>
        <main class="main-content">
          <div class="dashboard-header">
            <div>
              <h1>Welcome Back, {{ customerName }}</h1>
              <p>Primary Consumer ID: <strong>{{ activeConsumerId }}</strong> | Account Status: <span class="badge badge-success">ACTIVE</span></p>
            </div>
            <div class="quick-actions">
              <a routerLink="/customer/bills" class="btn btn-primary">⚡ Pay Outstanding Bills</a>
              <a routerLink="/customer/complaints" class="btn btn-secondary">📢 Raise Complaint</a>
            </div>
          </div>

          <!-- Overdue 15 Days Alert Banner -->
          <div class="alert alert-danger" *ngIf="hasOverdue15Days">
            <div>
              <strong>⚠️ URGENT PAYMENT NOTICE:</strong> You have an overdue electricity bill delayed past 15 days! Late penalty fees have been applied. Please settle immediately to avoid disconnection.
            </div>
            <a routerLink="/customer/bills" class="btn btn-sm btn-danger">Pay Now</a>
          </div>

          <!-- Stats Grid -->
          <div class="grid-4">
            <div class="card stat-card">
              <span class="stat-icon">💰</span>
              <div>
                <span class="stat-label">Total Outstanding Dues</span>
                <h2 class="stat-value text-danger">₹{{ totalPayableDues | number:'1.2-2' }}</h2>
              </div>
            </div>

            <div class="card stat-card">
              <span class="stat-icon">📄</span>
              <div>
                <span class="stat-label">Pending Bills</span>
                <h2 class="stat-value">{{ pendingBillsCount }}</h2>
              </div>
            </div>

            <div class="card stat-card">
              <span class="stat-icon">🛠️</span>
              <div>
                <span class="stat-label">Active Complaints</span>
                <h2 class="stat-value">{{ activeComplaintsCount }}</h2>
              </div>
            </div>

            <div class="card stat-card">
              <span class="stat-icon">⚡</span>
              <div>
                <span class="stat-label">Sanctioned Load</span>
                <h2 class="stat-value">{{ sanctionedLoad }} kW</h2>
              </div>
            </div>
          </div>

          <!-- Recent Pending Bills Section -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Pending Electricity Bills</h3>
              <a routerLink="/customer/bills" class="btn btn-sm btn-secondary">View All Bills</a>
            </div>

            <div class="table-responsive">
              <table class="table" *ngIf="pendingBills.length > 0; else noPending">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Billing Period</th>
                    <th>Due Date</th>
                    <th>Units Consumed</th>
                    <th>Amount Payable</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let b of pendingBills">
                    <td><strong>{{ b.billId }}</strong></td>
                    <td>{{ b.billingMonth }}</td>
                    <td>{{ b.dueDate }}</td>
                    <td>{{ b.unitsConsumed }} kWh</td>
                    <td><strong>₹{{ b.totalPayable | number:'1.2-2' }}</strong></td>
                    <td>
                      <span class="badge" [class.badge-warning]="b.status === 'PENDING'" [class.badge-danger]="b.status === 'OVERDUE'">
                        {{ b.status }}
                      </span>
                    </td>
                    <td>
                      <a routerLink="/customer/bills" class="btn btn-sm btn-primary">Pay Bill</a>
                    </td>
                  </tr>
                </tbody>
              </table>
              <ng-template #noPending>
                <div class="empty-state">
                  <p>✅ You have no unpaid electricity bills.</p>
                </div>
              </ng-template>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .quick-actions { display: flex; gap: 12px; }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px;
    }
    .stat-icon { font-size: 32px; }
    .stat-label { font-size: 12px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; }
    .stat-value { font-size: 24px; font-weight: 800; margin: 0; }
    .text-danger { color: var(--danger); }
    .empty-state { padding: 30px; text-align: center; color: var(--text-secondary); font-weight: 500; }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  customerName = 'Customer';
  activeConsumerId = '1000987654321';
  sanctionedLoad = 3.5;
  pendingBills: Bill[] = [];
  totalPayableDues = 0;
  pendingBillsCount = 0;
  activeComplaintsCount = 0;
  hasOverdue15Days = false;

  constructor(
    private authService: AuthService,
    private billService: BillService,
    private customerService: CustomerService,
    private complaintService: ComplaintService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.customerName = user.name;
      if (user.consumerIds && user.consumerIds.length > 0) {
        this.activeConsumerId = user.consumerIds[0];
      }
    }

    this.billService.getPendingBills(this.activeConsumerId).subscribe(bills => {
      this.pendingBills = bills;
      this.pendingBillsCount = bills.length;
      this.totalPayableDues = bills.reduce((sum, b) => sum + b.totalPayable, 0);
      this.hasOverdue15Days = bills.some(b => b.isOverdue15Days || b.status === 'OVERDUE');
    });

    this.complaintService.getComplaintsForCustomer(this.activeConsumerId).subscribe(complaints => {
      this.activeComplaintsCount = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
    });

    this.customerService.getCustomerByConsumerId(this.activeConsumerId).subscribe(c => {
      if (c) this.sanctionedLoad = c.sanctionedLoadKw;
    });
  }
}
