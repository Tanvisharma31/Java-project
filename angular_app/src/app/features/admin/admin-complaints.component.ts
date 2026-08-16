import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ComplaintService } from '../../core/services/complaint.service';
import { Complaint } from '../../core/models/complaint.model';

@Component({
  selector: 'app-admin-complaints',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="dashboard-layout">
        <app-sidebar role="ADMIN"></app-sidebar>
        <main class="main-content">
          <div class="card-header">
            <div>
              <h1>System Complaints Audit</h1>
              <p>Monitor customer complaints across all geographical areas and track staff resolution timelines.</p>
            </div>
          </div>

          <div class="card">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Consumer ID</th>
                    <th>Area</th>
                    <th>Type & Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of complaints">
                    <td><strong>{{ c.complaintId }}</strong></td>
                    <td><strong class="monospace">{{ c.consumerId }}</strong></td>
                    <td><span class="badge badge-info">{{ c.assignedArea }}</span></td>
                    <td>
                      <div><strong>{{ c.complaintType }}</strong></div>
                      <small class="text-secondary">{{ c.category }}</small>
                    </td>
                    <td>
                      <span class="badge" [class.badge-danger]="c.priority === 'HIGH'" [class.badge-warning]="c.priority === 'MEDIUM'" [class.badge-muted]="c.priority === 'LOW'">
                        {{ c.priority }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" [class.badge-warning]="c.status === 'OPEN'" [class.badge-info]="c.status === 'IN_PROGRESS'" [class.badge-success]="c.status === 'RESOLVED'" [class.badge-danger]="c.status === 'REJECTED'">
                        {{ c.status }}
                      </span>
                    </td>
                    <td>{{ c.createdAt }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .monospace { font-family: monospace; }
    .text-secondary { color: var(--text-secondary); }
  `]
})
export class AdminComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];

  constructor(private complaintService: ComplaintService) {}

  ngOnInit(): void {
    this.complaintService.getAllComplaints().subscribe(list => this.complaints = list);
  }
}
