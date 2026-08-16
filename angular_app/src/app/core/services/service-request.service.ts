import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ServiceRequest, ServiceRequestStatus } from '../models/service-request.model';
import { CustomerService } from './customer.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {
  private mockRequests: ServiceRequest[] = [
    {
      requestId: 'SR-2026-001',
      consumerId: '1000987654321',
      customerName: 'Tanvi Sharma',
      requestType: 'LOAD_CHANGE',
      currentValue: '3.5 kW',
      requestedValue: '5.0 kW',
      reason: 'Installed new central air conditioning unit requiring additional load.',
      status: 'PENDING',
      createdAt: '2026-08-05'
    }
  ];

  private requestsSubject = new BehaviorSubject<ServiceRequest[]>(this.mockRequests);
  public requests$ = this.requestsSubject.asObservable();

  constructor(private customerService: CustomerService) {}

  getRequestsForCustomer(consumerId: string): Observable<ServiceRequest[]> {
    const list = this.mockRequests.filter(r => r.consumerId === consumerId);
    return of(list);
  }

  getAllRequests(): Observable<ServiceRequest[]> {
    return of(this.mockRequests);
  }

  createRequest(req: Partial<ServiceRequest>): Observable<ServiceRequest> {
    const newId = 'SR-2026-' + Math.floor(100 + Math.random() * 900).toString();
    const full: ServiceRequest = {
      requestId: newId,
      consumerId: req.consumerId!,
      customerName: req.customerName || 'Customer',
      requestType: req.requestType!,
      currentValue: req.currentValue!,
      requestedValue: req.requestedValue!,
      reason: req.reason!,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.mockRequests.unshift(full);
    this.requestsSubject.next(this.mockRequests);
    return of(full);
  }

  updateRequestStatus(requestId: string, status: ServiceRequestStatus, remarks?: string): Observable<ServiceRequest> {
    const idx = this.mockRequests.findIndex(r => r.requestId === requestId);
    if (idx !== -1) {
      const item = this.mockRequests[idx];
      item.status = status;
      item.remarks = remarks;
      item.actionedAt = new Date().toISOString().split('T')[0];

      if (status === 'APPROVED') {
        if (item.requestType === 'LOAD_CHANGE') {
          const load = parseFloat(item.requestedValue);
          this.customerService.updateProfile(item.consumerId, { sanctionedLoadKw: load });
        } else if (item.requestType === 'CATEGORY_CHANGE') {
          const cat = item.requestedValue as 'RESIDENTIAL' | 'COMMERCIAL';
          this.customerService.updateProfile(item.consumerId, { connectionType: cat });
        }
      }

      this.requestsSubject.next(this.mockRequests);
      return of(item);
    }
    throw new Error('Service request not found');
  }
}
