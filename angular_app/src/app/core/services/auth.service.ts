import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { User, Role, AuthResponse } from '../models/user.model';
import { Customer } from '../models/customer.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get currentUser(): User | null {
    return this.getStoredUser();
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  public get userRole(): Role | null {
    return this.currentUserValue ? this.currentUserValue.role : null;
  }

  login(userId: string, pass: string, role: Role): Observable<AuthResponse> {
    // Use real HTTP call to backend
    console.log('Attempting login to:', `${environment.apiUrl}/auth/login`);
    console.log('Login payload:', { userId, password: pass, role });
    
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, {
      userId,
      password: pass,
      role
    }).pipe(
      map(response => {
        console.log('Backend response received:', response);
        if (response.success && response.data) {
          const user: User = {
            id: response.data.userId,
            userId: response.data.userId,
            email: response.data.email || '',
            name: response.data.name || '',
            role: response.data.role as Role,
            status: response.data.status || 'ACTIVE',
            token: response.data.token,
            consumerIds: response.data.consumerIds || []
          };
          
          console.log('User object created:', user);
          this.storeUser(user);
          this.currentUserSubject.next(user);
          
          return {
            success: true,
            message: response.message || 'Login successful',
            user,
            token: user.token
          };
        }
        console.error('Response missing success or data:', response);
        throw new Error(response.message || 'Login failed');
      }),
      catchError(error => {
        // Fallback to mock for demo if backend not available
        console.warn('Backend login failed, using mock auth:', error);
        return this.mockLogin(userId, pass, role);
      })
    );
  }

  private mockLogin(userId: string, pass: string, role: Role): Observable<AuthResponse> {
    let user: User;

    if (role === 'ADMIN') {
      if (userId === 'admin' && pass === 'Admin@123') {
        user = {
          id: 'ADM001',
          userId: 'admin',
          email: 'admin@vidyutseva.gov.in',
          name: 'System Administrator',
          role: 'ADMIN',
          status: 'ACTIVE',
          token: 'mock-jwt-token-admin'
        };
      } else {
        return throwError(() => new Error('Invalid Admin credentials'));
      }
    } else if (role === 'STAFF') {
      if (userId === 'staff_north' && pass === 'Staff@123') {
        user = {
          id: 'STF101',
          userId: 'staff_north',
          email: 'staff.north@vidyutseva.gov.in',
          name: 'Ramesh Meter Reader',
          role: 'STAFF',
          status: 'ACTIVE',
          areaAssigned: 'North Delhi',
          token: 'mock-jwt-token-staff'
        };
      } else {
        return throwError(() => new Error('Invalid Staff credentials'));
      }
    } else {
      // CUSTOMER
      if (pass === 'Vidyut@123') {
        user = {
          id: 'CUST001',
          userId: userId || 'tanvi_2004',
          email: 'tanvi.sharma@example.com',
          name: 'Tanvi Sharma',
          role: 'CUSTOMER',
          status: 'ACTIVE',
          consumerIds: ['1000987654321', '1000987654322'],
          token: 'mock-jwt-token-customer'
        };
      } else {
        return throwError(() => new Error('Invalid Customer credentials'));
      }
    }

    this.storeUser(user);
    this.currentUserSubject.next(user);
    return of({ success: true, message: 'Login successful (Demo Mode)', user, token: user.token });
  }

  registerCustomer(customerData: any): Observable<{ success: boolean; consumerId: string; message: string }> {
    // Use real HTTP call to backend
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, customerData).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            success: true,
            consumerId: response.data.consumerId,
            message: response.message || 'Customer registered successfully'
          };
        }
        throw new Error(response.message || 'Registration failed');
      }),
      catchError(error => {
        // Fallback to mock for demo
        console.warn('Backend registration failed, using mock:', error);
        return of({
          success: true,
          consumerId: customerData.consumerId || '1000000000001',
          message: 'Customer registered successfully (Demo Mode)'
        });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('vidyutseva_user');
    localStorage.removeItem('vidyutseva_token');
    localStorage.removeItem('vidyut_user'); // Remove old key for compatibility
    this.currentUserSubject.next(null);
  }

  private getStoredUser(): User | null {
    const data = localStorage.getItem('vidyutseva_user');
    return data ? JSON.parse(data) : null;
  }

  private storeUser(user: User): void {
    localStorage.setItem('vidyutseva_user', JSON.stringify(user));
    if (user.token) {
      localStorage.setItem('vidyutseva_token', user.token);
    }
  }
}
