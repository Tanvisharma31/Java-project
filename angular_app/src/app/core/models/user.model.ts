export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id?: string;
  userId: string;
  email: string;
  role: Role;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';
  token?: string;
  areaAssigned?: string; // For STAFF role
  consumerIds?: string[]; // For CUSTOMER role (1 user can have multiple consumer IDs)
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}
