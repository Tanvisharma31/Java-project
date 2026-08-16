import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar">
      <div class="navbar-brand">
        <a routerLink="/" class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">Vidyut<span class="highlight">Seva</span></span>
        </a>
        <span class="badge badge-info" *ngIf="user">{{ user.role }}</span>
      </div>

      <div class="navbar-right">
        <a routerLink="/test" class="btn btn-sm btn-secondary test-btn">
          🛠️ Test Mode Sandbox
        </a>

        <div class="user-profile" *ngIf="user; else guestMenu">
          <span class="user-name">👤 {{ user.name }}</span>
          <button (click)="logout()" class="btn btn-sm btn-danger">Logout</button>
        </div>

        <ng-template #guestMenu>
          <div class="auth-buttons">
            <a routerLink="/login/customer" class="btn btn-sm btn-secondary">Login</a>
            <a routerLink="/register" class="btn btn-sm btn-primary">Register</a>
          </div>
        </ng-template>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 800;
      color: var(--text-primary);
      text-decoration: none;
    }
    .logo-icon { font-size: 24px; }
    .highlight { color: var(--primary); }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--text-primary);
    }
    .auth-buttons {
      display: flex;
      gap: 8px;
    }
    .test-btn {
      background-color: #FEF3C7;
      color: #92400E;
      border-color: #FCD34D;
    }
    .test-btn:hover {
      background-color: #FDE68A;
    }
  `]
})
export class NavbarComponent {
  user: User | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.currentUser$.subscribe(u => this.user = u);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
