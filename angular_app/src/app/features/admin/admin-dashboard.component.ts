import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { CustomerService } from '../../core/services/customer.service';
import { BillService } from '../../core/services/bill.service';
import { ComplaintService } from '../../core/services/complaint.service';
import { ServiceRequestService } from '../../core/services/service-request.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="dashboard-layout">
        <app-sidebar role="ADMIN"></app-sidebar>
        <main class="main-content">
          <div class="dashboard-header">
            <div>
              <h1>Executive Administrative Dashboard</h1>
              <p>System-wide electricity billing aggregates, revenue tracking, and operational metrics.</p>
            </div>
            <div class="quick-actions">
              <a routerLink="/admin/reports" class="btn btn-primary btn-lg">📈 Revenue & Defaulter Reports</a>
              <a routerLink="/admin/tariffs" class="btn btn-secondary btn-lg">💰 Tariff Rates</a>
            </div>
          </div>

          <div class="grid-4">
            <div class="card stat-card">
              <span class="stat-icon">👥</span>
              <div>
                <span class="stat-label">Total Registered Customers</span>
                <h2 class="stat-value">{{ totalCustomers }}</h2>
              </div>
            </div>

            <div class="card stat-card">
              <span class="stat-icon">💵</span>
              <div>
                <span class="stat-label">Collected Revenue</span>
                <h2 class="stat-value text-success">₹{{ totalRevenue | number:'1.2-2' }}</h2>
              </div>
            </div>

            <div class="card stat-card">
              <span class="stat-icon">⚠️</span>
              <div>
                <span class="stat-label">Pending Dues</span>
                <h2 class="stat-value text-danger">₹{{ pendingDues | number:'1.2-2' }}</h2>
              </div>
            </div>

            <div class="card stat-card">
              <span class="stat-icon">📝</span>
              <div>
                <span class="stat-label">Pending Service Requests</span>
                <h2 class="stat-value text-warning">{{ pendingRequestsCount }}</h2>
              </div>
            </div>
          </div>

          <div class="grid-2">
            <!-- Quick Management Links Card -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">🛠️ System Control & Operations</h3>
              </div>
              <div class="admin-links-list">
                <a routerLink="/admin/customers" class="admin-link-item">
                  <span>👥 Customer Management & Soft Deactivation</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/admin/staff" class="admin-link-item">
                  <span>👨‍💼 Staff Registration & Area Assignment</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/admin/tariffs" class="admin-link-item">
                  <span>💰 Residential & Commercial Tariff Configuration</span>
                  <span class="arrow">→</span>
                </a>
                <a routerLink="/admin/service-requests" class="admin-link-item">
                  <span>📝 Review Load & Category Change Requests</span>
                  <span class="arrow">→</span>
                </a>
              </div>
            </div>

            <!-- Operational Alerts Card -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">🔔 Administrative Operational Alerts</h3>
              </div>
              <div class="alerts-list">
                <div class="alert-item alert-warning">
                  <span>⚠️ <strong>Defaulter Alert:</strong> 1 customer past 15-day grace period with unpaid dues exceeding ₹2,000.</span>
                </div>
                <div class="alert-item alert-info">
                  <span>ℹ️ <strong>Tariff Rates Active:</strong> Residential slab rates effective from 2026-01-01.</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .quick-actions { display: flex; gap: 12px; }
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; }
    .stat-icon { font-size: 32px; }
    .stat-label { font-size: 11px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; }
    .stat-value { font-size: 22px; font-weight: 800; margin: 0; }
    .text-success { color: var(--success); }
    .text-danger { color: var(--danger); }
    .text-warning { color: var(--warning); }

    .admin-links-list { display: flex; flex-direction: column; gap: 10px; }
    .admin-link-item { display: flex; justify-content: space-between; padding: 14px; background: var(--surface-alt); border-radius: var(--radius-md); text-decoration: none; color: var(--text-primary); font-weight: 600; }
    .admin-link-item:hover { background: var(--primary-light); color: var(--primary); }

    .alerts-list { display: flex; flex-direction: column; gap: 12px; }
    .alert-item { padding: 12px; border-radius: var(--radius-md); font-size: 13px; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  totalCustomers = 3;
  totalRevenue = 1811.25;
  pendingDues = 8860.0;
  pendingRequestsCount = 1;

  constructor(
    private customerService: CustomerService,
    private billService: BillService,
    private srService: ServiceRequestService
  ) {}

  ngOnInit(): void {
    this.customerService.getAllCustomers().subscribe(list => this.totalCustomers = list.length);
    this.billService.getAllBills().subscribe(bills => {
      this.totalRevenue = bills.filter(b => b.status === 'PAID').reduce((s, b) => s + b.totalPayable, 0);
      this.pendingDues = bills.filter(b => b.status !== 'PAID').reduce((s, b) => s + b.totalPayable, 0);
    });
    this.srService.getAllRequests().subscribe(reqs => {
      this.pendingRequestsCount = reqs.filter(r => r.status === 'PENDING').length;
    });
  }
}
