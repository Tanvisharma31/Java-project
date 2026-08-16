import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Feedback {
  feedbackId?: number;
  feedbackNumber: string;
  consumerId?: string;
  type: string;
  category: string;
  subject: string;
  details: string;
  rating: number;
  contactInfo?: string;
  status: string;
  adminResponse?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private api = `${environment.apiUrl}/feedback`;

  constructor(private http: HttpClient) {}

  submitFeedback(feedbackData: Partial<Feedback>): Observable<any> {
    return this.http.post<any>(`${this.api}/customer`, feedbackData).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to submit feedback');
      }),
      catchError(() => this.mockSubmitFeedback(feedbackData))
    );
  }

  getCustomerFeedback(consumerId: string): Observable<Feedback[]> {
    return this.http.get<any>(`${this.api}/customer/${consumerId}`).pipe(
      map(response => response.data || []),
      catchError(() => this.mockGetCustomerFeedback(consumerId))
    );
  }

  getAllFeedback(): Observable<Feedback[]> {
    return this.http.get<any>(`${this.api}/admin/all`).pipe(
      map(response => response.data || []),
      catchError(() => this.mockGetAllFeedback())
    );
  }

  respondToFeedback(feedbackId: number, adminResponse: string): Observable<any> {
    return this.http.post<any>(`${this.api}/admin/respond/${feedbackId}`, { adminResponse }).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to submit response');
      }),
      catchError(() => this.mockRespondToFeedback(feedbackId, adminResponse))
    );
  }

  getFeedbackByStatus(status: string): Observable<Feedback[]> {
    return this.http.get<any>(`${this.api}/admin/status/${status}`).pipe(
      map(response => response.data || []),
      catchError(() => this.mockGetFeedbackByStatus(status))
    );
  }

  // Mock methods for demo/fallback
  private mockSubmitFeedback(feedbackData: Partial<Feedback>): Observable<any> {
    const feedbackNumber = 'FB-' + Date.now().toString().slice(-8);
    return of({
      feedbackId: Math.floor(Math.random() * 1000),
      feedbackNumber,
      status: 'SUBMITTED',
      ...feedbackData
    });
  }

  private mockGetCustomerFeedback(consumerId: string): Observable<Feedback[]> {
    return of([
      {
        feedbackId: 1,
        feedbackNumber: 'FB-87654321',
        consumerId,
        type: 'SERVICE',
        category: 'Response Time',
        subject: 'Quick resolution of billing issue',
        details: 'I was very impressed with how quickly my billing query was resolved.',
        rating: 4,
        contactInfo: 'tanvi@example.com',
        status: 'RESOLVED',
        adminResponse: 'Thank you for your positive feedback!',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  private mockGetAllFeedback(): Observable<Feedback[]> {
    return of([
      {
        feedbackId: 1,
        feedbackNumber: 'FB-87654321',
        consumerId: '1000000000001',
        type: 'SERVICE',
        category: 'Response Time',
        subject: 'Quick resolution of billing issue',
        details: 'I was very impressed with how quickly my billing query was resolved.',
        rating: 4,
        contactInfo: 'tanvi@example.com',
        status: 'RESOLVED',
        adminResponse: 'Thank you for your positive feedback!',
        createdAt: new Date().toISOString()
      },
      {
        feedbackId: 2,
        feedbackNumber: 'FB-87654320',
        consumerId: '1000000000002',
        type: 'BILLING',
        category: 'Billing Accuracy',
        subject: 'Incorrect bill amount',
        details: 'My bill for August seems incorrect.',
        rating: 2,
        contactInfo: '9876543210',
        status: 'UNDER_REVIEW',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  private mockRespondToFeedback(feedbackId: number, adminResponse: string): Observable<any> {
    return of({
      feedbackId,
      adminResponse,
      status: 'RESOLVED',
      respondedAt: new Date().toISOString()
    });
  }

  private mockGetFeedbackByStatus(status: string): Observable<Feedback[]> {
    return this.mockGetAllFeedback().pipe(
      map(feedbacks => feedbacks.filter(f => f.status === status))
    );
  }
}