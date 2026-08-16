import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { ComplaintService } from '../../core/services/complaint.service';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="dashboard-layout">
        <app-sidebar role="STAFF"></app-sidebar>
        <main class="main-content">
          <div class="dashboard-header">
            <div>
              <h1>Meter Reader Dashboard</h1>
              <p>Assigned Geographical Area: <strong>{{ staffArea }}</strong> | Reader ID: <strong>{{ staffId }}</strong></p>
            </div>
            <div class="quick-actions">
              <a routerLink="/staff/meter-readings" class="btn btn-primary btn-lg">📟 Enter Meter Reading</a>
              <a routerLink="/staff/complaints" class="btn btn-secondary btn-lg">🛠️ View Area Complaints</a>
            </div>
          </div>

          <div class="grid-3">
            <div class="card stat-card">
              <span class="stat-icon">🗺️</span>
              <div>
                <span class="stat-label">Assigned Duty Area</span>
                <h2 class="stat-value text-primary">{{ staffArea }}</h2>
              </div>
            </div>

            <div class="card stat-card">
              <span class="stat-icon">⚠️</span>
              <div>
                <span class="stat-label">Area Open Complaints</span>
                <h2 class="stat-value text-danger">{{ openAreaComplaints }}</h2>
              </div>
            </div>

            <div class="card stat-card">
              <span class="stat-icon">⚡</span>
              <div>
                <span class="stat-label">Meter Reading Status</span>
                <h2 class="stat-value text-success">ACTIVE</h2>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="card-title">📖 Meter Reader Operating Guidelines</h3>
            </div>
            <ul class="guideline-list">
              <li><strong>Consumer ID Search:</strong> Search customer using exact 13-digit Consumer ID.</li>
              <li><strong>Area Validation:</strong> You can only record meter readings for customers in your assigned area (<code>{{ staffArea }}</code>).</li>
              <li><strong>Reading Rule:</strong> Current meter reading MUST be greater than or equal to previous reading. Decreasing readings are blocked.</li>
              <li><strong>Automatic Billing:</strong> Upon submission, slab rates, fixed charges, and duty taxes are calculated dynamically and billed to customer.</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .quick-actions { display: flex; gap: 12px; }
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; }
    .stat-icon { font-size: 32px; }
    .stat-label { font-size: 12px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; }
    .stat-value { font-size: 24px; font-weight: 800; margin: 0; }
    .text-primary { color: var(--primary); }
    .text-danger { color: var(--danger); }
    .text-success { color: var(--success); }
    .guideline-list { padding-left: 20px; line-height: 1.8; color: var(--text-primary); }
  `]
})
export class StaffDashboardComponent implements OnInit {
  staffArea = 'North Delhi';
  staffId = 'STF101';
  openAreaComplaints = 0;

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.staffId = user.userId;
      this.staffArea = user.areaAssigned || 'North Delhi';
    }

    this.complaintService.getComplaintsForArea(this.staffArea).subscribe(list => {
      this.openAreaComplaints = list.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
    });
  }
}
