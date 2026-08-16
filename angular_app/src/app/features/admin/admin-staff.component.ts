import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

export interface StaffMember {
  staffId: string;
  name: string;
  email: string;
  mobile: string;
  areaAssigned: string;
  status: 'ACTIVE' | 'INACTIVE';
}

@Component({
  selector: 'app-admin-staff',
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
              <h1>Meter Reader / Staff Management</h1>
              <p>Register new staff members and assign geographical meter reading areas.</p>
            </div>
            <button (click)="toggleForm()" class="btn btn-primary">
              {{ showForm ? 'Cancel & View Roster' : '👨‍💼 Register New Staff Member' }}
            </button>
          </div>

          <div class="alert alert-success" *ngIf="successMessage">
            <span>{{ successMessage }}</span>
          </div>

          <!-- Register Staff Form Card -->
          <div class="card" *ngIf="showForm">
            <div class="card-header">
              <h3 class="card-title">📝 New Staff Registration Form</h3>
            </div>

            <form [formGroup]="staffForm" (ngSubmit)="onSubmitStaff()">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Staff Full Name <span class="required">*</span></label>
                  <input type="text" formControlName="name" class="form-control" placeholder="e.g. Ramesh Kumar" />
                </div>
                <div class="form-group">
                  <label class="form-label">Staff User ID / Username <span class="required">*</span></label>
                  <input type="text" formControlName="userId" class="form-control" placeholder="e.g. staff_south" />
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Email Address <span class="required">*</span></label>
                  <input type="email" formControlName="email" class="form-control" placeholder="staff@vidyutseva.gov.in" />
                </div>
                <div class="form-group">
                  <label class="form-label">Mobile Number <span class="required">*</span></label>
                  <input type="text" formControlName="mobile" class="form-control" placeholder="10-digit mobile" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Assigned Duty Area <span class="required">*</span></label>
                <select formControlName="areaAssigned" class="form-select">
                  <option value="North Delhi">North Delhi</option>
                  <option value="South Delhi">South Delhi</option>
                  <option value="West Delhi">West Delhi</option>
                  <option value="East Delhi">East Delhi</option>
                  <option value="Central Delhi">Central Delhi</option>
                </select>
              </div>

              <button type="submit" [disabled]="staffForm.invalid || isSubmitting" class="btn btn-primary btn-block btn-lg">
                {{ isSubmitting ? 'Registering Staff...' : 'Register Staff & Assign Area' }}
              </button>
            </form>
          </div>

          <!-- Staff Table Card -->
          <div class="card" *ngIf="!showForm">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Staff ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Assigned Duty Area</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of staffList">
                    <td><strong>{{ s.staffId }}</strong></td>
                    <td>{{ s.name }}</td>
                    <td>{{ s.email }}</td>
                    <td>{{ s.mobile }}</td>
                    <td><span class="badge badge-info">{{ s.areaAssigned }}</span></td>
                    <td><span class="badge badge-success">{{ s.status }}</span></td>
                    <td>
                      <button (click)="toggleStaffStatus(s)" class="btn btn-sm" [class.btn-danger]="s.status === 'ACTIVE'" [class.btn-success]="s.status !== 'ACTIVE'">
                        {{ s.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}
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
  styles: []
})
export class AdminStaffComponent implements OnInit {
  staffList: StaffMember[] = [
    {
      staffId: 'STF101',
      name: 'Ramesh Meter Reader',
      email: 'staff.north@vidyutseva.gov.in',
      mobile: '9812345678',
      areaAssigned: 'North Delhi',
      status: 'ACTIVE'
    },
    {
      staffId: 'STF102',
      name: 'Suresh Reader',
      email: 'staff.south@vidyutseva.gov.in',
      mobile: '9876501234',
      areaAssigned: 'South Delhi',
      status: 'ACTIVE'
    }
  ];

  staffForm!: FormGroup;
  showForm = false;
  isSubmitting = false;
  successMessage = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.staffForm = this.fb.group({
      name: ['', Validators.required],
      userId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      areaAssigned: ['North Delhi', Validators.required]
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  onSubmitStaff(): void {
    if (this.staffForm.invalid) return;

    this.isSubmitting = true;
    const newStaff: StaffMember = {
      staffId: 'STF' + Math.floor(100 + Math.random() * 900).toString(),
      name: this.staffForm.value.name,
      email: this.staffForm.value.email,
      mobile: this.staffForm.value.mobile,
      areaAssigned: this.staffForm.value.areaAssigned,
      status: 'ACTIVE'
    };

    setTimeout(() => {
      this.staffList.push(newStaff);
      this.isSubmitting = false;
      this.showForm = false;
      this.successMessage = `Staff Member ${newStaff.name} registered and assigned to ${newStaff.areaAssigned}!`;
      setTimeout(() => this.successMessage = '', 4000);
    }, 500);
  }

  toggleStaffStatus(s: StaffMember): void {
    s.status = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.successMessage = `Staff ${s.staffId} status updated to ${s.status}`;
    setTimeout(() => this.successMessage = '', 4000);
  }
}
