export type BillStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface Bill {
  billId: string;
  consumerId: string;
  customerName?: string;
  billingMonth: string;
  billDate: string;
  dueDate: string;
  overdueDate?: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  energyCharge: number;
  fixedCharge: number;
  dutyTax: number;
  amount: number; // Base bill amount
  lateFee: number;
  totalPayable: number;
  status: BillStatus;
  paymentMethod?: 'CARD' | 'UPI' | 'NET_BANKING' | 'N/A';
  paymentDate?: string;
  isOverdue15Days?: boolean;
  selected?: boolean; // UI Selection helper
}
