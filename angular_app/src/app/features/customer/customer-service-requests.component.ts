import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ServiceRequestService } from '../../core/services/service-request.service';
import { CustomerService } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';
import { ServiceRequest, ServiceRequestType } from '../../core/models/service-request.model';
import { Customer } from '../../core/models/customer.model';

@Component({
  selector: 'app-customer-service-requests',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="dashboard-layout">
        <app-sidebar role="CUSTOMER"></app-sidebar>
        <main class="main-content">
          <div class="card-header">
            <div>
              <h1>Service Request Module</h1>
              <p>Submit load modification or tariff category change requests for administrative review.</p>
            </div>
            <button (click)="toggleForm()" class="btn btn-primary">
              {{ showForm ? 'Cancel & View History' : '⚡ Submit Service Request' }}
            </button>
          </div>

          <div class="alert alert-success" *ngIf="successMessage">
            <span>{{ successMessage }}</span>
          </div>

          <!-- Request Form Card -->
          <div class="card" *ngIf="showForm">
            <div class="card-header">
              <h3 class="card-title">📝 New Service Request Form</h3>
            </div>

            <form [formGroup]="requestForm" (ngSubmit)="onSubmitRequest()">
              <div class="form-group">
                <label class="form-label">Request Type <span class="required">*</span></label>
                <select formControlName="requestType" (change)="onTypeChange()" class="form-select">
                  <option value="LOAD_CHANGE">Sanctioned Load Change (kW)</option>
                  <option value="CATEGORY_CHANGE">Tariff Category Change (Residential / Commercial)</option>
                </select>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Current Configuration</label>
                  <input type="text" [value]="currentConfigVal" class="form-control" disabled />
                </div>

                <div class="form-group" *ngIf="requestForm.value.requestType === 'LOAD_CHANGE'">
                  <label class="form-label">Requested Load (kW) <span class="required">*</span></label>
                  <input type="number" step="0.5" formControlName="requestedValue" class="form-control" placeholder="e.g. 5.0" />
                </div>

                <div class="form-group" *ngIf="requestForm.value.requestType === 'CATEGORY_CHANGE'">
                  <label class="form-label">Requested Category <span class="required">*</span></label>
                  <select formControlName="requestedValue" class="form-select">
                    <option value="RESIDENTIAL">RESIDENTIAL</option>
                    <option value="COMMERCIAL">COMMERCIAL</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Reason for Request <span class="required">*</span></label>
                <textarea
                  formControlName="reason"
                  rows="3"
                  class="form-control"
                  [class.is-invalid]="f['reason'].invalid && f['reason'].touched"
                  placeholder="Explain why this load/category change is required (min 10 chars)..."
                ></textarea>
                <div class="invalid-feedback" *ngIf="f['reason'].invalid && f['reason'].touched">
                  Reason must be at least 10 characters long.
                </div>
              </div>

              <button type="submit" [disabled]="requestForm.invalid || isSubmitting" class="btn btn-primary btn-block btn-lg">
                {{ isSubmitting ? 'Submitting...' : 'Submit Request to Admin Queue' }}
              </button>
            </form>
          </div>

          <!-- Existing Requests Table Card -->
          <div class="card" *ngIf="!showForm">
            <div class="card-header">
              <h3 class="card-title">📜 Service Request History & Status</h3>
            </div>

            <div class="table-responsive">
              <table class="table" *ngIf="requests.length > 0; else noRequests">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Type</th>
                    <th>Current</th>
                    <th>Requested</th>
                    <th>Date Submitted</th>
                    <th>Status</th>
                    <th>Admin Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of requests">
                    <td><strong>{{ r.requestId }}</strong></td>
                    <td><span class="badge badge-info">{{ r.requestType }}</span></td>
                    <td>{{ r.currentValue }}</td>
                    <td><strong>{{ r.requestedValue }}</strong></td>
                    <td>{{ r.createdAt }}</td>
                    <td>
                      <span class="badge" [class.badge-warning]="r.status === 'PENDING'" [class.badge-success]="r.status === 'APPROVED'" [class.badge-danger]="r.status === 'REJECTED'">
                        {{ r.status }}
                      </span>
                    </td>
                    <td>{{ r.remarks || 'Under administrative review' }}</td>
                  </tr>
                </tbody>
              </table>
              <ng-template #noRequests>
                <div class="empty-state">
                  <p>No service requests recorded.</p>
                </div>
              </ng-template>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .empty-state { padding: 40px; text-align: center; color: var(--text-secondary); }
  `]
})
export class CustomerServiceRequestsComponent implements OnInit {
  requests: ServiceRequest[] = [];
  customer: Customer | null = null;
  requestForm!: FormGroup;
  showForm = false;
  isSubmitting = false;
  successMessage = '';
  consumerId = '1000987654321';
  currentConfigVal = '3.5 kW';

  constructor(
    private fb: FormBuilder,
    private srService: ServiceRequestService,
    private customerService: CustomerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.consumerId = user?.consumerIds?.[0] || '1000987654321';

    this.customerService.getCustomerByConsumerId(this.consumerId).subscribe(c => {
      this.customer = c;
      if (c) {
        this.currentConfigVal = `${c.sanctionedLoadKw} kW`;
      }
    });

    this.requestForm = this.fb.group({
      requestType: ['LOAD_CHANGE', Validators.required],
      requestedValue: ['5.0', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });

    this.loadRequests();
  }

  get f() { return this.requestForm.controls; }

  loadRequests(): void {
    this.srService.getRequestsForCustomer(this.consumerId).subscribe(list => {
      this.requests = list;
    });
  }

  onTypeChange(): void {
    const type = this.requestForm.value.requestType;
    if (type === 'LOAD_CHANGE') {
      this.currentConfigVal = `${this.customer?.sanctionedLoadKw || 3.5} kW`;
      this.requestForm.patchValue({ requestedValue: '5.0' });
    } else {
      this.currentConfigVal = this.customer?.connectionType || 'RESIDENTIAL';
      this.requestForm.patchValue({ requestedValue: 'COMMERCIAL' });
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  onSubmitRequest(): void {
    if (this.requestForm.invalid || !this.customer) return;

    this.isSubmitting = true;
    const req = {
      consumerId: this.customer.consumerId,
      customerName: this.customer.name,
      requestType: this.requestForm.value.requestType as ServiceRequestType,
      currentValue: this.currentConfigVal,
      requestedValue: this.requestForm.value.requestedValue,
      reason: this.requestForm.value.reason
    };

    this.srService.createRequest(req).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.showForm = false;
        this.successMessage = `Service Request ${res.requestId} submitted successfully!`;
        this.loadRequests();
        setTimeout(() => this.successMessage = '', 5000);
      }
    });
  }
}
