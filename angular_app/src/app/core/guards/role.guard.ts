import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export const roleGuard = (expectedRole: Role): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const role = authService.userRole;
    if (role === expectedRole) {
      return true;
    }

    if (role === 'ADMIN') {
      router.navigate(['/admin/dashboard']);
    } else if (role === 'STAFF') {
      router.navigate(['/staff/dashboard']);
    } else if (role === 'CUSTOMER') {
      router.navigate(['/customer/dashboard']);
    } else {
      router.navigate(['/login/customer']);
    }
    return false;
  };
};
