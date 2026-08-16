export type ComplaintType =
  | 'Billing Related'
  | 'Voltage Related'
  | 'Frequent Disruption'
  | 'Street Light Related'
  | 'Pole Related'
  | 'Meter Related';

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Complaint {
  complaintId: string;
  consumerId: string;
  customerName?: string;
  complaintType: ComplaintType;
  category: string;
  contactPerson: string;
  mobile: string;
  address: string;
  landmark?: string;
  problemDescription: string;
  status: ComplaintStatus;
  priority: Priority;
  assignedArea: string;
  assignedStaffId?: string;
  resolutionRemarks?: string;
  createdAt: string;
  resolvedAt?: string;
}
