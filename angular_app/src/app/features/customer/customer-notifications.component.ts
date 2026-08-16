import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, NotificationItem } from '../../core/services/notification.service';

interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-customer-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Notifications</h1>
        <button class="btn btn-secondary" (click)="markAllAsRead()" *ngIf="hasUnreadNotifications">
          Mark All as Read
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          class="filter-tab" 
          [class.active]="activeFilter === 'ALL'"
          (click)="setFilter('ALL')"
        >
          All ({{ notifications.length }})
        </button>
        <button 
          class="filter-tab" 
          [class.active]="activeFilter === 'UNREAD'"
          (click)="setFilter('UNREAD')"
        >
          Unread ({{ unreadCount }})
        </button>
        <button 
          class="filter-tab" 
          [class.active]="activeFilter === 'BILL'"
          (click)="setFilter('BILL')"
        >
          Bills
        </button>
        <button 
          class="filter-tab" 
          [class.active]="activeFilter === 'PAYMENT'"
          (click)="setFilter('PAYMENT')"
        >
          Payments
        </button>
        <button 
          class="filter-tab" 
          [class.active]="activeFilter === 'COMPLAINT'"
          (click)="setFilter('COMPLAINT')"
        >
          Complaints
        </button>
      </div>

      <!-- Notifications List -->
      <div class="notifications-list">
        <div 
          *ngFor="let notification of filteredNotifications"
          class="notification-card"
          [class.unread]="!notification.isRead"
          (click)="markAsRead(notification)"
        >
          <div class="notification-header">
            <span class="notification-type">{{ notification.type }}</span>
            <span class="notification-date">{{ formatDate(notification.createdAt) }}</span>
          </div>
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-status" *ngIf="!notification.isRead">
            <span class="badge badge-info">New</span>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredNotifications.length === 0">
          <div class="empty-icon">📬</div>
          <h3>No Notifications</h3>
          <p>{{ getEmptyMessage() }}</p>
        </div>
      </div>
    </div>
  `,
  styles: `
    .page-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-header h1 {
      margin: 0;
      font-size: 1.75rem;
      color: #0f172a;
    }
    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .filter-tab {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      color: #64748b;
      transition: all 0.2s;
    }
    .filter-tab:hover {
      background: #f1f5f9;
    }
    .filter-tab.active {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
    }
    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .notification-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .notification-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .notification-card.unread {
      background: #eff6ff;
      border-left: 4px solid #2563eb;
    }
    .notification-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    .notification-type {
      font-weight: 600;
      color: #2563eb;
      font-size: 0.75rem;
      text-transform: uppercase;
    }
    .notification-date {
      font-size: 0.75rem;
      color: #64748b;
    }
    .notification-message {
      color: #0f172a;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    .notification-status {
      margin-top: 0.5rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-info {
      background: #dbeafe;
      color: #0284c7;
    }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #0f172a;
    }
    .empty-state p {
      margin: 0;
      color: #64748b;
    }
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
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
export class CustomerNotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  activeFilter = 'ALL';
  unreadCount = 0;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        // Transform backend data to component format
        this.notifications = data.map(n => ({
          id: n.notificationId,
          message: n.message,
          type: this.extractNotificationType(n.message),
          isRead: n.isRead,
          createdAt: new Date(n.createdAt)
        }));
        this.filteredNotifications = [...this.notifications];
        this.updateUnreadCount();
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        // Use mock data on error
        this.loadMockNotifications();
      }
    });
  }

  loadMockNotifications(): void {
    // Mock data using simple array
    this.notifications = [
      {
        id: 1,
        message: 'Your August electricity bill has been generated. Amount: ₹1,850.00',
        type: 'BILL',
        isRead: false,
        createdAt: new Date('2026-08-15T10:30:00')
      },
      {
        id: 2,
        message: 'Payment successful. Transaction ID: TXN12345. Amount: ₹1,850.00',
        type: 'PAYMENT',
        isRead: false,
        createdAt: new Date('2026-08-14T15:45:00')
      },
      {
        id: 3,
        message: 'Your complaint CMP-2026-000001 has been resolved.',
        type: 'COMPLAINT',
        isRead: true,
        createdAt: new Date('2026-08-13T09:20:00')
      },
      {
        id: 4,
        message: 'Your load change request has been approved. New load: 5kW',
        type: 'SERVICE_REQUEST',
        isRead: true,
        createdAt: new Date('2026-08-12T14:00:00')
      },
      {
        id: 5,
        message: 'Bill due date reminder: Pay your August bill by 25th to avoid late fee.',
        type: 'BILL',
        isRead: false,
        createdAt: new Date('2026-08-10T08:00:00')
      }
    ];

    this.filteredNotifications = [...this.notifications];
    this.updateUnreadCount();
  }

  extractNotificationType(message: string): string {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('bill')) return 'BILL';
    if (lowerMessage.includes('payment')) return 'PAYMENT';
    if (lowerMessage.includes('complaint')) return 'COMPLAINT';
    if (lowerMessage.includes('request') || lowerMessage.includes('approved')) return 'SERVICE_REQUEST';
    return 'GENERAL';
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeFilter === 'ALL') {
      this.filteredNotifications = [...this.notifications];
    } else if (this.activeFilter === 'UNREAD') {
      this.filteredNotifications = this.notifications.filter(n => !n.isRead);
    } else {
      this.filteredNotifications = this.notifications.filter(n => n.type === this.activeFilter);
    }
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      // Call backend API
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
          this.updateUnreadCount();
          this.applyFilter();
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
          // Fallback to local update
          notification.isRead = true;
          this.updateUnreadCount();
          this.applyFilter();
        }
      });
    }
  }

  markAllAsRead(): void {
    // Mark all unread notifications as read
    const unreadNotifications = this.notifications.filter(n => !n.isRead);
    unreadNotifications.forEach(notification => {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
          notification.isRead = true; // Fallback
        }
      });
    });

    // Update local state immediately for better UX
    this.notifications.forEach(n => n.isRead = true);
    this.updateUnreadCount();
    this.applyFilter();
  }

  updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  get hasUnreadNotifications(): boolean {
    return this.unreadCount > 0;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  }

  getEmptyMessage(): string {
    switch (this.activeFilter) {
      case 'UNREAD':
        return 'You have no unread notifications';
      case 'BILL':
        return 'No bill notifications';
      case 'PAYMENT':
        return 'No payment notifications';
      case 'COMPLAINT':
        return 'No complaint notifications';
      default:
        return 'No notifications available';
    }
  }
}