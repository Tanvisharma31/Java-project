import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { MeterReadingService } from '../../core/services/meter-reading.service';
import { CustomerService } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';
import { Customer } from '../../core/models/customer.model';
import { Bill } from '../../core/models/bill.model';

@Component({
  selector: 'app-staff-meter-readings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="dashboard-layout">
        <app-sidebar role="STAFF"></app-sidebar>
        <main class="main-content">
          <div class="card-header">
            <div>
              <h1>Meter Reading Entry & Bill Generation</h1>
              <p>Staff Duty Area: <strong>{{ staffArea }}</strong> | Reader: <strong>{{ staffId }}</strong></p>
            </div>
          </div>

          <div class="alert alert-danger" *ngIf="errorMessage">
            <span>⚠️ {{ errorMessage }}</span>
          </div>

          <div class="alert alert-success" *ngIf="successMessage">
            <span>✅ {{ successMessage }}</span>
          </div>

          <!-- Step 1: Search Consumer ID -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">🔍 Step 1: Search Customer by 13-Digit Consumer ID</h3>
            </div>

            <form [formGroup]="searchForm" (ngSubmit)="onSearchCustomer()" class="search-flex">
              <div class="form-group flex-1">
                <input
                  type="text"
                  formControlName="consumerId"
                  class="form-control form-control-lg"
                  placeholder="Enter 13-digit Consumer ID (e.g. 1000987654321)"
                  maxlength="13"
                />
              </div>
              <button type="submit" [disabled]="searchForm.invalid || isSearching" class="btn btn-primary btn-lg">
                {{ isSearching ? 'Searching...' : 'Search Consumer' }}
              </button>
            </form>
          </div>

          <!-- Step 2: Customer Details & Reading Entry Form -->
          <div class="grid-2" *ngIf="foundCustomer">
            <!-- Customer Summary Card -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">👤 Consumer Specifications</h3>
                <span class="badge badge-success">{{ foundCustomer.status }}</span>
              </div>

              <div class="spec-list">
                <div class="spec-row">
                  <span>Customer Name:</span>
                  <strong>{{ foundCustomer.name }}</strong>
                </div>
                <div class="spec-row">
                  <span>Consumer ID:</span>
                  <strong class="text-primary monospace">{{ foundCustomer.consumerId }}</strong>
                </div>
                <div class="spec-row">
                  <span>Geographical Area:</span>
                  <strong [class.text-danger]="foundCustomer.addressArea !== staffArea">{{ foundCustomer.addressArea }}</strong>
                </div>
                <div class="spec-row">
                  <span>Connection Category:</span>
                  <strong>{{ foundCustomer.connectionType }}</strong>
                </div>
                <div class="spec-row">
                  <span>Sanctioned Load:</span>
                  <strong>{{ foundCustomer.sanctionedLoadKw }} kW</strong>
                </div>
                <div class="spec-row highlight-prev">
                  <span>Previous Meter Reading:</span>
                  <strong class="reading-badge">{{ foundCustomer.previousMeterReading }} kWh</strong>
                </div>
              </div>
            </div>

            <!-- Reading Entry & Calculation Card -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">📟 Step 2: Input Current Reading</h3>
              </div>

              <form [formGroup]="readingForm" (ngSubmit)="onSubmitReading()">
                <div class="form-group">
                  <label class="form-label">Previous Meter Reading (Read-Only)</label>
                  <input type="number" [value]="foundCustomer.previousMeterReading" class="form-control" disabled />
                </div>

                <div class="form-group">
                  <label class="form-label">Current Meter Reading (kWh) <span class="required">*</span></label>
                  <input
                    type="number"
                    formControlName="currentReading"
                    (input)="calculateUnitsPreview()"
                    class="form-control form-control-lg"
                    [class.is-invalid]="readingForm.hasError('readingLessThanPrevious') || (f['currentReading'].invalid && f['currentReading'].touched)"
                    placeholder="Enter reading >= {{ foundCustomer.previousMeterReading }}"
                  />
                  <div class="invalid-feedback" *ngIf="readingForm.hasError('readingLessThanPrevious')">
                    Invalid Reading! Current reading cannot be less than previous meter reading ({{ foundCustomer.previousMeterReading }} kWh).
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Reading Entry Date <span class="required">*</span></label>
                  <input type="date" formControlName="readingDate" class="form-control" />
                </div>

                <!-- Dynamic Calculation Preview -->
                <div class="calc-preview" *ngIf="previewUnits !== null && previewUnits >= 0">
                  <div class="preview-row">
                    <span>Calculated Units Consumed:</span>
                    <strong>{{ previewUnits }} kWh</strong>
                  </div>
                  <div class="preview-row">
                    <span>Estimated Bill Amount:</span>
                    <strong class="text-success">₹{{ previewBillAmount | number:'1.2-2' }}</strong>
                  </div>
                </div>

                <button type="submit" [disabled]="readingForm.invalid || isSubmitting" class="btn btn-success btn-block btn-lg">
                  {{ isSubmitting ? 'Generating Bill...' : 'Submit Reading & Generate Bill' }}
                </button>
              </form>
            </div>
          </div>

          <!-- Generated Bill Receipt Preview -->
          <div class="card bill-success-card" *ngIf="generatedBill">
            <div class="card-header">
              <h3 class="card-title text-success">🎉 Electricity Bill Generated Successfully!</h3>
            </div>

            <div class="grid-2">
              <div>
                <p>Bill ID: <strong>{{ generatedBill.billId }}</strong></p>
                <p>Consumer ID: <strong>{{ generatedBill.consumerId }}</strong></p>
                <p>Billing Month: <strong>{{ generatedBill.billingMonth }}</strong></p>
                <p>Units Consumed: <strong>{{ generatedBill.unitsConsumed }} kWh</strong></p>
              </div>
              <div class="total-box">
                <span>TOTAL PAYABLE AMOUNT</span>
                <h2>₹{{ generatedBill.totalPayable | number:'1.2-2' }}</h2>
                <p>Due Date: {{ generatedBill.dueDate }}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .search-flex { display: flex; gap: 12px; }
    .flex-1 { flex: 1; margin: 0; }
    .spec-list { display: flex; flex-direction: column; gap: 12px; }
    .spec-row { display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 8px; }
    .highlight-prev { background: var(--primary-light); padding: 10px; border-radius: var(--radius-md); border-bottom: none; }
    .reading-badge { font-size: 16px; color: var(--primary); }
    .monospace { font-family: monospace; font-size: 15px; }

    .calc-preview {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 14px;
      margin-bottom: 16px;
    }
    .preview-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .text-success { color: var(--success); font-weight: 700; }
    .text-danger { color: var(--danger); font-weight: 700; }

    .bill-success-card { text-align: left; }
    .total-box { background: var(--primary-light); padding: 20px; border-radius: var(--radius-md); text-align: center; color: var(--primary); }
  `]
})
export class StaffMeterReadingsComponent implements OnInit {
  searchForm!: FormGroup;
  readingForm!: FormGroup;
  staffArea = 'North Delhi';
  staffId = 'STF101';
  foundCustomer: Customer | null = null;
  generatedBill: Bill | null = null;
  isSearching = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  previewUnits: number | null = null;
  previewBillAmount = 0;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private readingService: MeterReadingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.staffId = user?.userId || 'STF101';
    this.staffArea = user?.areaAssigned || 'North Delhi';

    this.searchForm = this.fb.group({
      consumerId: ['1000987654321', [Validators.required, Validators.pattern(/^[0-9]{13}$/)]]
    });

    this.readingForm = this.fb.group({
      currentReading: ['', [Validators.required, Validators.min(0)]],
      readingDate: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  get f() { return this.readingForm.controls; }

  onSearchCustomer(): void {
    if (this.searchForm.invalid) return;

    this.isSearching = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.foundCustomer = null;
    this.generatedBill = null;

    const consumerId = this.searchForm.value.consumerId;

    this.customerService.getCustomerByConsumerId(consumerId).subscribe({
      next: (c) => {
        this.isSearching = false;
        if (!c) {
          this.errorMessage = `Consumer ID '${consumerId}' not found in system.`;
          return;
        }

        this.foundCustomer = c;
        this.readingForm.patchValue({
          currentReading: c.previousMeterReading + 250
        });
        this.calculateUnitsPreview();
      }
    });
  }

  calculateUnitsPreview(): void {
    if (!this.foundCustomer) return;
    const current = parseFloat(this.readingForm.value.currentReading || '0');
    const prev = this.foundCustomer.previousMeterReading;

    if (current < prev) {
      this.readingForm.setErrors({ readingLessThanPrevious: true });
      this.previewUnits = null;
    } else {
      this.readingForm.setErrors(null);
      this.previewUnits = current - prev;
      this.previewBillAmount = (this.previewUnits * 6.5) + (this.foundCustomer.sanctionedLoadKw * 50);
    }
  }

  onSubmitReading(): void {
    if (this.readingForm.invalid || !this.foundCustomer) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const sub = {
      consumerId: this.foundCustomer.consumerId,
      currentReading: parseFloat(this.readingForm.value.currentReading),
      readingDate: this.readingForm.value.readingDate,
      staffId: this.staffId,
      staffArea: this.staffArea
    };

    this.readingService.submitReading(sub).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.generatedBill = res.bill;
        this.successMessage = res.message;
        if (this.foundCustomer) {
          this.foundCustomer.previousMeterReading = sub.currentReading;
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'Failed to submit meter reading.';
      }
    });
  }
}
