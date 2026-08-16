import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ComplaintService } from '../../core/services/complaint.service';
import { AuthService } from '../../core/services/auth.service';
import { Complaint, ComplaintStatus } from '../../core/models/complaint.model';

@Component({
  selector: 'app-staff-complaints',
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
              <h1>Area Complaints Module</h1>
              <p>Filtering system complaints for assigned duty area: <strong>{{ staffArea }}</strong></p>
            </div>
          </div>

          <div class="alert alert-success" *ngIf="successMessage">
            <span>{{ successMessage }}</span>
          </div>

          <div class="card">
            <div class="table-responsive">
              <table class="table" *ngIf="complaints.length > 0; else noAreaComplaints">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Consumer ID & Contact</th>
                    <th>Type & Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of complaints">
                    <td><strong>{{ c.complaintId }}</strong></td>
                    <td>
                      <div><strong>{{ c.contactPerson }}</strong></div>
                      <small class="text-secondary">ID: {{ c.consumerId }} | 📞 {{ c.mobile }}</small>
                    </td>
                    <td>
                      <div><strong>{{ c.complaintType }}</strong></div>
                      <p class="desc-text">{{ c.problemDescription }}</p>
                    </td>
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
                    <td>
                      <button (click)="openStatusModal(c)" class="btn btn-sm btn-secondary">
                        Update Status
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <ng-template #noAreaComplaints>
                <div class="empty-state">
                  <p>No complaints registered for area '{{ staffArea }}'.</p>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Update Status Modal -->
          <div class="modal-overlay" *ngIf="selectedComplaint">
            <div class="modal-content">
              <div class="card-header">
                <h3 class="card-title">Resolve / Update Complaint: {{ selectedComplaint.complaintId }}</h3>
                <button (click)="closeStatusModal()" class="btn btn-sm btn-secondary">✕</button>
              </div>

              <form [formGroup]="statusForm" (ngSubmit)="onSaveStatus()">
                <div class="form-group">
                  <label class="form-label">New Status <span class="required">*</span></label>
                  <select formControlName="status" class="form-select">
                    <option value="IN_PROGRESS">IN_PROGRESS (Under Field Inspection)</option>
                    <option value="RESOLVED">RESOLVED (Issue Fixed)</option>
                    <option value="REJECTED">REJECTED (Invalid / False Alarm)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Resolution Remarks / Staff Action Details <span class="required">*</span></label>
                  <textarea formControlName="remarks" rows="3" class="form-control" placeholder="Enter details of resolution..."></textarea>
                </div>

                <div class="modal-actions">
                  <button type="button" (click)="closeStatusModal()" class="btn btn-secondary">Cancel</button>
                  <button type="submit" [disabled]="statusForm.invalid || isSaving" class="btn btn-primary">
                    Save Complaint Status
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
    .text-secondary { color: var(--text-secondary); }
    .desc-text { font-size: 12px; color: var(--text-secondary); max-width: 280px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    .empty-state { padding: 40px; text-align: center; color: var(--text-secondary); }
  `]
})
export class StaffComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  staffArea = 'North Delhi';
  selectedComplaint: Complaint | null = null;
  statusForm!: FormGroup;
  isSaving = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private complaintService: ComplaintService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.staffArea = user?.areaAssigned || 'North Delhi';

    this.statusForm = this.fb.group({
      status: ['RESOLVED', Validators.required],
      remarks: ['', Validators.required]
    });

    this.loadAreaComplaints();
  }

  loadAreaComplaints(): void {
    this.complaintService.getComplaintsForArea(this.staffArea).subscribe(list => {
      this.complaints = list;
    });
  }

  openStatusModal(c: Complaint): void {
    this.selectedComplaint = c;
    this.statusForm.patchValue({
      status: c.status === 'OPEN' ? 'IN_PROGRESS' : c.status,
      remarks: c.resolutionRemarks || ''
    });
  }

  closeStatusModal(): void {
    this.selectedComplaint = null;
  }

  onSaveStatus(): void {
    if (this.statusForm.invalid || !this.selectedComplaint) return;

    this.isSaving = true;
    const { status, remarks } = this.statusForm.value;

    this.complaintService.updateStatus(this.selectedComplaint.complaintId, status as ComplaintStatus, remarks).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.closeStatusModal();
        this.successMessage = `Complaint ${updated.complaintId} status updated to ${updated.status}`;
        this.loadAreaComplaints();
        setTimeout(() => this.successMessage = '', 4000);
      }
    });
  }
}
