import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TestModeService, TestModeSettings } from '../../core/services/test-mode.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-test-sandbox',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <main class="main-content sandbox-wrapper">
        <div class="card-header">
          <div>
            <h1>🛠️ Development & QA Test Sandbox Mode</h1>
            <p>Inject error scenarios, simulate card limit failures, test area mismatch validations, and trigger 15-day overdue locks.</p>
          </div>
          <button (click)="resetAll()" class="btn btn-secondary">🔄 Reset All Error Toggles</button>
        </div>

        <div class="grid-2">
          <!-- Error Simulation Toggles Card -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">⚠️ Error & Validation Simulation Controls</h3>
            </div>

            <div class="toggle-list">
              <div class="toggle-item">
                <div>
                  <strong>Simulate Card Limit Exceeded Error</strong>
                  <p>Triggers a payment gateway error when attempting card settlement.</p>
                </div>
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="settings.simulateCardLimitError" (change)="onSettingsChange()" />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="toggle-item">
                <div>
                  <strong>Simulate Negative / Invalid Meter Reading</strong>
                  <p>Forces meter entry validation to reject reading if current < previous.</p>
                </div>
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="settings.simulateNegativeReadingError" (change)="onSettingsChange()" />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="toggle-item">
                <div>
                  <strong>Simulate Meter Reader Area Mismatch</strong>
                  <p>Triggers access denied error when staff attempts reading outside duty area.</p>
                </div>
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="settings.simulateAreaMismatchError" (change)="onSettingsChange()" />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="toggle-item">
                <div>
                  <strong>Simulate 15-Day Overdue Account Penalty</strong>
                  <p>Sets pending bills to OVERDUE status past 15-day grace period with late fees.</p>
                </div>
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="settings.simulate15DayOverdue" (change)="onSettingsChange()" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- Quick One-Click Role Switcher Card -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">⚡ Quick One-Click Role Impersonation</h3>
            </div>

            <div class="role-switch-buttons">
              <button (click)="loginAs('CUSTOMER')" class="btn btn-outline btn-lg role-btn">
                👤 Impersonate Customer (Tanvi Sharma)
              </button>
              <button (click)="loginAs('STAFF')" class="btn btn-outline btn-lg role-btn">
                📟 Impersonate Meter Reader (Ramesh North)
              </button>
              <button (click)="loginAs('ADMIN')" class="btn btn-outline btn-lg role-btn">
                🛡️ Impersonate System Admin
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .sandbox-wrapper { max-width: 1100px; margin: 0 auto; padding: 24px; }
    .toggle-list { display: flex; flex-direction: column; gap: 16px; }
    .toggle-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--surface-alt); border-radius: var(--radius-md); }
    .toggle-item p { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

    .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #CBD5E1; transition: .3s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
    input:checked + .slider { background-color: var(--primary); }
    input:checked + .slider:before { transform: translateX(20px); }

    .role-switch-buttons { display: flex; flex-direction: column; gap: 14px; }
    .role-btn { text-align: left; padding: 16px; font-weight: 600; }
    .btn-outline { border: 1px solid var(--border); background: var(--surface); color: var(--text-primary); }
    .btn-outline:hover { background: var(--primary-light); color: var(--primary); border-color: var(--primary); }
  `]
})
export class TestSandboxComponent implements OnInit {
  settings: TestModeSettings = {
    simulateCardLimitError: false,
    simulateNegativeReadingError: false,
    simulateAreaMismatchError: false,
    simulate15DayOverdue: false,
    simulateNetworkDelayMs: 0
  };

  constructor(
    private testService: TestModeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.testService.settings$.subscribe(s => this.settings = { ...s });
  }

  onSettingsChange(): void {
    this.testService.updateSettings(this.settings);
  }

  resetAll(): void {
    this.testService.resetSettings();
  }

  loginAs(role: 'ADMIN' | 'STAFF' | 'CUSTOMER'): void {
    if (role === 'ADMIN') {
      this.authService.login('admin', 'Admin@123', 'ADMIN').subscribe(() => this.router.navigate(['/admin/dashboard']));
    } else if (role === 'STAFF') {
      this.authService.login('staff_north', 'Staff@123', 'STAFF').subscribe(() => this.router.navigate(['/staff/dashboard']));
    } else {
      this.authService.login('tanvi_2004', 'Vidyut@123', 'CUSTOMER').subscribe(() => this.router.navigate(['/customer/dashboard']));
    }
  }
}
