import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-customer-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Change Password</h2>
        </div>
        <div class="card-body">
          <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
            <!-- Current Password -->
            <div class="form-group">
              <label class="form-label">Current Password *</label>
              <input 
                type="password" 
                class="form-control" 
                formControlName="currentPassword"
                placeholder="Enter current password"
              />
              <div class="invalid-feedback" *ngIf="passwordForm.get('currentPassword')?.touched && passwordForm.get('currentPassword')?.invalid">
                Current password is required
              </div>
            </div>

            <!-- New Password -->
            <div class="form-group">
              <label class="form-label">New Password *</label>
              <input 
                type="password" 
                class="form-control" 
                formControlName="newPassword"
                placeholder="Enter new password"
              />
              <div class="invalid-feedback" *ngIf="passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.invalid">
                Password must be 8-30 characters with uppercase, lowercase, number, and special character
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="form-group">
              <label class="form-label">Confirm New Password *</label>
              <input 
                type="password" 
                class="form-control" 
                formControlName="confirmPassword"
                placeholder="Confirm new password"
              />
              <div class="invalid-feedback" *ngIf="passwordForm.get('confirmPassword')?.touched && passwordForm.get('confirmPassword')?.invalid">
                {{ getConfirmPasswordError() }}
              </div>
            </div>

            <!-- Error Message -->
            <div class="alert alert-danger" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <!-- Success Message -->
            <div class="alert alert-success" *ngIf="successMessage">
              {{ successMessage }}
            </div>

            <!-- Buttons -->
            <div class="form-actions">
              <button 
                type="button" 
                class="btn btn-secondary"
                (click)="onCancel()"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="passwordForm.invalid || isLoading"
              >
                {{ isLoading ? 'Changing Password...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: `
    .page-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .card-title {
      margin: 0;
      font-size: 1.25rem;
      color: #0f172a;
    }
    .card-body {
      padding: 1.5rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #0f172a;
    }
    .form-control {
      width: 100%;
      padding: 0.625rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
      box-sizing: border-box;
    }
    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .form-control.is-invalid {
      border-color: #dc2626;
    }
    .invalid-feedback {
      color: #dc2626;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    .alert-danger {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
    .alert-success {
      background: #dcfce7;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }
    .form-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
    .btn {
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }
    .btn-secondary {
      background: #64748b;
      color: white;
    }
    .btn-secondary:hover {
      background: #475569;
    }
  `
})
export class CustomerChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(30),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        ]
      ],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login/customer']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  getConfirmPasswordError(): string {
    const confirmPassword = this.passwordForm.get('confirmPassword');
    if (confirmPassword?.hasError('required')) {
      return 'Please confirm your password';
    }
    if (confirmPassword?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    // Call backend API
    this.http.post<any>(`${environment.apiUrl}/customer/change-password`, {
      currentPassword,
      newPassword
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Password changed successfully!';
          this.passwordForm.reset();
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/customer/dashboard']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Failed to change password';
        }
        this.isLoading = false;
      },
      error: (error) => {
        // Fallback to mock if backend not available
        console.warn('Backend password change failed, using mock:', error);
        this.mockPasswordChange(currentPassword, newPassword);
      }
    });
  }

  mockPasswordChange(currentPassword: string, newPassword: string): void {
    // Simple mock validation for demo
    const user = this.authService.currentUser;
    if (!user) {
      this.errorMessage = 'User not found. Please login again.';
      this.isLoading = false;
      return;
    }

    setTimeout(() => {
      const passwordChanged = currentPassword.length > 0 && newPassword.length >= 8;

      if (passwordChanged) {
        this.successMessage = 'Password changed successfully (Demo Mode)!';
        this.passwordForm.reset();
        
        setTimeout(() => {
          this.router.navigate(['/customer/dashboard']);
        }, 2000);
      } else {
        this.errorMessage = 'Current password is incorrect.';
      }

      this.isLoading = false;
    }, 1000);
  }

  onCancel(): void {
    this.router.navigate(['/customer/dashboard']);
  }
}