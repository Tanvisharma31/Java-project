export type ServiceRequestType = 'LOAD_CHANGE' | 'CATEGORY_CHANGE';
export type ServiceRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ServiceRequest {
  requestId: string;
  consumerId: string;
  customerName?: string;
  requestType: ServiceRequestType;
  currentValue: string;
  requestedValue: string;
  reason: string;
  status: ServiceRequestStatus;
  remarks?: string;
  createdAt: string;
  actionedAt?: string;
}
