import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ServiceRequestService } from '../../core/services/service-request.service';
import { ServiceRequest, ServiceRequestStatus } from '../../core/models/service-request.model';

@Component({
  selector: 'app-admin-service-requests',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="dashboard-layout">
        <app-sidebar role="ADMIN"></app-sidebar>
        <main class="main-content">
          <div class="card-header">
            <div>
              <h1>Service Requests Approval Queue</h1>
              <p>Review and action Load Change (kW) and Tariff Category modification requests.</p>
            </div>
          </div>

          <div class="alert alert-success" *ngIf="successMessage">
            <span>{{ successMessage }}</span>
          </div>

          <div class="card">
            <div class="table-responsive">
              <table class="table" *ngIf="requests.length > 0; else noRequests">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Consumer ID</th>
                    <th>Request Type</th>
                    <th>Current Value</th>
                    <th>Requested Value</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of requests">
                    <td><strong>{{ r.requestId }}</strong></td>
                    <td><strong class="monospace">{{ r.consumerId }}</strong></td>
                    <td><span class="badge badge-info">{{ r.requestType }}</span></td>
                    <td>{{ r.currentValue }}</td>
                    <td><strong class="text-primary">{{ r.requestedValue }}</strong></td>
                    <td><small class="text-secondary">{{ r.reason }}</small></td>
                    <td>
                      <span class="badge" [class.badge-warning]="r.status === 'PENDING'" [class.badge-success]="r.status === 'APPROVED'" [class.badge-danger]="r.status === 'REJECTED'">
                        {{ r.status }}
                      </span>
                    </td>
                    <td>
                      <button *ngIf="r.status === 'PENDING'" (click)="openActionModal(r)" class="btn btn-sm btn-primary">
                        Review Request
                      </button>
                      <span *ngIf="r.status !== 'PENDING'" class="text-muted small">Actioned</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <ng-template #noRequests>
                <div class="empty-state"><p>No pending service requests.</p></div>
              </ng-template>
            </div>
          </div>

          <!-- Action Modal -->
          <div class="modal-overlay" *ngIf="selectedRequest">
            <div class="modal-content">
              <div class="card-header">
                <h3 class="card-title">Review Request {{ selectedRequest.requestId }}</h3>
                <button (click)="closeModal()" class="btn btn-sm btn-secondary">✕</button>
              </div>

              <div class="request-summary-box">
                <p>Consumer ID: <strong>{{ selectedRequest.consumerId }}</strong></p>
                <p>Modification: Change from <strong>{{ selectedRequest.currentValue }}</strong> to <strong class="text-primary">{{ selectedRequest.requestedValue }}</strong></p>
                <p>Reason: <em>"{{ selectedRequest.reason }}"</em></p>
              </div>

              <form [formGroup]="actionForm" (ngSubmit)="onSaveAction()">
                <div class="form-group">
                  <label class="form-label">Decision <span class="required">*</span></label>
                  <select formControlName="status" class="form-select">
                    <option value="APPROVED">APPROVE (Update Customer Profile Immediately)</option>
                    <option value="REJECTED">REJECT Request</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Admin Approval Remarks</label>
                  <textarea formControlName="remarks" rows="3" class="form-control" placeholder="Enter remarks..."></textarea>
                </div>

                <div class="modal-actions">
                  <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
                  <button type="submit" [disabled]="actionForm.invalid || isSaving" class="btn btn-primary">
                    Submit Decision
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
    .monospace { font-family: monospace; }
    .text-secondary { color: var(--text-secondary); }
    .text-primary { color: var(--primary); font-weight: 700; }
    .request-summary-box { background: var(--surface-alt); padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px; font-size: 13px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    .empty-state { padding: 40px; text-align: center; color: var(--text-secondary); }
  `]
})
export class AdminServiceRequestsComponent implements OnInit {
  requests: ServiceRequest[] = [];
  selectedRequest: ServiceRequest | null = null;
  actionForm!: FormGroup;
  isSaving = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private srService: ServiceRequestService
  ) {}

  ngOnInit(): void {
    this.actionForm = this.fb.group({
      status: ['APPROVED', Validators.required],
      remarks: ['Approved after field load verification.']
    });

    this.loadRequests();
  }

  loadRequests(): void {
    this.srService.getAllRequests().subscribe(list => this.requests = list);
  }

  openActionModal(r: ServiceRequest): void {
    this.selectedRequest = r;
  }

  closeModal(): void {
    this.selectedRequest = null;
  }

  onSaveAction(): void {
    if (this.actionForm.invalid || !this.selectedRequest) return;

    this.isSaving = true;
    const { status, remarks } = this.actionForm.value;

    this.srService.updateRequestStatus(this.selectedRequest.requestId, status as ServiceRequestStatus, remarks).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.closeModal();
        this.successMessage = `Request ${updated.requestId} has been ${updated.status}!`;
        this.loadRequests();
        setTimeout(() => this.successMessage = '', 4000);
      }
    });
  }
}
