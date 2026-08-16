import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { CustomerService } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';
import { Customer } from '../../core/models/customer.model';

@Component({
  selector: 'app-customer-profile',
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
              <h1>Customer Profile Management</h1>
              <p>View connection specifications, edit contact details, or request account deactivation.</p>
            </div>
          </div>

          <div class="alert alert-success" *ngIf="successMessage">
            <span>{{ successMessage }}</span>
          </div>

          <div class="grid-2" *ngIf="customer">
            <!-- Read-only Connection Specifications Card -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">⚡ Electricity Connection Specifications</h3>
                <span class="badge badge-success">{{ customer.status }}</span>
              </div>

              <div class="profile-spec-list">
                <div class="spec-item">
                  <span class="spec-label">13-Digit Consumer ID:</span>
                  <span class="spec-value highlight-id">{{ customer.consumerId }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Meter Number:</span>
                  <span class="spec-value">{{ customer.meterNumber }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Connection Category:</span>
                  <span class="spec-value">{{ customer.connectionType }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Sanctioned Load:</span>
                  <span class="spec-value">{{ customer.sanctionedLoadKw }} kW</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Geographical Area:</span>
                  <span class="spec-value">{{ customer.addressArea }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Previous Meter Reading:</span>
                  <span class="spec-value">{{ customer.previousMeterReading }} kWh</span>
                </div>
              </div>

              <div class="deactivation-section">
                <h4>Account Deactivation Options</h4>
                <p>If you have sold your property, relocated, or your building was demolished, you may self-deactivate your customer account.</p>
                <button (click)="openDeactivationModal()" class="btn btn-danger btn-sm">Deactivate My Account</button>
              </div>
            </div>

            <!-- Editable Profile Form Card -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">✏️ Edit Personal & Contact Information</h3>
              </div>

              <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
                <div class="form-group">
                  <label class="form-label">Full Customer Name</label>
                  <input type="text" [value]="customer.title + ' ' + customer.name" class="form-control" disabled />
                  <small class="form-text">Name edits require administrative approval.</small>
                </div>

                <div class="form-group">
                  <label class="form-label">Email Address <span class="required">*</span></label>
                  <input type="email" formControlName="email" class="form-control" [class.is-invalid]="f['email'].invalid && f['email'].touched" />
                  <div class="invalid-feedback" *ngIf="f['email'].invalid && f['email'].touched">Valid email required.</div>
                </div>

                <div class="form-group">
                  <label class="form-label">Mobile Number (+91) <span class="required">*</span></label>
                  <input type="text" formControlName="mobile" class="form-control" [class.is-invalid]="f['mobile'].invalid && f['mobile'].touched" />
                  <div class="invalid-feedback" *ngIf="f['mobile'].invalid && f['mobile'].touched">10 numeric digits required.</div>
                </div>

                <div class="grid-2">
                  <div class="form-group">
                    <label class="form-label">City</label>
                    <input type="text" formControlName="city" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Pincode</label>
                    <input type="text" formControlName="pincode" class="form-control" />
                  </div>
                </div>

                <button type="submit" [disabled]="profileForm.invalid || isSaving" class="btn btn-primary btn-block">
                  {{ isSaving ? 'Saving Changes...' : 'Save Profile Changes' }}
                </button>
              </form>
            </div>
          </div>

          <!-- Deactivation Modal -->
          <div class="modal-overlay" *ngIf="showDeactivationModal">
            <div class="modal-content">
              <div class="card-header">
                <h3 class="card-title text-danger">⚠️ Self-Deactivate Customer Account</h3>
                <button (click)="closeDeactivationModal()" class="btn btn-sm btn-secondary">✕</button>
              </div>
              <p>Please select a mandatory reason for deactivating Consumer ID <strong>{{ customer?.consumerId }}</strong>:</p>

              <form [formGroup]="deactivationForm" (ngSubmit)="confirmDeactivation()">
                <div class="form-group">
                  <label class="form-label">Deactivation Reason <span class="required">*</span></label>
                  <select formControlName="reason" class="form-select">
                    <option value="SOLD_HOUSE">Sold the House / Property Transferred</option>
                    <option value="RELOCATED">Relocated to Another City / Address</option>
                    <option value="HOUSE_DEMOLISHED">Building Demolished</option>
                    <option value="OPEN_PLOT">Converted to Open Plot / No Connection Needed</option>
                    <option value="OTHER">Other Reason</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Additional Comments / Remarks</label>
                  <textarea formControlName="notes" rows="3" class="form-control" placeholder="Provide extra details..."></textarea>
                </div>

                <div class="modal-actions">
                  <button type="button" (click)="closeDeactivationModal()" class="btn btn-secondary">Cancel</button>
                  <button type="submit" [disabled]="deactivationForm.invalid || isDeactivating" class="btn btn-danger">
                    {{ isDeactivating ? 'Deactivating...' : 'Confirm Account Deactivation' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .profile-spec-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .spec-item {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 8px;
    }
    .spec-label { font-weight: 500; color: var(--text-secondary); }
    .spec-value { font-weight: 600; color: var(--text-primary); }
    .highlight-id { font-family: monospace; font-size: 16px; color: var(--primary); }

    .deactivation-section {
      background: #FEF2F2;
      border: 1px solid #FCA5A5;
      padding: 16px;
      border-radius: var(--radius-md);
    }
    .deactivation-section h4 { color: #991B1B; margin-bottom: 6px; }
    .deactivation-section p { font-size: 12px; color: #7F1D1D; margin-bottom: 12px; }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }
  `]
})
export class CustomerProfileComponent implements OnInit {
  customer: Customer | null = null;
  profileForm!: FormGroup;
  deactivationForm!: FormGroup;
  showDeactivationModal = false;
  isSaving = false;
  isDeactivating = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    const consumerId = user?.consumerIds?.[0] || '1000987654321';

    this.customerService.getCustomerByConsumerId(consumerId).subscribe(c => {
      this.customer = c;
      if (c) {
        this.profileForm = this.fb.group({
          email: [c.email, [Validators.required, Validators.email]],
          mobile: [c.mobile, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
          city: [c.city || 'Delhi', Validators.required],
          pincode: [c.pincode || '110001', Validators.required]
        });
      }
    });

    this.deactivationForm = this.fb.group({
      reason: ['SOLD_HOUSE', Validators.required],
      notes: ['']
    });
  }

  get f() { return this.profileForm.controls; }

  onUpdateProfile(): void {
    if (this.profileForm.invalid || !this.customer) return;

    this.isSaving = true;
    this.customerService.updateProfile(this.customer.consumerId, this.profileForm.value).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.customer = updated;
        this.successMessage = 'Profile contact details updated successfully!';
        setTimeout(() => this.successMessage = '', 4000);
      }
    });
  }

  openDeactivationModal(): void {
    this.showDeactivationModal = true;
  }

  closeDeactivationModal(): void {
    this.showDeactivationModal = false;
  }

  confirmDeactivation(): void {
    if (this.deactivationForm.invalid || !this.customer) return;

    this.isDeactivating = true;
    const req = {
      consumerId: this.customer.consumerId,
      ...this.deactivationForm.value
    };

    this.customerService.deactivateAccount(req).subscribe({
      next: (res) => {
        this.isDeactivating = false;
        this.showDeactivationModal = false;
        this.authService.logout();
        this.router.navigate(['/'], { queryParams: { deactivated: 'true' } });
      }
    });
  }
}
