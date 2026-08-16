import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { PaymentRequest, PaymentReceipt, PaymentMethod } from '../models/payment.model';
import { BillService } from './bill.service';
import { TestModeService } from './test-mode.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private mockReceipts: PaymentReceipt[] = [
    {
      transactionId: 'TXN-987654321',
      receiptNumber: 'RCP-2026-0001',
      consumerId: '1000987654321',
      customerName: 'Tanvi Sharma',
      billIds: ['BILL-2026-0601'],
      billingMonth: 'June 2026',
      baseAmount: 1811.25,
      lateFee: 0.0,
      totalPaid: 1811.25,
      paymentMethod: 'CARD',
      paymentDate: '2026-06-10',
      status: 'SUCCESS',
      maskedCard: '**** **** **** 4321'
    }
  ];

  constructor(
    private billService: BillService,
    private testModeService: TestModeService
  ) {}

  processPayment(req: PaymentRequest): Observable<PaymentReceipt> {
    // Check test mode toggles first
    if (this.testModeService.currentSettings.simulateCardLimitError && req.paymentMethod === 'CARD') {
      return throwError(() => new Error('Credit/Debit Card Limit Exceeded! Transaction failed. Please use another card or payment method.'));
    }

    const txnId = 'TXN-' + Math.floor(100000000 + Math.random() * 900000000).toString();
    const rcpNum = 'RCP-2026-' + Math.floor(1000 + Math.random() * 9000).toString();
    const today = new Date().toISOString().split('T')[0];

    let maskedCard: string | undefined;
    if (req.paymentMethod === 'CARD' && req.cardDetails) {
      const num = req.cardDetails.cardNumber;
      maskedCard = `**** **** **** ${num.slice(-4)}`;
    }

    const receipt: PaymentReceipt = {
      transactionId: txnId,
      receiptNumber: rcpNum,
      consumerId: req.consumerId,
      customerName: 'Tanvi Sharma',
      billIds: req.billIds,
      billingMonth: 'August 2026',
      baseAmount: req.totalAmount,
      lateFee: 0,
      totalPaid: req.totalAmount,
      paymentMethod: req.paymentMethod,
      paymentDate: today,
      status: 'SUCCESS',
      maskedCard
    };

    // Mark bills as paid in billService
    this.billService.markBillsAsPaid(req.billIds, req.paymentMethod, today);
    this.mockReceipts.unshift(receipt);

    return of(receipt);
  }

  getPaymentHistory(consumerId: string): Observable<PaymentReceipt[]> {
    const list = this.mockReceipts.filter(r => r.consumerId === consumerId);
    return of(list);
  }

  downloadReceipt(receipt: PaymentReceipt): void {
    const text = `
=====================================================
         VIDYUTSEVA ELECTRICITY BILL RECEIPT
=====================================================
Receipt Number : ${receipt.receiptNumber}
Transaction ID : ${receipt.transactionId}
Date & Time    : ${receipt.paymentDate}
Consumer ID    : ${receipt.consumerId}
Customer Name  : ${receipt.customerName}
-----------------------------------------------------
Bill(s) Paid   : ${receipt.billIds.join(', ')}
Payment Method : ${receipt.paymentMethod} ${receipt.maskedCard ? '(' + receipt.maskedCard + ')' : ''}
Base Amount    : ₹${receipt.baseAmount.toFixed(2)}
Late Fee       : ₹${receipt.lateFee.toFixed(2)}
Total Paid     : ₹${receipt.totalPaid.toFixed(2)}
-----------------------------------------------------
Status         : ${receipt.status}
=====================================================
Thank you for using VidyutSeva Digital Services.
This is a computer-generated digital receipt.
=====================================================
    `;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VidyutSeva_Receipt_${receipt.receiptNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
