import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Complaint, ComplaintStatus } from '../models/complaint.model';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private mockComplaints: Complaint[] = [
    {
      complaintId: 'CMP-2026-0001',
      consumerId: '1000987654321',
      customerName: 'Tanvi Sharma',
      complaintType: 'Voltage Related',
      category: 'High Voltage Fluctuation',
      contactPerson: 'Tanvi Sharma',
      mobile: '9876543210',
      address: 'H-42, Model Town, North Delhi',
      landmark: 'Near Metro Station',
      problemDescription: 'Frequent voltage spikes during evening hours causing appliance flicker.',
      status: 'OPEN',
      priority: 'HIGH',
      assignedArea: 'North Delhi',
      createdAt: '2026-08-10'
    },
    {
      complaintId: 'CMP-2026-0002',
      consumerId: '1000987654322',
      customerName: 'Tanvi Sharma (Plot 2)',
      complaintType: 'Meter Related',
      category: 'Faulty Meter Display',
      contactPerson: 'Tanvi Sharma',
      mobile: '9876543210',
      address: 'Plot 12, Commercial Belt, South Delhi',
      problemDescription: 'Meter screen is blank and not registering current digital readings.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      assignedArea: 'South Delhi',
      assignedStaffId: 'STF102',
      createdAt: '2026-08-12'
    }
  ];

  private complaintsSubject = new BehaviorSubject<Complaint[]>(this.mockComplaints);
  public complaints$ = this.complaintsSubject.asObservable();

  getComplaintsForCustomer(consumerId: string): Observable<Complaint[]> {
    const list = this.mockComplaints.filter(c => c.consumerId === consumerId);
    return of(list);
  }

  getComplaintsForArea(area: string): Observable<Complaint[]> {
    const list = this.mockComplaints.filter(c => c.assignedArea === area);
    return of(list);
  }

  getAllComplaints(): Observable<Complaint[]> {
    return of(this.mockComplaints);
  }

  createComplaint(complaint: Partial<Complaint>): Observable<Complaint> {
    const newId = 'CMP-2026-' + Math.floor(1000 + Math.random() * 9000).toString();
    const full: Complaint = {
      complaintId: newId,
      consumerId: complaint.consumerId!,
      customerName: complaint.customerName || 'Customer',
      complaintType: complaint.complaintType!,
      category: complaint.category!,
      contactPerson: complaint.contactPerson!,
      mobile: complaint.mobile!,
      address: complaint.address!,
      landmark: complaint.landmark || '',
      problemDescription: complaint.problemDescription!,
      status: 'OPEN',
      priority: complaint.priority || 'LOW',
      assignedArea: complaint.assignedArea || 'North Delhi',
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.mockComplaints.unshift(full);
    this.complaintsSubject.next(this.mockComplaints);
    return of(full);
  }

  updateStatus(complaintId: string, status: ComplaintStatus, remarks?: string): Observable<Complaint> {
    const idx = this.mockComplaints.findIndex(c => c.complaintId === complaintId);
    if (idx !== -1) {
      this.mockComplaints[idx].status = status;
      if (remarks) this.mockComplaints[idx].resolutionRemarks = remarks;
      if (status === 'RESOLVED') this.mockComplaints[idx].resolvedAt = new Date().toISOString().split('T')[0];
      this.complaintsSubject.next(this.mockComplaints);
      return of(this.mockComplaints[idx]);
    }
    throw new Error('Complaint not found');
  }
}
