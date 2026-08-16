import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AnalyticsDashboard {
  totalCustomers: number;
  activeCustomers: number;
  totalStaff: number;
  totalRevenue: number;
  pendingDues: number;
  paidBills: number;
  pendingBills: number;
  overdueBills: number;
  activeComplaints: number;
  pendingServiceRequests: number;
}

export interface DefaulterRecord {
  consumerId: string;
  name: string;
  area: string;
  outstandingAmount: number;
  unpaidBillsCount: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private api = `${environment.apiUrl}/admin/analytics`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AnalyticsDashboard> {
    return this.http.get<any>(`${this.api}/dashboard`).pipe(map(r => r.data));
  }

  getDefaulters(): Observable<DefaulterRecord[]> {
    return this.http.get<any>(`${this.api}/defaulters`).pipe(map(r => r.data || []));
  }

  getRevenueSummary(): Observable<Record<string, number>> {
    return this.http.get<any>(`${this.api}/revenue-summary`).pipe(map(r => r.data || {}));
  }
}
