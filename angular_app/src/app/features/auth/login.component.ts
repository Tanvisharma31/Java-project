import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <span class="portal-badge">{{ roleTitle }} PORTAL</span>
          <h2>VidyutSeva Authentication</h2>
          <p>Please enter your credentials to access your dashboard.</p>
        </div>

        <div class="alert alert-danger" *ngIf="errorMessage">
          <span>{{ errorMessage }}</span>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">User ID / Username <span class="required">*</span></label>
            <input
              type="text"
              formControlName="userId"
              class="form-control"
              [class.is-invalid]="f['userId'].invalid && f['userId'].touched"
              placeholder="e.g. {{ role === 'ADMIN' ? 'admin' : (role === 'STAFF' ? 'staff_north' : 'tanvi_2004') }}"
            />
            <div class="invalid-feedback" *ngIf="f['userId'].invalid && f['userId'].touched">
              User ID is required (5-20 characters).
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Password <span class="required">*</span></label>
            <input
              type="password"
              formControlName="password"
              class="form-control"
              [class.is-invalid]="f['password'].invalid && f['password'].touched"
              placeholder="Enter password"
            />
            <div class="invalid-feedback" *ngIf="f['password'].invalid && f['password'].touched">
              Password is required (minimum 8 characters).
            </div>
          </div>

          <div class="demo-credentials" *ngIf="role">
            <p><strong>💡 Demo Quick Credentials:</strong></p>
            <div *ngIf="role === 'ADMIN'">
              <code>User ID: admin | Pass: Admin&#64;123</code>
            </div>
            <div *ngIf="role === 'STAFF'">
              <code>User ID: staff_north | Pass: Staff&#64;123</code>
            </div>
            <div *ngIf="role === 'CUSTOMER'">
              <code>User ID: tanvi_2004 | Pass: Vidyut&#64;123</code>
            </div>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading" class="btn btn-primary btn-block btn-lg">
            <span *ngIf="isLoading">Logging in...</span>
            <span *ngIf="!isLoading">Login to {{ roleTitle }}</span>
          </button>
        </form>

        <div class="login-footer" *ngIf="role === 'CUSTOMER'">
          <p>Don't have a Customer Account? <a routerLink="/register">Register New Customer</a></p>
        </div>

        <div class="role-switcher">
          <span>Switch Portal: </span>
          <a routerLink="/login/customer" *ngIf="role !== 'CUSTOMER'">Customer</a>
          <a routerLink="/login/staff" *ngIf="role !== 'STAFF'">Staff</a>
          <a routerLink="/login/admin" *ngIf="role !== 'ADMIN'">Admin</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-app);
      padding: 20px;
    }
    .login-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 36px;
      max-width: 440px;
      width: 100%;
      box-shadow: var(--shadow-lg);
    }
    .login-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .portal-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--primary);
      background: var(--primary-light);
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      margin-bottom: 8px;
    }
    .login-header h2 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .login-header p { font-size: 13px; color: var(--text-secondary); }

    .demo-credentials {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 12px;
      margin-bottom: 20px;
    }
    .demo-credentials code {
      font-weight: 600;
      color: var(--primary);
    }

    .login-footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--border-light);
      font-size: 13px;
    }
    .role-switcher {
      text-align: center;
      margin-top: 12px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .role-switcher a {
      margin: 0 4px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  role: Role = 'CUSTOMER';
  roleTitle = 'CUSTOMER';
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const url = this.router.url;
    if (url.includes('admin')) {
      this.role = 'ADMIN';
      this.roleTitle = 'ADMIN';
    } else if (url.includes('staff')) {
      this.role = 'STAFF';
      this.roleTitle = 'STAFF';
    } else {
      this.role = 'CUSTOMER';
      this.roleTitle = 'CUSTOMER';
    }

    this.loginForm = this.fb.group({
      userId: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { userId, password } = this.loginForm.value;

    this.authService.login(userId.trim(), password, this.role).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (this.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (this.role === 'STAFF') {
          this.router.navigate(['/staff/dashboard']);
        } else {
          this.router.navigate(['/customer/dashboard']);
        }
      },
      error: (err: { message: string; }) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Invalid credentials or user status inactive';
      }
    });
  }
}
