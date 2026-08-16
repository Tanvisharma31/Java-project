import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-start-screen',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-page">
      <header class="landing-nav">
        <div class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">Vidyut<span class="highlight">Seva</span></span>
        </div>
        <div class="nav-links">
          <a routerLink="/login/customer" class="btn btn-secondary">Customer Login</a>
          <a routerLink="/login/staff" class="btn btn-secondary">Staff Portal</a>
          <a routerLink="/login/admin" class="btn btn-secondary">Admin Portal</a>
          <a routerLink="/test" class="btn btn-warning">🛠️ Test Mode</a>
        </div>
      </header>

      <section class="hero-section">
        <div class="hero-content">
          <span class="tagline">Official Digital Utility Portal</span>
          <h1>Next-Gen Electricity Bill & Customer Service Management</h1>
          <p class="hero-desc">
            Seamlessly pay electricity bills, calculate slab-based tariffs, track meter readings, log complaints, and request load changes with real-time digital Receipts.
          </p>
          <div class="hero-actions">
            <a routerLink="/register" class="btn btn-primary btn-lg">New Customer Registration</a>
            <a routerLink="/login/customer" class="btn btn-secondary btn-lg">Existing Customer Login</a>
          </div>
        </div>
        <div class="hero-card">
          <div class="card-header">
            <span class="card-title">⚡ Quick Service Entry</span>
          </div>
          <div class="quick-links">
            <a routerLink="/login/customer" class="quick-item">
              <span class="quick-icon">📄</span>
              <div>
                <strong>View & Pay Bills</strong>
                <p>Instant online settlement & receipts</p>
              </div>
            </a>
            <a routerLink="/login/staff" class="quick-item">
              <span class="quick-icon">📟</span>
              <div>
                <strong>Meter Reader Portal</strong>
                <p>Area-based reading entry & billing</p>
              </div>
            </a>
            <a routerLink="/login/admin" class="quick-item">
              <span class="quick-icon">🛡️</span>
              <div>
                <strong>Administrative Control</strong>
                <p>Tariffs, staff, reports & analytics</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <footer class="landing-footer">
        <p>© 2026 VidyutSeva Electricity Board Management System. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
      background-color: var(--bg-app);
      display: flex;
      flex-direction: column;
    }
    .landing-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 40px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 22px;
      font-weight: 800;
    }
    .logo-icon { font-size: 28px; }
    .highlight { color: var(--primary); }
    .nav-links {
      display: flex;
      gap: 12px;
    }
    .btn-warning {
      background-color: #FEF3C7;
      color: #92400E;
      border: 1px solid #FCD34D;
    }

    .hero-section {
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 40px;
      align-items: center;
      flex: 1;
    }
    .tagline {
      display: inline-block;
      padding: 6px 12px;
      background: var(--primary-light);
      color: var(--primary);
      font-weight: 700;
      font-size: 12px;
      border-radius: var(--radius-full);
      margin-bottom: 16px;
    }
    .hero-desc {
      font-size: 16px;
      color: var(--text-secondary);
      margin-bottom: 24px;
    }
    .hero-actions {
      display: flex;
      gap: 16px;
    }

    .hero-card {
      background: var(--surface);
      padding: 24px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-md);
    }
    .quick-links {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .quick-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      text-decoration: none;
      color: var(--text-primary);
      transition: background 0.15s ease;
    }
    .quick-item:hover {
      background: var(--surface-alt);
    }
    .quick-icon { font-size: 24px; }
    .quick-item p { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

    .landing-footer {
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: var(--text-secondary);
      background: var(--surface);
      border-top: 1px solid var(--border);
    }

    @media (max-width: 900px) {
      .hero-section { grid-template-columns: 1fr; }
    }
  `]
})
export class StartScreenComponent {}
