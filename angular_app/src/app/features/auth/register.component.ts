import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-wrapper">
      <div class="register-card">
        <div class="register-header">
          <h2>New Customer Self-Registration</h2>
          <p>Register your account to manage electricity bills and digital services.</p>
        </div>

        <form [formGroup]="regForm" (ngSubmit)="onSubmit()">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Title <span class="required">*</span></label>
              <select formControlName="title" class="form-select">
                <option value="Mr">Mr.</option>
                <option value="Mrs">Mrs.</option>
                <option value="Ms">Ms.</option>
                <option value="Dr">Dr.</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Customer Name <span class="required">*</span></label>
              <input
                type="text"
                formControlName="name"
                class="form-control"
                [class.is-invalid]="f['name'].invalid && f['name'].touched"
                placeholder="e.g. Tanvi Sharma"
              />
              <div class="invalid-feedback" *ngIf="f['name'].invalid && f['name'].touched">
                Alphabetic characters & spaces only (2-50 chars). No numbers/symbols.
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Email Address <span class="required">*</span></label>
              <input
                type="email"
                formControlName="email"
                class="form-control"
                [class.is-invalid]="f['email'].invalid && f['email'].touched"
                placeholder="e.g. tanvi@example.com"
              />
              <div class="invalid-feedback" *ngIf="f['email'].invalid && f['email'].touched">
                Valid email address required.
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Mobile Number (+91) <span class="required">*</span></label>
              <div class="input-group">
                <span class="input-prefix">+91</span>
                <input
                  type="text"
                  formControlName="mobile"
                  class="form-control"
                  [class.is-invalid]="f['mobile'].invalid && f['mobile'].touched"
                  placeholder="10-digit mobile"
                />
              </div>
              <div class="invalid-feedback" *ngIf="f['mobile'].invalid && f['mobile'].touched">
                Exactly 10 digits starting with 6, 7, 8, or 9.
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">User ID <span class="required">*</span></label>
              <input
                type="text"
                formControlName="userId"
                class="form-control"
                [class.is-invalid]="f['userId'].invalid && f['userId'].touched"
                placeholder="e.g. tanvi_2004"
              />
              <div class="invalid-feedback" *ngIf="f['userId'].invalid && f['userId'].touched">
                5-20 characters, alphanumeric & underscore allowed, no spaces.
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Consumer ID <span class="required">*</span></label>
              <input
                type="text"
                formControlName="consumerId"
                class="form-control"
                [class.is-invalid]="f['consumerId'].invalid && f['consumerId'].touched"
                placeholder="13-digit Consumer ID"
                maxlength="13"
              />
              <div class="invalid-feedback" *ngIf="f['consumerId'].invalid && f['consumerId'].touched">
                Consumer ID must be exactly 13 digits.
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Geographical Area <span class="required">*</span></label>
            <select formControlName="addressArea" class="form-select">
              <option value="North Delhi">North Delhi</option>
              <option value="South Delhi">South Delhi</option>
              <option value="West Delhi">West Delhi</option>
              <option value="East Delhi">East Delhi</option>
              <option value="Central Delhi">Central Delhi</option>
            </select>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Connection Type <span class="required">*</span></label>
              <select formControlName="connectionType" class="form-select">
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Sanctioned Load (kW) <span class="required">*</span></label>
              <input
                type="number"
                formControlName="sanctionedLoadKw"
                class="form-control"
                [class.is-invalid]="f['sanctionedLoadKw'].invalid && f['sanctionedLoadKw'].touched"
                placeholder="e.g. 3.0"
                step="0.1"
                min="0.5"
              />
              <div class="invalid-feedback" *ngIf="f['sanctionedLoadKw'].invalid && f['sanctionedLoadKw'].touched">
                Sanctioned load must be at least 0.5 kW.
              </div>
            </div>
          </div>

          <input type="hidden" formControlName="countryCode" />

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Password <span class="required">*</span></label>
              <input
                type="password"
                formControlName="password"
                class="form-control"
                [class.is-invalid]="f['password'].invalid && f['password'].touched"
                placeholder="Min 8 chars, 1 Upper, 1 Special"
              />
              <div class="invalid-feedback" *ngIf="f['password'].invalid && f['password'].touched">
                8-30 chars, min 1 uppercase, 1 lowercase, 1 number, 1 special character.
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Confirm Password <span class="required">*</span></label>
              <input
                type="password"
                formControlName="confirmPassword"
                class="form-control"
                [class.is-invalid]="regForm.hasError('passwordMismatch') && f['confirmPassword'].touched"
                placeholder="Re-enter password"
              />
              <div class="invalid-feedback" *ngIf="regForm.hasError('passwordMismatch') && f['confirmPassword'].touched">
                Passwords do not match.
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" (click)="onReset()" class="btn btn-secondary">Reset</button>
            <button type="submit" [disabled]="regForm.invalid || isLoading" class="btn btn-primary btn-lg">
              {{ isLoading ? 'Registering...' : 'Register Customer Account' }}
            </button>
          </div>
        </form>

        <div class="register-footer">
          <p>Already registered? <a routerLink="/login/customer">Login to Customer Portal</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-app);
      padding: 30px 20px;
    }
    .register-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 36px;
      max-width: 720px;
      width: 100%;
      box-shadow: var(--shadow-lg);
    }
    .register-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .input-group {
      display: flex;
      align-items: center;
    }
    .input-prefix {
      padding: 10px 12px;
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-right: none;
      border-radius: var(--radius-md) 0 0 var(--radius-md);
      font-weight: 600;
      color: var(--text-secondary);
    }
    .input-group .form-control {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    .register-footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--border-light);
      font-size: 13px;
    }
  `]
})
export class RegisterComponent implements OnInit {
  regForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.regForm = this.fb.group({
      title: ['Ms', Validators.required],
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]{2,50}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      countryCode: ['+91', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9][0-9]{9}$/)]],
      userId: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_]{5,20}$/)]],
      consumerId: ['', [Validators.required, Validators.pattern(/^[0-9]{13}$/)]],
      addressArea: ['North Delhi', Validators.required],
      connectionType: ['RESIDENTIAL', Validators.required],
      sanctionedLoadKw: [3.0, Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(30),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&]{8,30}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  get f() { return this.regForm.controls; }

  onReset(): void {
    this.regForm.reset({
      title: 'Ms',
      addressArea: 'North Delhi'
    });
  }

  onSubmit(): void {
    if (this.regForm.invalid) return;

    this.isLoading = true;
    const formVal = this.regForm.value;

    this.authService.registerCustomer(formVal).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate(['/registration-success'], {
          queryParams: {
            consumerId: res.consumerId,
            name: formVal.name,
            email: formVal.email
          }
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
