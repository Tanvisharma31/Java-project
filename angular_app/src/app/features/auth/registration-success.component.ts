import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-registration-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="success-wrapper">
      <div class="success-card">
        <div class="success-icon">🎉</div>
        <h2>Consumer Registration Successful!</h2>
        <p>Your VidyutSeva customer account has been created successfully.</p>

        <div class="consumer-box">
          <span class="box-label">GENERATED 13-DIGIT CONSUMER ID</span>
          <h1 class="consumer-id">{{ consumerId }}</h1>
          <p class="box-note">Please save this Consumer ID. You will need it for bill tracking and meter reading identification.</p>
        </div>

        <div class="details-list">
          <div class="detail-row">
            <span class="detail-label">Customer Name:</span>
            <span class="detail-val">{{ customerName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Registered Email:</span>
            <span class="detail-val">{{ email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Account Status:</span>
            <span class="badge badge-success">ACTIVE</span>
          </div>
        </div>

        <div class="action-buttons">
          <a routerLink="/login/customer" class="btn btn-primary btn-block btn-lg">Proceed to Customer Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-app);
      padding: 20px;
    }
    .success-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 40px;
      max-width: 520px;
      width: 100%;
      text-align: center;
      box-shadow: var(--shadow-lg);
    }
    .success-icon { font-size: 56px; margin-bottom: 12px; }
    .consumer-box {
      background: var(--primary-light);
      border: 1px dashed var(--primary-border);
      border-radius: var(--radius-md);
      padding: 20px;
      margin: 24px 0;
    }
    .box-label { font-size: 11px; font-weight: 700; color: var(--primary); letter-spacing: 0.05em; }
    .consumer-id { font-size: 32px; font-weight: 800; color: var(--primary); margin: 8px 0; font-family: monospace; }
    .box-note { font-size: 12px; color: var(--text-secondary); }

    .details-list {
      border-top: 1px solid var(--border-light);
      border-bottom: 1px solid var(--border-light);
      padding: 16px 0;
      margin-bottom: 24px;
      text-align: left;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .detail-label { color: var(--text-secondary); font-weight: 500; }
    .detail-val { font-weight: 600; color: var(--text-primary); }
  `]
})
export class RegistrationSuccessComponent implements OnInit {
  consumerId = '';
  customerName = '';
  email = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.consumerId = params['consumerId'] || '1000987654329';
      this.customerName = params['name'] || 'New Customer';
      this.email = params['email'] || 'customer@example.com';
    });
  }
}
