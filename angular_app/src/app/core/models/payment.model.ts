export type PaymentMethod = 'CARD' | 'UPI' | 'NET_BANKING';
export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'LIMIT_EXCEEDED';

export interface PaymentRequest {
  billIds: string[];
  consumerId: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  cardDetails?: {
    cardNumber: string; // 16 digits
    cardHolderName: string;
    expiryDate: string; // MM/YY
    cvv: string; // 3 digits
  };
  upiId?: string;
  bankName?: string;
}

export interface PaymentReceipt {
  transactionId: string;
  receiptNumber: string;
  consumerId: string;
  customerName: string;
  billIds: string[];
  billingMonth: string;
  baseAmount: number;
  lateFee: number;
  totalPaid: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  status: PaymentStatus;
  maskedCard?: string;
}
