import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { PaymentService } from '../../core/services/payment.service';
import { PaymentMethod, PaymentReceipt } from '../../core/models/payment.model';

@Component({
  selector: 'app-customer-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="dashboard-layout">
        <app-sidebar role="CUSTOMER"></app-sidebar>
        <main class="main-content">
          <div class="card-header">
            <div>
              <h1>Payment Gateway & Bill Settlement</h1>
              <p>Verify exact payable bill amount, select payment method, and complete settlement.</p>
            </div>
          </div>

          <div class="alert alert-danger" *ngIf="errorMessage">
            <span>⚠️ {{ errorMessage }}</span>
          </div>

          <!-- Payment Success Screen view -->
          <div class="card payment-success-card" *ngIf="completedReceipt">
            <div class="success-header">
              <span class="success-icon">✅</span>
              <h2>Payment Processed Successfully!</h2>
              <p>Transaction ID: <strong>{{ completedReceipt.transactionId }}</strong></p>
            </div>

            <div class="receipt-summary">
              <div class="summary-row">
                <span>Receipt Number:</span>
                <strong>{{ completedReceipt.receiptNumber }}</strong>
              </div>
              <div class="summary-row">
                <span>Consumer ID:</span>
                <strong>{{ completedReceipt.consumerId }}</strong>
              </div>
              <div class="summary-row">
                <span>Total Amount Paid:</span>
                <strong class="text-success">₹{{ completedReceipt.totalPaid | number:'1.2-2' }}</strong>
              </div>
              <div class="summary-row">
                <span>Payment Method:</span>
                <strong>{{ completedReceipt.paymentMethod }} {{ completedReceipt.maskedCard ? '(' + completedReceipt.maskedCard + ')' : '' }}</strong>
              </div>
              <div class="summary-row">
                <span>Payment Date:</span>
                <strong>{{ completedReceipt.paymentDate }}</strong>
              </div>
            </div>

            <div class="receipt-actions">
              <button (click)="downloadReceipt()" class="btn btn-primary btn-lg">📥 Download Digital Receipt (TXT)</button>
              <a routerLink="/customer/payments/history" class="btn btn-secondary btn-lg">View Payment History</a>
              <a routerLink="/customer/dashboard" class="btn btn-secondary btn-lg">Back to Dashboard</a>
            </div>
          </div>

          <!-- Form View (If payment not yet completed) -->
          <div class="grid-2" *ngIf="!completedReceipt">
            <!-- Payment Summary Card -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">💳 Payment Summary</h3>
              </div>

              <div class="summary-details">
                <div class="detail-item">
                  <span>Consumer ID:</span>
                  <strong>{{ consumerId }}</strong>
                </div>
                <div class="detail-item">
                  <span>Selected Bill ID(s):</span>
                  <strong>{{ billIds.join(', ') }}</strong>
                </div>
                <div class="detail-item total-payable-item">
                  <span>Calculated Payable Amount:</span>
                  <h2 class="text-primary">₹{{ expectedTotal | number:'1.2-2' }}</h2>
                </div>
              </div>
            </div>

            <!-- Payment Input & Method Card -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">🔐 Enter Exact Amount & Payment Details</h3>
              </div>

              <form [formGroup]="paymentForm" (ngSubmit)="onProcessPayment()">
                <!-- Exact Amount Verification Field -->
                <div class="form-group">
                  <label class="form-label">Enter Exact Payable Amount (₹) <span class="required">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    formControlName="enteredAmount"
                    class="form-control"
                    [class.is-invalid]="amountMismatchError || (f['enteredAmount'].invalid && f['enteredAmount'].touched)"
                    placeholder="e.g. {{ expectedTotal }}"
                  />
                  <div class="invalid-feedback" *ngIf="amountMismatchError">
                    Entered amount does not match the payable bill amount (₹{{ expectedTotal }}).
                  </div>
                </div>

                <!-- Payment Method Selection -->
                <div class="form-group">
                  <label class="form-label">Select Payment Gateway / Method <span class="required">*</span></label>
                  <select formControlName="paymentMethod" (change)="onMethodChange()" class="form-select">
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="NET_BANKING">Net Banking</option>
                  </select>
                </div>

                <!-- Card Details Fields -->
                <div *ngIf="f['paymentMethod'].value === 'CARD'" formGroupName="cardGroup" class="method-fields">
                  <div class="form-group">
                    <label class="form-label">Card Number (16 Digits) <span class="required">*</span></label>
                    <input type="text" formControlName="cardNumber" class="form-control" placeholder="1234 5678 9101 1121" maxlength="16" />
                  </div>
                  <div class="grid-2">
                    <div class="form-group">
                      <label class="form-label">Expiry (MM/YY) <span class="required">*</span></label>
                      <input type="text" formControlName="expiryDate" class="form-control" placeholder="12/28" maxlength="5" />
                    </div>
                    <div class="form-group">
                      <label class="form-label">CVV (3 Digits) <span class="required">*</span></label>
                      <input type="password" formControlName="cvv" class="form-control" placeholder="123" maxlength="3" />
                    </div>
                  </div>
                </div>

                <!-- UPI Fields -->
                <div *ngIf="f['paymentMethod'].value === 'UPI'" class="method-fields">
                  <div class="form-group">
                    <label class="form-label">UPI ID <span class="required">*</span></label>
                    <input type="text" formControlName="upiId" class="form-control" placeholder="username&#64;upi" />
                    <small class="form-text">Must contain valid '&#64;' symbol.</small>
                  </div>
                </div>

                <!-- Net Banking Fields -->
                <div *ngIf="f['paymentMethod'].value === 'NET_BANKING'" class="method-fields">
                  <div class="form-group">
                    <label class="form-label">Select Preferred Bank <span class="required">*</span></label>
                    <select formControlName="bankName" class="form-select">
                      <option value="SBI">State Bank of India (SBI)</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="AXIS">Axis Bank</option>
                      <option value="PNB">Punjab National Bank</option>
                    </select>
                  </div>
                </div>

                <button type="submit" [disabled]="paymentForm.invalid || isProcessing" class="btn btn-success btn-block btn-lg">
                  {{ isProcessing ? 'Processing Transaction...' : 'Pay ₹' + expectedTotal + ' Now' }}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .summary-details { display: flex; flex-direction: column; gap: 14px; }
    .detail-item { display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 8px; }
    .total-payable-item { font-size: 16px; align-items: center; }
    .text-primary { color: var(--primary); font-weight: 800; }
    .method-fields { background: var(--surface-alt); padding: 16px; border-radius: var(--radius-md); margin-bottom: 16px; }

    .payment-success-card { text-align: center; padding: 40px; }
    .success-header { margin-bottom: 24px; }
    .success-icon { font-size: 64px; }
    .receipt-summary { max-width: 480px; margin: 0 auto 24px auto; background: var(--surface-alt); padding: 20px; border-radius: var(--radius-md); text-align: left; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .text-success { color: var(--success); font-size: 18px; }
    .receipt-actions { display: flex; justify-content: center; gap: 12px; }
  `]
})
export class CustomerPaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  billIds: string[] = [];
  consumerId = '1000987654321';
  expectedTotal = 0;
  amountMismatchError = false;
  errorMessage = '';
  isProcessing = false;
  completedReceipt: PaymentReceipt | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['billIds']) {
        this.billIds = params['billIds'].split(',');
      }
      this.expectedTotal = parseFloat(params['totalAmount'] || '1811.25');
      this.consumerId = params['consumerId'] || '1000987654321';
    });

    this.paymentForm = this.fb.group({
      enteredAmount: [this.expectedTotal, [Validators.required]],
      paymentMethod: ['CARD', Validators.required],
      cardGroup: this.fb.group({
        cardNumber: ['4111111111111111', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
        expiryDate: ['12/28', Validators.required],
        cvv: ['123', [Validators.required, Validators.pattern(/^[0-9]{3}$/)]]
      }),
      upiId: ['tanvi@upi'],
      bankName: ['SBI']
    });
  }

  get f() { return this.paymentForm.controls; }

  onMethodChange(): void {
    // dynamically adjust validators if needed
  }

  onProcessPayment(): void {
    const entered = parseFloat(this.paymentForm.value.enteredAmount);
    if (Math.abs(entered - this.expectedTotal) > 0.01) {
      this.amountMismatchError = true;
      return;
    }
    this.amountMismatchError = false;
    this.errorMessage = '';
    this.isProcessing = true;

    const method: PaymentMethod = this.paymentForm.value.paymentMethod;
    const req = {
      billIds: this.billIds,
      consumerId: this.consumerId,
      totalAmount: this.expectedTotal,
      paymentMethod: method,
      cardDetails: method === 'CARD' ? this.paymentForm.value.cardGroup : undefined,
      upiId: method === 'UPI' ? this.paymentForm.value.upiId : undefined,
      bankName: method === 'NET_BANKING' ? this.paymentForm.value.bankName : undefined
    };

    this.paymentService.processPayment(req).subscribe({
      next: (receipt) => {
        this.isProcessing = false;
        this.completedReceipt = receipt;
      },
      error: (err) => {
        this.isProcessing = false;
        this.errorMessage = err.message || 'Payment processing failed.';
      }
    });
  }

  downloadReceipt(): void {
    if (this.completedReceipt) {
      this.paymentService.downloadReceipt(this.completedReceipt);
    }
  }
}
