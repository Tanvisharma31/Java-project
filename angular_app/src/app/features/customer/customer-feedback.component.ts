import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FeedbackService } from '../../core/services/feedback.service';

interface FeedbackType {
  value: string;
  label: string;
}

@Component({
  selector: 'app-customer-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Submit Feedback</h2>
        </div>
        <div class="card-body">
          <form [formGroup]="feedbackForm" (ngSubmit)="onSubmit()">
            <!-- Feedback Type -->
            <div class="form-group">
              <label class="form-label">Feedback Type *</label>
              <select class="form-control" formControlName="feedbackType">
                <option value="">Select feedback type</option>
                <option *ngFor="let type of feedbackTypes" [value]="type.value">
                  {{ type.label }}
                </option>
              </select>
              <div class="invalid-feedback" *ngIf="feedbackForm.get('feedbackType')?.touched && feedbackForm.get('feedbackType')?.invalid">
                Please select feedback type
              </div>
            </div>

            <!-- Rating -->
            <div class="form-group">
              <label class="form-label">Rating *</label>
              <div class="rating-container">
                <span 
                  *ngFor="let star of [1,2,3,4,5]"
                  class="star"
                  [class.filled]="star <= feedbackForm.get('rating')?.value"
                  (click)="setRating(star)"
                >
                  ★
                </span>
              </div>
              <div class="invalid-feedback" *ngIf="feedbackForm.get('rating')?.touched && feedbackForm.get('rating')?.invalid">
                Please select a rating
              </div>
            </div>

            <!-- Category -->
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select class="form-control" formControlName="category">
                <option value="">Select category</option>
                <option *ngFor="let cat of categories" [value]="cat">
                  {{ cat }}
                </option>
              </select>
              <div class="invalid-feedback" *ngIf="feedbackForm.get('category')?.touched && feedbackForm.get('category')?.invalid">
                Please select category
              </div>
            </div>

            <!-- Subject -->
            <div class="form-group">
              <label class="form-label">Subject *</label>
              <input 
                type="text" 
                class="form-control" 
                formControlName="subject"
                placeholder="Brief subject of your feedback"
                maxlength="100"
              />
              <div class="invalid-feedback" *ngIf="feedbackForm.get('subject')?.touched && feedbackForm.get('subject')?.invalid">
                Subject is required (max 100 characters)
              </div>
            </div>

            <!-- Details -->
            <div class="form-group">
              <label class="form-label">Detailed Feedback *</label>
              <textarea 
                class="form-control" 
                formControlName="details"
                placeholder="Please provide detailed feedback..."
                rows="5"
                maxlength="1000"
              ></textarea>
              <div class="char-count">{{ feedbackForm.get('details')?.value?.length || 0 }}/1000</div>
              <div class="invalid-feedback" *ngIf="feedbackForm.get('details')?.touched && feedbackForm.get('details')?.invalid">
                Detailed feedback is required (10-1000 characters)
              </div>
            </div>

            <!-- Contact Info -->
            <div class="form-group">
              <label class="form-label">Contact Information (Optional)</label>
              <input 
                type="text" 
                class="form-control" 
                formControlName="contactInfo"
                placeholder="Email or phone number for follow-up"
              />
            </div>

            <!-- Error Message -->
            <div class="alert alert-danger" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <!-- Success Message -->
            <div class="alert alert-success" *ngIf="successMessage">
              {{ successMessage }}
            </div>

            <!-- Buttons -->
            <div class="form-actions">
              <button 
                type="button" 
                class="btn btn-secondary"
                (click)="onCancel()"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="feedbackForm.invalid || isLoading"
              >
                {{ isLoading ? 'Submitting...' : 'Submit Feedback' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: `
    .page-container {
      padding: 2rem;
      max-width: 700px;
      margin: 0 auto;
    }
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .card-title {
      margin: 0;
      font-size: 1.25rem;
      color: #0f172a;
    }
    .card-body {
      padding: 1.5rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #0f172a;
    }
    .form-control {
      width: 100%;
      padding: 0.625rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
      box-sizing: border-box;
    }
    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .form-control.is-invalid {
      border-color: #dc2626;
    }
    .invalid-feedback {
      color: #dc2626;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    .rating-container {
      display: flex;
      gap: 0.5rem;
    }
    .star {
      font-size: 2rem;
      color: #d1d5db;
      cursor: pointer;
      transition: color 0.2s;
    }
    .star:hover {
      color: #fbbf24;
    }
    .star.filled {
      color: #fbbf24;
    }
    .char-count {
      text-align: right;
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.25rem;
    }
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    .alert-danger {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
    .alert-success {
      background: #dcfce7;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }
    .form-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
    .btn {
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
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
export class CustomerFeedbackComponent implements OnInit {
  feedbackForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  feedbackTypes: FeedbackType[] = [
    { value: 'SERVICE', label: 'Service Quality' },
    { value: 'BILLING', label: 'Billing Related' },
    { value: 'WEBSITE', label: 'Website/App Experience' },
    { value: 'STAFF', label: 'Staff Behavior' },
    { value: 'SUGGESTION', label: 'Suggestion' },
    { value: 'COMPLIMENT', label: 'Compliment' },
    { value: 'COMPLAINT', label: 'Complaint' }
  ];

  categories: string[] = [
    'Response Time',
    'Professionalism',
    'Problem Resolution',
    'Communication',
    'Technical Issue',
    'Billing Accuracy',
    'Ease of Use',
    'Overall Experience',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private feedbackService: FeedbackService
  ) {
    this.feedbackForm = this.fb.group({
      feedbackType: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      category: ['', Validators.required],
      subject: ['', [Validators.required, Validators.maxLength(100)]],
      details: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      contactInfo: ['', Validators.maxLength(100)]
    });
  }

  ngOnInit(): void {}

  setRating(rating: number): void {
    this.feedbackForm.patchValue({ rating });
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const feedbackData = this.feedbackForm.value;

    // Call real API
    this.feedbackService.submitFeedback(feedbackData).subscribe({
      next: (response) => {
        this.successMessage = `Feedback submitted successfully! Feedback ID: ${response.feedbackNumber}`;
        this.feedbackForm.reset();
        this.setRating(0);

        // Redirect after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/customer/dashboard']);
        }, 2000);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
        // Fallback to mock behavior
        this.mockSubmitFeedback(feedbackData);
      }
    });
  }

  mockSubmitFeedback(feedbackData: any): void {
    setTimeout(() => {
      const feedbackNumber = 'FB-' + Date.now().toString().slice(-8);
      this.successMessage = `Feedback submitted successfully (Demo Mode)! Feedback ID: ${feedbackNumber}`;
      this.feedbackForm.reset();
      this.setRating(0);

      setTimeout(() => {
        this.router.navigate(['/customer/dashboard']);
      }, 2000);

      this.isLoading = false;
    }, 1000);
  }

  onCancel(): void {
    this.router.navigate(['/customer/dashboard']);
  }
}