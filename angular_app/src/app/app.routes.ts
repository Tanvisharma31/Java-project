import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { StartScreenComponent } from './features/landing/start-screen.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { RegistrationSuccessComponent } from './features/auth/registration-success.component';

import { CustomerDashboardComponent } from './features/customer/customer-dashboard.component';
import { CustomerProfileComponent } from './features/customer/customer-profile.component';
import { CustomerBillsComponent } from './features/customer/customer-bills.component';
import { CustomerPaymentComponent } from './features/customer/customer-payment.component';
import { CustomerPaymentHistoryComponent } from './features/customer/customer-payment-history.component';
import { CustomerComplaintsComponent } from './features/customer/customer-complaints.component';
import { CustomerServiceRequestsComponent } from './features/customer/customer-service-requests.component';
import { CustomerChangePasswordComponent } from './features/customer/customer-change-password.component';
import { CustomerNotificationsComponent } from './features/customer/customer-notifications.component';
import { CustomerFeedbackComponent } from './features/customer/customer-feedback.component';

import { StaffDashboardComponent } from './features/staff/staff-dashboard.component';
import { StaffMeterReadingsComponent } from './features/staff/staff-meter-readings.component';
import { StaffComplaintsComponent } from './features/staff/staff-complaints.component';

import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { AdminCustomersComponent } from './features/admin/admin-customers.component';
import { AdminStaffComponent } from './features/admin/admin-staff.component';
import { AdminTariffsComponent } from './features/admin/admin-tariffs.component';
import { AdminComplaintsComponent } from './features/admin/admin-complaints.component';
import { AdminServiceRequestsComponent } from './features/admin/admin-service-requests.component';
import { AdminReportsComponent } from './features/admin/admin-reports.component';
import { AdminFeedbackComponent } from './features/admin/admin-feedback.component';

import { TestSandboxComponent } from './features/test-mode/test-sandbox.component';

export const routes: Routes = [
  { path: '', component: StartScreenComponent },
  { path: 'login/customer', component: LoginComponent },
  { path: 'login/staff', component: LoginComponent },
  { path: 'login/admin', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'registration-success', component: RegistrationSuccessComponent },

  // Customer Routes
  { path: 'customer/dashboard', component: CustomerDashboardComponent, canActivate: [authGuard, roleGuard('CUSTOMER')] },
  { path: 'customer/profile', component: CustomerProfileComponent, canActivate: [authGuard, roleGuard('CUSTOMER')] },
  { path: 'customer/bills', component: CustomerBillsComponent, canActivate: [authGuard, roleGuard('CUSTOMER')] },
  { path: 'customer/payments', component: CustomerPaymentComponent, canActivate: [authGuard, roleGuard('CUSTOMER')] },
  { path: 'customer/payments/history', component: CustomerPaymentHistoryComponent, canActivate: [authGuard, roleGuard('CUSTOMER')] },
  { path: 'customer/complaints', component: CustomerComplaintsComponent, canActivate: [authGuard, roleGuard('CUSTOMER')] },
  { path: 'customer/service-requests', component: CustomerServiceRequestsComponent, canActivate: [authGuard, roleGuard('CUSTOMER')] },
  { path: 'customer/change-password', component: CustomerChangePasswordComponent, canActivate: [authGuard, roleGuard('CUSTOMER')] },
  { path: 'customer/notifications', component: CustomerNotificationsComponent, canActivate: [authGuard, roleGuard('CUSTOMER')] },
  { path: 'customer/feedback', component: CustomerFeedbackComponent, canActivate: [authGuard, roleGuard('CUSTOMER')] },

  // Staff Routes
  { path: 'staff/dashboard', component: StaffDashboardComponent, canActivate: [authGuard, roleGuard('STAFF')] },
  { path: 'staff/meter-readings', component: StaffMeterReadingsComponent, canActivate: [authGuard, roleGuard('STAFF')] },
  { path: 'staff/complaints', component: StaffComplaintsComponent, canActivate: [authGuard, roleGuard('STAFF')] },

  // Admin Routes
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [authGuard, roleGuard('ADMIN')] },
  { path: 'admin/customers', component: AdminCustomersComponent, canActivate: [authGuard, roleGuard('ADMIN')] },
  { path: 'admin/staff', component: AdminStaffComponent, canActivate: [authGuard, roleGuard('ADMIN')] },
  { path: 'admin/tariffs', component: AdminTariffsComponent, canActivate: [authGuard, roleGuard('ADMIN')] },
  { path: 'admin/complaints', component: AdminComplaintsComponent, canActivate: [authGuard, roleGuard('ADMIN')] },
  { path: 'admin/service-requests', component: AdminServiceRequestsComponent, canActivate: [authGuard, roleGuard('ADMIN')] },
  { path: 'admin/reports', component: AdminReportsComponent, canActivate: [authGuard, roleGuard('ADMIN')] },
  { path: 'admin/feedback', component: AdminFeedbackComponent, canActivate: [authGuard, roleGuard('ADMIN')] },

  // Developer / QA Test Sandbox Mode
  { path: 'test', component: TestSandboxComponent },

  { path: '**', redirectTo: '' }
];
