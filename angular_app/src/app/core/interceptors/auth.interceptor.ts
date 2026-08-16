import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Get token from localStorage
  const token = localStorage.getItem('vidyutseva_token');

  // Clone request and add authorization header if token exists
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle response
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid - clear auth and redirect to login
        localStorage.removeItem('vidyutseva_token');
        localStorage.removeItem('vidyutseva_user');
        window.location.href = '/login/customer';
      } else if (error.status === 403) {
        // Access denied - show appropriate message
        console.error('Access denied: You do not have permission to access this resource');
      } else if (error.status === 0) {
        // Network error
        console.error('Network error: Unable to connect to server');
      }
      
      // Return user-friendly error message
      let errorMessage = 'An error occurred';
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return throwError(() => errorMessage);
    })
  );
}