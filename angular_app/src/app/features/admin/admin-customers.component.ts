import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/models/customer.model';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="dashboard-layout">
        <app-sidebar role="ADMIN"></app-sidebar>
        <main class="main-content">
          <div class="card-header">
            <div>
              <h1>Customer Account Management</h1>
              <p>Search, filter, inspect specifications, and soft-deactivate customer accounts.</p>
            </div>
          </div>

          <div class="alert alert-success" *ngIf="successMessage">
            <span>{{ successMessage }}</span>
          </div>

          <div class="card">
            <div class="filter-bar">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyFilter()"
                class="form-control filter-input"
                placeholder="Search by Name, Consumer ID (13-digit), or Area..."
              />
              <select [(ngModel)]="statusFilter" (ngModelChange)="applyFilter()" class="form-select filter-select">
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Deactivated">Deactivated</option>
              </select>
            </div>

            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Consumer ID</th>
                    <th>Customer Name</th>
                    <th>Area & Contact</th>
                    <th>Category & Load</th>
                    <th>Prev Reading</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of filteredCustomers">
                    <td><strong class="monospace text-primary">{{ c.consumerId }}</strong></td>
                    <td>{{ c.title }} {{ c.name }}</td>
                    <td>
                      <div><strong>{{ c.addressArea }}</strong></div>
                      <small class="text-secondary">📞 {{ c.mobile }}</small>
                    </td>
                    <td>
                      <div>{{ c.connectionType }}</div>
                      <small class="text-secondary">{{ c.sanctionedLoadKw }} kW</small>
                    </td>
                    <td>{{ c.previousMeterReading }} kWh</td>
                    <td>
                      <span class="badge" [class.badge-success]="c.status === 'Active'" [class.badge-warning]="c.status === 'Inactive'" [class.badge-danger]="c.status === 'Deactivated'">
                        {{ c.status }}
                      </span>
                    </td>
                    <td>
                      <button (click)="toggleStatus(c)" class="btn btn-sm" [class.btn-danger]="c.status === 'Active'" [class.btn-success]="c.status !== 'Active'">
                        {{ c.status === 'Active' ? 'Deactivate' : 'Activate' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .filter-bar { display: flex; gap: 12px; margin-bottom: 16px; }
    .filter-input { flex: 1; }
    .filter-select { width: 180px; }
    .monospace { font-family: monospace; font-size: 14px; }
    .text-secondary { color: var(--text-secondary); }
  `]
})
export class AdminCustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchQuery = '';
  statusFilter = 'ALL';
  successMessage = '';

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.customerService.getAllCustomers().subscribe(list => {
      this.customers = list;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    let result = [...this.customers];
    if (this.statusFilter !== 'ALL') {
      result = result.filter(c => c.status === this.statusFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.consumerId.includes(q) ||
        c.addressArea.toLowerCase().includes(q)
      );
    }
    this.filteredCustomers = result;
  }

  toggleStatus(c: Customer): void {
    this.customerService.toggleCustomerStatus(c.consumerId).subscribe(updated => {
      this.successMessage = `Customer ${updated.consumerId} status changed to ${updated.status}`;
      this.applyFilter();
      setTimeout(() => this.successMessage = '', 4000);
    });
  }
}
