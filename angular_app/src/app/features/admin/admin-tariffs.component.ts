import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { TariffService } from '../../core/services/tariff.service';
import { TariffConfig } from '../../core/models/tariff.model';

@Component({
  selector: 'app-admin-tariffs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="dashboard-layout">
        <app-sidebar role="ADMIN"></app-sidebar>
        <main class="main-content">
          <div class="card-header">
            <div>
              <h1>Tariff Rates & Slab Configuration</h1>
              <p>Configure slab-based unit charges, fixed monthly charges, and electricity duty taxes.</p>
            </div>
          </div>

          <div class="alert alert-success" *ngIf="successMessage">
            <span>{{ successMessage }}</span>
          </div>

          <div class="grid-2">
            <div class="card" *ngFor="let t of tariffs">
              <div class="card-header">
                <h3 class="card-title">⚡ {{ t.connectionType }} TARIFF SLABS</h3>
                <button (click)="openEditModal(t)" class="btn btn-sm btn-secondary">Edit Rates</button>
              </div>

              <div class="tariff-details">
                <div class="tariff-row">
                  <span>Fixed Monthly Charge (per kW):</span>
                  <strong>₹{{ t.fixedChargePerKw }}/kW</strong>
                </div>
                <div class="tariff-row">
                  <span>Slab 1 Rate (0 - 100 Units):</span>
                  <strong class="text-primary">₹{{ t.slab1Rate }}/kWh</strong>
                </div>
                <div class="tariff-row">
                  <span>Slab 2 Rate (101 - 300 Units):</span>
                  <strong class="text-primary">₹{{ t.slab2Rate }}/kWh</strong>
                </div>
                <div class="tariff-row">
                  <span>Slab 3 Rate (301+ Units):</span>
                  <strong class="text-primary">₹{{ t.slab3Rate }}/kWh</strong>
                </div>
                <div class="tariff-row">
                  <span>Electricity Duty Tax:</span>
                  <strong>{{ t.electricityDutyPct * 100 }}%</strong>
                </div>
                <div class="tariff-row">
                  <span>Effective From:</span>
                  <strong>{{ t.effectiveFrom }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit Tariff Modal -->
          <div class="modal-overlay" *ngIf="selectedTariff">
            <div class="modal-content">
              <div class="card-header">
                <h3 class="card-title">Edit {{ selectedTariff.connectionType }} Tariff Rates</h3>
                <button (click)="closeModal()" class="btn btn-sm btn-secondary">✕</button>
              </div>

              <form [formGroup]="tariffForm" (ngSubmit)="onSaveTariff()">
                <div class="form-group">
                  <label class="form-label">Fixed Charge per kW (₹) <span class="required">*</span></label>
                  <input type="number" step="0.5" formControlName="fixedChargePerKw" class="form-control" />
                </div>

                <div class="grid-3">
                  <div class="form-group">
                    <label class="form-label">Slab 1 (0-100 Units) <span class="required">*</span></label>
                    <input type="number" step="0.1" formControlName="slab1Rate" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Slab 2 (101-300) <span class="required">*</span></label>
                    <input type="number" step="0.1" formControlName="slab2Rate" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Slab 3 (301+) <span class="required">*</span></label>
                    <input type="number" step="0.1" formControlName="slab3Rate" class="form-control" />
                  </div>
                </div>

                <div class="modal-actions">
                  <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
                  <button type="submit" [disabled]="tariffForm.invalid || isSaving" class="btn btn-primary">
                    Save New Rates
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .tariff-details { display: flex; flex-direction: column; gap: 12px; }
    .tariff-row { display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 8px; }
    .text-primary { color: var(--primary); font-weight: 700; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
  `]
})
export class AdminTariffsComponent implements OnInit {
  tariffs: TariffConfig[] = [];
  selectedTariff: TariffConfig | null = null;
  tariffForm!: FormGroup;
  isSaving = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private tariffService: TariffService
  ) {}

  ngOnInit(): void {
    this.tariffForm = this.fb.group({
      fixedChargePerKw: [50.0, Validators.required],
      slab1Rate: [4.5, Validators.required],
      slab2Rate: [6.5, Validators.required],
      slab3Rate: [8.5, Validators.required]
    });

    this.loadTariffs();
  }

  loadTariffs(): void {
    this.tariffService.getTariffs().subscribe(list => this.tariffs = list);
  }

  openEditModal(t: TariffConfig): void {
    this.selectedTariff = t;
    this.tariffForm.patchValue({
      fixedChargePerKw: t.fixedChargePerKw,
      slab1Rate: t.slab1Rate,
      slab2Rate: t.slab2Rate,
      slab3Rate: t.slab3Rate
    });
  }

  closeModal(): void {
    this.selectedTariff = null;
  }

  onSaveTariff(): void {
    if (this.tariffForm.invalid || !this.selectedTariff) return;

    this.isSaving = true;
    this.tariffService.updateTariff(this.selectedTariff.id, this.tariffForm.value).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.closeModal();
        this.successMessage = `Tariff rates for ${updated.connectionType} updated successfully!`;
        this.loadTariffs();
        setTimeout(() => this.successMessage = '', 4000);
      }
    });
  }
}
