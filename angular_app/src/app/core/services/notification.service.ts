import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';


export interface NotificationItem {
  notificationId: number;
  consumerId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = `${environment.apiUrl}/customer/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<NotificationItem[]> {
    return this.http.get<any>(this.api).pipe(
      map(r => r.data || []),
      catchError(() => this.getMockNotifications())
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<any>(`${this.api}/unread-count`).pipe(
      map(r => r.data || 0),
      catchError(() => of(2)) // Mock unread count
    );
  }

  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.api}/${id}/read`, {}).pipe(
      catchError(() => of({ success: true }))
    );
  }

  private getMockNotifications(): Observable<NotificationItem[]> {
    return of([
      {
        notificationId: 1,
        consumerId: '1000000000001',
        message: 'Your August electricity bill has been generated. Amount: ₹1,850.00',
        isRead: false,
        createdAt: new Date('2026-08-15T10:30:00').toISOString()
      },
      {
        notificationId: 2,
        consumerId: '1000000000001',
        message: 'Payment successful. Transaction ID: TXN12345. Amount: ₹1,850.00',
        isRead: false,
        createdAt: new Date('2026-08-14T15:45:00').toISOString()
      },
      {
        notificationId: 3,
        consumerId: '1000000000001',
        message: 'Your complaint CMP-2026-000001 has been resolved.',
        isRead: true,
        createdAt: new Date('2026-08-13T09:20:00').toISOString()
      }
    ]);
  }
}
