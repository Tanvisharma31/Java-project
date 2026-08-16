import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FeedbackService, Feedback as FeedbackModel } from '../../core/services/feedback.service';

interface AdminFeedback {
  id: string;
  feedbackType: string;
  rating: number;
  category: string;
  subject: string;
  details: string;
  contactInfo: string;
  status: string;
  adminResponse: string;
  createdAt: Date;
}

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Customer Feedback Management</h1>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ feedbacks.length }}</div>
          <div class="stat-label">Total Feedback</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-label">Pending Review</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ averageRating }}/5</div>
          <div class="stat-label">Average Rating</div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          class="filter-tab" 
          [class.active]="activeFilter === 'ALL'"
          (click)="setFilter('ALL')"
        >
          All
        </button>
        <button 
          class="filter-tab" 
          [class.active]="activeFilter === 'SUBMITTED'"
          (click)="setFilter('SUBMITTED')"
        >
          Pending ({{ pendingCount }})
        </button>
        <button 
          class="filter-tab" 
          [class.active]="activeFilter === 'UNDER_REVIEW'"
          (click)="setFilter('UNDER_REVIEW')"
        >
          Under Review
        </button>
        <button 
          class="filter-tab" 
          [class.active]="activeFilter === 'RESOLVED'"
          (click)="setFilter('RESOLVED')"
        >
          Resolved
        </button>
      </div>

      <!-- Feedback List -->
      <div class="feedback-list">
        <div 
          *ngFor="let feedback of filteredFeedbacks"
          class="feedback-card"
        >
          <div class="feedback-header">
            <div class="feedback-id">{{ feedback.id }}</div>
            <div class="feedback-meta">
              <span class="badge" [class]="getStatusBadgeClass(feedback.status)">
                {{ feedback.status }}
              </span>
              <span class="feedback-date">{{ formatDate(feedback.createdAt) }}</span>
            </div>
          </div>

          <div class="feedback-body">
            <div class="feedback-info">
              <div class="info-row">
                <span class="label">Type:</span>
                <span class="value">{{ feedback.feedbackType }}</span>
              </div>
              <div class="info-row">
                <span class="label">Category:</span>
                <span class="value">{{ feedback.category }}</span>
              </div>
              <div class="info-row">
                <span class="label">Rating:</span>
                <span class="value rating-stars">{{ '★'.repeat(feedback.rating) }}{{ '☆'.repeat(5 - feedback.rating) }}</span>
              </div>
              <div class="info-row" *ngIf="feedback.contactInfo">
                <span class="label">Contact:</span>
                <span class="value">{{ feedback.contactInfo }}</span>
              </div>
            </div>

            <div class="feedback-content">
              <div class="subject">{{ feedback.subject }}</div>
              <div class="details">{{ feedback.details }}</div>
            </div>

            <!-- Admin Response Section -->
            <div class="admin-response-section" *ngIf="feedback.status !== 'SUBMITTED' || showResponseForm[feedback.id]">
              <div class="response-label">Admin Response:</div>
              <div class="response-text" *ngIf="feedback.adminResponse && !showResponseForm[feedback.id]">
                {{ feedback.adminResponse }}
              </div>
              
              <!-- Response Form -->
              <div *ngIf="showResponseForm[feedback.id]" class="response-form">
                <textarea 
                  class="form-control"
                  [(ngModel)]="responseText[feedback.id]"
                  placeholder="Type your response here..."
                  rows="3"
                ></textarea>
                <div class="response-actions">
                  <button 
                    class="btn btn-secondary"
                    (click)="cancelResponse(feedback.id)"
                  >
                    Cancel
                  </button>
                  <button 
                    class="btn btn-primary"
                    (click)="submitResponse(feedback.id)"
                  >
                    Submit Response
                  </button>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="feedback-actions" *ngIf="feedback.status === 'SUBMITTED'">
              <button 
                class="btn btn-primary"
                (click)="showResponseForm[feedback.id] = true"
              >
                Respond
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredFeedbacks.length === 0">
          <div class="empty-icon">📝</div>
          <h3>No Feedback Found</h3>
          <p>No feedback matches the current filter.</p>
        </div>
      </div>
    </div>
  `,
  styles: `
    .page-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 1.5rem;
    }
    .page-header h1 {
      margin: 0;
      font-size: 1.75rem;
      color: #0f172a;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      text-align: center;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 0.5rem;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
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
    .feedback-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .feedback-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .feedback-id {
      font-weight: 600;
      color: #0f172a;
    }
    .feedback-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-SUBMITTED {
      background: #dbeafe;
      color: #0284c7;
    }
    .badge-UNDER_REVIEW {
      background: #fef3c7;
      color: #d97706;
    }
    .badge-RESOLVED {
      background: #dcfce7;
      color: #16a34a;
    }
    .feedback-date {
      font-size: 0.75rem;
      color: #64748b;
    }
    .feedback-body {
      padding: 1.5rem;
    }
    .feedback-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-row {
      display: flex;
      gap: 0.5rem;
    }
    .label {
      font-weight: 500;
      color: #64748b;
      font-size: 0.875rem;
    }
    .value {
      color: #0f172a;
      font-size: 0.875rem;
    }
    .rating-stars {
      color: #fbbf24;
    }
    .feedback-content {
      margin-bottom: 1rem;
    }
    .subject {
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }
    .details {
      color: #475569;
      line-height: 1.6;
      font-size: 0.875rem;
    }
    .admin-response-section {
      background: #f0fdf4;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .response-label {
      font-weight: 600;
      color: #16a34a;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }
    .response-text {
      color: #0f172a;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    .response-form {
      margin-top: 0.75rem;
    }
    .form-control {
      width: 100%;
      padding: 0.625rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
      box-sizing: border-box;
      margin-bottom: 0.75rem;
    }
    .response-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }
    .feedback-actions {
      display: flex;
      gap: 0.5rem;
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
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    .btn-primary:hover {
      background: #1d4ed8;
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
export class AdminFeedbackComponent implements OnInit {
  feedbacks: AdminFeedback[] = [];
  filteredFeedbacks: AdminFeedback[] = [];
  activeFilter = 'ALL';
  showResponseForm: { [key: string]: boolean } = {};
  responseText: { [key: string]: string } = {};

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    this.feedbackService.getAllFeedback().subscribe({
      next: (data) => {
        // Transform backend data to component format
        this.feedbacks = data.map(f => ({
          id: f.feedbackNumber,
          feedbackType: f.type,
          rating: f.rating,
          category: f.category,
          subject: f.subject,
          details: f.details,
          contactInfo: f.contactInfo || '',
          status: f.status,
          adminResponse: f.adminResponse || '',
          createdAt: new Date(f.createdAt || new Date())
        }));
        this.filteredFeedbacks = [...this.feedbacks];
      },
      error: (error) => {
        console.error('Error loading feedbacks:', error);
        // Use mock data on error
        this.loadMockFeedbacks();
      }
    });
  }

  loadMockFeedbacks(): void {
    // Mock data using simple array
    this.feedbacks = [
      {
        id: 'FB-87654321',
        feedbackType: 'SERVICE',
        rating: 4,
        category: 'Response Time',
        subject: 'Quick resolution of billing issue',
        details: 'I was very impressed with how quickly my billing query was resolved. The staff was helpful and professional.',
        contactInfo: 'tanvi@example.com',
        status: 'SUBMITTED',
        adminResponse: '',
        createdAt: new Date('2026-08-15T10:30:00')
      },
      {
        id: 'FB-87654320',
        feedbackType: 'BILLING',
        rating: 2,
        category: 'Billing Accuracy',
        subject: 'Incorrect bill amount',
        details: 'My bill for August seems incorrect. The units consumed don\'t match my actual usage. Please review.',
        contactInfo: '9876543210',
        status: 'UNDER_REVIEW',
        adminResponse: 'Thank you for your feedback. We are currently reviewing your meter readings and will get back to you within 24 hours.',
        createdAt: new Date('2026-08-14T15:45:00')
      },
      {
        id: 'FB-87654319',
        feedbackType: 'WEBSITE',
        rating: 5,
        category: 'Ease of Use',
        subject: 'Great user experience',
        details: 'The new website is very easy to navigate. I could pay my bill without any issues. Keep up the good work!',
        contactInfo: '',
        status: 'RESOLVED',
        adminResponse: 'Thank you for your positive feedback! We\'re glad you found the website easy to use.',
        createdAt: new Date('2026-08-13T09:20:00')
      },
      {
        id: 'FB-87654318',
        feedbackType: 'STAFF',
        rating: 3,
        category: 'Professionalism',
        subject: 'Staff behavior during meter reading',
        details: 'The staff member who came for meter reading was polite but seemed rushed. Could improve communication.',
        contactInfo: 'ramesh@example.com',
        status: 'SUBMITTED',
        adminResponse: '',
        createdAt: new Date('2026-08-12T14:00:00')
      }
    ];

    this.filteredFeedbacks = [...this.feedbacks];
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeFilter === 'ALL') {
      this.filteredFeedbacks = [...this.feedbacks];
    } else {
      this.filteredFeedbacks = this.feedbacks.filter(f => f.status === this.activeFilter);
    }
  }

  get pendingCount(): number {
    return this.feedbacks.filter(f => f.status === 'SUBMITTED').length;
  }

  get averageRating(): string {
    if (this.feedbacks.length === 0) return '0.0';
    const total = this.feedbacks.reduce((sum, f) => sum + f.rating, 0);
    return (total / this.feedbacks.length).toFixed(1);
  }

  getStatusBadgeClass(status: string): string {
    return `badge-${status}`;
  }

  submitResponse(feedbackId: string): void {
    const feedback = this.feedbacks.find(f => f.id === feedbackId);
    if (feedback && this.responseText[feedbackId]) {
      // Call real API
      this.feedbackService.respondToFeedback(
        parseInt(feedbackId.replace('FB-', '')), // Extract numeric ID
        this.responseText[feedbackId]
      ).subscribe({
        next: (response) => {
          feedback.adminResponse = this.responseText[feedbackId];
          feedback.status = 'RESOLVED';
          this.showResponseForm[feedbackId] = false;
          this.responseText[feedbackId] = '';
          this.applyFilter();
        },
        error: (error) => {
          console.error('Error submitting response:', error);
          // Fallback to mock behavior
          feedback.adminResponse = this.responseText[feedbackId];
          feedback.status = 'RESOLVED';
          this.showResponseForm[feedbackId] = false;
          this.responseText[feedbackId] = '';
          this.applyFilter();
        }
      });
    }
  }

  cancelResponse(feedbackId: string): void {
    this.showResponseForm[feedbackId] = false;
    this.responseText[feedbackId] = '';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}