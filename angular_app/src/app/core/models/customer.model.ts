export type CustomerStatus = 'Active' | 'Inactive' | 'Deactivated';
export type ConnectionType = 'RESIDENTIAL' | 'COMMERCIAL';
export type TitleType = 'Mr' | 'Mrs' | 'Ms' | 'Dr';

export interface Customer {
  consumerId: string; // Exactly 13 digits
  name: string;
  email: string;
  mobile: string;
  title: TitleType;
  userId: string;
  status: CustomerStatus;
  deactivationReason?: string;
  addressArea: string;
  city: string;
  state: string;
  pincode: string;
  connectionType: ConnectionType;
  sanctionedLoadKw: number;
  previousMeterReading: number;
  meterNumber: string;
  createdAt?: string;
}

export interface CustomerDeactivationRequest {
  consumerId: string;
  reason: 'SOLD_HOUSE' | 'RELOCATED' | 'HOUSE_DEMOLISHED' | 'OPEN_PLOT' | 'OTHER';
  notes?: string;
}
