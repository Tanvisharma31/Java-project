import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { PaymentReceipt } from '../../core/models/payment.model';

@Component({
  selector: 'app-customer-payment-history',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="dashboard-layout">
        <app-sidebar role="CUSTOMER"></app-sidebar>
        <main class="main-content">
          <div class="card-header">
            <div>
              <h1>Payment History & Digital Receipts</h1>
              <p>Audit past payment transactions and download official payment receipts.</p>
            </div>
          </div>

          <div class="card">
            <div class="table-responsive">
              <table class="table" *ngIf="history.length > 0; else noHistory">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Receipt No</th>
                    <th>Date</th>
                    <th>Amount Paid</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Receipt Download</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of history">
                    <td><strong>{{ item.transactionId }}</strong></td>
                    <td>{{ item.receiptNumber }}</td>
                    <td>{{ item.paymentDate }}</td>
                    <td><strong class="text-success">₹{{ item.totalPaid | number:'1.2-2' }}</strong></td>
                    <td>{{ item.paymentMethod }} {{ item.maskedCard ? '(' + item.maskedCard + ')' : '' }}</td>
                    <td><span class="badge badge-success">{{ item.status }}</span></td>
                    <td>
                      <button (click)="downloadReceipt(item)" class="btn btn-sm btn-secondary">
                        📥 Download Receipt
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <ng-template #noHistory>
                <div class="empty-state">
                  <p>No past payment transactions recorded.</p>
                </div>
              </ng-template>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .text-success { color: var(--success); font-weight: 700; }
    .empty-state { padding: 40px; text-align: center; color: var(--text-secondary); }
  `]
})
export class CustomerPaymentHistoryComponent implements OnInit {
  history: PaymentReceipt[] = [];
  consumerId = '1000987654321';

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.consumerId = user?.consumerIds?.[0] || '1000987654321';

    this.paymentService.getPaymentHistory(this.consumerId).subscribe(list => {
      this.history = list;
    });
  }

  downloadReceipt(item: PaymentReceipt): void {
    this.paymentService.downloadReceipt(item);
  }
}
