import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ComplaintService } from '../../core/services/complaint.service';
import { AuthService } from '../../core/services/auth.service';
import { Complaint, ComplaintType } from '../../core/models/complaint.model';

@Component({
  selector: 'app-customer-complaints',
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
              <h1>Customer Complaint Portal</h1>
              <p>Register complaints regarding billing, voltage issues, meter faults, or disruptions.</p>
            </div>
            <button (click)="toggleForm()" class="btn btn-primary">
              {{ showForm ? 'Cancel & View List' : '📢 Raise New Complaint' }}
            </button>
          </div>

          <div class="alert alert-success" *ngIf="successMessage">
            <span>{{ successMessage }}</span>
          </div>

          <!-- New Complaint Form Card -->
          <div class="card" *ngIf="showForm">
            <div class="card-header">
              <h3 class="card-title">📝 Complaint Registration Form</h3>
            </div>

            <form [formGroup]="complaintForm" (ngSubmit)="onSubmitComplaint()">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Complaint Type <span class="required">*</span></label>
                  <select formControlName="complaintType" (change)="onTypeChange()" class="form-select">
                    <option value="Billing Related">Billing Related</option>
                    <option value="Voltage Related">Voltage Related</option>
                    <option value="Frequent Disruption">Frequent Disruption</option>
                    <option value="Street Light Related">Street Light Related</option>
                    <option value="Pole Related">Pole Related</option>
                    <option value="Meter Related">Meter Related</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Category Subtype <span class="required">*</span></label>
                  <select formControlName="category" class="form-select">
                    <option *ngFor="let cat of categoryOptions" [value]="cat">{{ cat }}</option>
                  </select>
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Contact Person Name <span class="required">*</span></label>
                  <input type="text" formControlName="contactPerson" class="form-control" placeholder="Contact person name" />
                </div>

                <div class="form-group">
                  <label class="form-label">Mobile Number <span class="required">*</span></label>
                  <input type="text" formControlName="mobile" class="form-control" placeholder="10-digit mobile" />
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Address Area <span class="required">*</span></label>
                  <input type="text" formControlName="address" class="form-control" placeholder="Complete premises address" />
                </div>

                <div class="form-group">
                  <label class="form-label">Landmark (Optional)</label>
                  <input type="text" formControlName="landmark" class="form-control" placeholder="Nearby landmark" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Detailed Problem Description <span class="required">*</span></label>
                <textarea
                  formControlName="problemDescription"
                  rows="4"
                  class="form-control"
                  [class.is-invalid]="f['problemDescription'].invalid && f['problemDescription'].touched"
                  placeholder="Describe your issue in detail (10-1000 characters)..."
                ></textarea>
                <div class="invalid-feedback" *ngIf="f['problemDescription'].invalid && f['problemDescription'].touched">
                  Description must be between 10 and 1000 characters.
                </div>
              </div>

              <div class="form-actions">
                <button type="button" (click)="onReset()" class="btn btn-secondary">Reset Form</button>
                <button type="submit" [disabled]="complaintForm.invalid || isSubmitting" class="btn btn-primary btn-lg">
                  {{ isSubmitting ? 'Submitting...' : 'Submit Complaint' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Existing Complaints List Table Card -->
          <div class="card" *ngIf="!showForm">
            <div class="card-header">
              <h3 class="card-title">📋 Track Your Registered Complaints</h3>
            </div>

            <div class="table-responsive">
              <table class="table" *ngIf="complaints.length > 0; else noComplaints">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Type & Category</th>
                    <th>Date Raised</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Resolution Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of complaints">
                    <td><strong>{{ c.complaintId }}</strong></td>
                    <td>
                      <div><strong>{{ c.complaintType }}</strong></div>
                      <small class="text-secondary">{{ c.category }}</small>
                    </td>
                    <td>{{ c.createdAt }}</td>
                    <td>
                      <span class="badge" [class.badge-danger]="c.priority === 'HIGH'" [class.badge-warning]="c.priority === 'MEDIUM'" [class.badge-muted]="c.priority === 'LOW'">
                        {{ c.priority }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" [class.badge-warning]="c.status === 'OPEN'" [class.badge-info]="c.status === 'IN_PROGRESS'" [class.badge-success]="c.status === 'RESOLVED'" [class.badge-danger]="c.status === 'REJECTED'">
                        {{ c.status }}
                      </span>
                    </td>
                    <td>{{ c.resolutionRemarks || 'Pending investigation by staff' }}</td>
                  </tr>
                </tbody>
              </table>
              <ng-template #noComplaints>
                <div class="empty-state">
                  <p>No complaints registered under Consumer ID {{ consumerId }}.</p>
                </div>
              </ng-template>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .text-secondary { color: var(--text-secondary); }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    .empty-state { padding: 40px; text-align: center; color: var(--text-secondary); }
  `]
})
export class CustomerComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  complaintForm!: FormGroup;
  showForm = false;
  isSubmitting = false;
  successMessage = '';
  consumerId = '1000987654321';
  customerName = 'Tanvi Sharma';

  categoryMap: Record<ComplaintType, string[]> = {
    'Billing Related': ['Wrong Bill Amount', 'Meter Reading Mismatch', 'Payment Not Updated'],
    'Voltage Related': ['High Voltage Fluctuation', 'Low Voltage', 'Transformer Fault'],
    'Frequent Disruption': ['Unannounced Power Cut', 'Feeder Tripping'],
    'Street Light Related': ['Dark Street Lamp', 'Broken Fixture'],
    'Pole Related': ['Leaning Pole', 'Sparking Wires'],
    'Meter Related': ['Faulty Meter Display', 'Burnt Meter', 'Fast Running Meter']
  };

  categoryOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private complaintService: ComplaintService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.consumerId = user?.consumerIds?.[0] || '1000987654321';
    this.customerName = user?.name || 'Tanvi Sharma';

    this.categoryOptions = this.categoryMap['Billing Related'];

    this.complaintForm = this.fb.group({
      complaintType: ['Billing Related', Validators.required],
      category: [this.categoryOptions[0], Validators.required],
      contactPerson: [this.customerName, [Validators.required, Validators.minLength(2)]],
      mobile: ['9876543210', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['H-42, Model Town, North Delhi', Validators.required],
      landmark: ['Near Metro Station'],
      problemDescription: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });

    this.loadComplaints();
  }

  get f() { return this.complaintForm.controls; }

  loadComplaints(): void {
    this.complaintService.getComplaintsForCustomer(this.consumerId).subscribe(list => {
      this.complaints = list;
    });
  }

  onTypeChange(): void {
    const selectedType = this.complaintForm.value.complaintType as ComplaintType;
    this.categoryOptions = this.categoryMap[selectedType] || [];
    if (this.categoryOptions.length > 0) {
      this.complaintForm.patchValue({ category: this.categoryOptions[0] });
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  onReset(): void {
    this.complaintForm.reset({
      complaintType: 'Billing Related',
      category: this.categoryMap['Billing Related'][0],
      contactPerson: this.customerName,
      mobile: '9876543210',
      address: 'H-42, Model Town, North Delhi'
    });
  }

  onSubmitComplaint(): void {
    if (this.complaintForm.invalid) return;

    this.isSubmitting = true;
    const req = {
      consumerId: this.consumerId,
      customerName: this.customerName,
      assignedArea: 'North Delhi',
      ...this.complaintForm.value
    };

    this.complaintService.createComplaint(req).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.showForm = false;
        this.successMessage = `Complaint Registered Successfully! Complaint ID: ${res.complaintId}`;
        this.loadComplaints();
        setTimeout(() => this.successMessage = '', 5000);
      }
    });
  }
}
