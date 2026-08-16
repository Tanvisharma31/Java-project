import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Customer, CustomerDeactivationRequest } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private mockCustomers: Customer[] = [
    {
      consumerId: '1000987654321',
      name: 'Tanvi Sharma',
      email: 'tanvi.sharma@example.com',
      mobile: '9876543210',
      title: 'Ms',
      userId: 'tanvi_2004',
      status: 'Active',
      addressArea: 'North Delhi',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      connectionType: 'RESIDENTIAL',
      sanctionedLoadKw: 3.5,
      previousMeterReading: 1250,
      meterNumber: 'MTR-ND-9921',
      createdAt: '2026-01-15'
    },
    {
      consumerId: '1000987654322',
      name: 'Tanvi Sharma (Plot 2)',
      email: 'tanvi.sharma@example.com',
      mobile: '9876543210',
      title: 'Ms',
      userId: 'tanvi_2004',
      status: 'Active',
      addressArea: 'South Delhi',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110024',
      connectionType: 'COMMERCIAL',
      sanctionedLoadKw: 10.0,
      previousMeterReading: 4800,
      meterNumber: 'MTR-SD-4412',
      createdAt: '2026-02-10'
    },
    {
      consumerId: '1000987654323',
      name: 'Ramesh Kumar',
      email: 'ramesh.k@example.com',
      mobile: '9812345678',
      title: 'Mr',
      userId: 'ramesh_k',
      status: 'Active',
      addressArea: 'West Delhi',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110018',
      connectionType: 'RESIDENTIAL',
      sanctionedLoadKw: 2.0,
      previousMeterReading: 890,
      meterNumber: 'MTR-WD-1029',
      createdAt: '2026-03-01'
    }
  ];

  private customersSubject = new BehaviorSubject<Customer[]>(this.mockCustomers);
  public customers$ = this.customersSubject.asObservable();

  constructor() {}

  getCustomerByConsumerId(consumerId: string): Observable<Customer | null> {
    const found = this.mockCustomers.find(c => c.consumerId === consumerId);
    return of(found || null);
  }

  getCustomersByUserId(userId: string): Observable<Customer[]> {
    const list = this.mockCustomers.filter(c => c.userId === userId);
    return of(list);
  }

  getAllCustomers(): Observable<Customer[]> {
    return of(this.mockCustomers);
  }

  updateProfile(consumerId: string, updatedData: Partial<Customer>): Observable<Customer> {
    const idx = this.mockCustomers.findIndex(c => c.consumerId === consumerId);
    if (idx !== -1) {
      this.mockCustomers[idx] = { ...this.mockCustomers[idx], ...updatedData };
      this.customersSubject.next(this.mockCustomers);
      return of(this.mockCustomers[idx]);
    }
    return throwError(() => new Error('Customer not found'));
  }

  deactivateAccount(req: CustomerDeactivationRequest): Observable<{ success: boolean; message: string }> {
    const idx = this.mockCustomers.findIndex(c => c.consumerId === req.consumerId);
    if (idx !== -1) {
      this.mockCustomers[idx].status = 'Deactivated';
      this.mockCustomers[idx].deactivationReason = `${req.reason}: ${req.notes || 'No extra comments'}`;
      this.customersSubject.next(this.mockCustomers);
      return of({
        success: true,
        message: `Account deactivated successfully under reason: ${req.reason}`
      });
    }
    return throwError(() => new Error('Customer not found for deactivation'));
  }

  toggleCustomerStatus(consumerId: string): Observable<Customer> {
    const idx = this.mockCustomers.findIndex(c => c.consumerId === consumerId);
    if (idx !== -1) {
      const current = this.mockCustomers[idx].status;
      this.mockCustomers[idx].status = current === 'Active' ? 'Inactive' : 'Active';
      this.customersSubject.next(this.mockCustomers);
      return of(this.mockCustomers[idx]);
    }
    return throwError(() => new Error('Customer not found'));
  }
}
