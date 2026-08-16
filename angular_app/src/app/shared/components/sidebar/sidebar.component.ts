import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Role } from '../../../core/models/user.model';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <span class="role-badge">{{ role }} PORTAL</span>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li *ngFor="let item of navItems">
            <a [routerLink]="item.route" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 16px 0;
      flex-shrink: 0;
    }
    .sidebar-header {
      padding: 0 16px 16px 16px;
      border-bottom: 1px solid var(--border-light);
      margin-bottom: 12px;
    }
    .role-badge {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--primary);
      background: var(--primary-light);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
    }
    .sidebar-nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 14px;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .nav-link:hover {
      background-color: var(--surface-alt);
      color: var(--text-primary);
    }
    .nav-link.active {
      background-color: var(--primary-light);
      color: var(--primary);
      border-right: 3px solid var(--primary);
      font-weight: 600;
    }
    .nav-icon { font-size: 16px; }
  `]
})
export class SidebarComponent {
  @Input() role: Role = 'CUSTOMER';

  get navItems(): NavItem[] {
    if (this.role === 'ADMIN') {
      return [
        { label: 'Dashboard', route: '/admin/dashboard', icon: '📊' },
        { label: 'Customer Management', route: '/admin/customers', icon: '👥' },
        { label: 'Staff Management', route: '/admin/staff', icon: '👨‍💼' },
        { label: 'Tariff Rates', route: '/admin/tariffs', icon: '💰' },
        { label: 'Complaints', route: '/admin/complaints', icon: '⚠️' },
        { label: 'Service Requests', route: '/admin/service-requests', icon: '📝' },
        { label: 'Feedback', route: '/admin/feedback', icon: '💬' },
        { label: 'Analytics & Reports', route: '/admin/reports', icon: '📈' }
      ];
    } else if (this.role === 'STAFF') {
      return [
        { label: 'Dashboard', route: '/staff/dashboard', icon: '📊' },
        { label: 'Enter Meter Reading', route: '/staff/meter-readings', icon: '📟' },
        { label: 'Area Complaints', route: '/staff/complaints', icon: '🛠️' }
      ];
    } else {
      return [
        { label: 'Dashboard', route: '/customer/dashboard', icon: '🏠' },
        { label: 'My Profile', route: '/customer/profile', icon: '👤' },
        { label: 'View & Pay Bills', route: '/customer/bills', icon: '📄' },
        { label: 'Payment History', route: '/customer/payments/history', icon: '💳' },
        { label: 'Raise Complaint', route: '/customer/complaints', icon: '📢' },
        { label: 'Service Requests', route: '/customer/service-requests', icon: '⚡' },
        { label: 'Notifications', route: '/customer/notifications', icon: '🔔' },
        { label: 'Change Password', route: '/customer/change-password', icon: '🔐' },
        { label: 'Feedback', route: '/customer/feedback', icon: '💬' }
      ];
    }
  }
}
