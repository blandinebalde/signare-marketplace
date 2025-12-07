import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RateLimitService } from '../services/rate-limit.service';

@Injectable()
export class RateLimitInterceptor implements HttpInterceptor {

  constructor(
    private snackBar: MatSnackBar,
    private rateLimitService: RateLimitService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap((event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
          // Extract rate limit headers from response
          const remaining = event.headers.get('X-Rate-Limit-Remaining');
          const limit = event.headers.get('X-Rate-Limit-Limit');
          const reset = event.headers.get('X-Rate-Limit-Reset');
          const requiresCaptcha = event.headers.get('X-Requires-Captcha');
          const orderAttempts = event.headers.get('X-Order-Attempts');

          if (remaining !== null && limit !== null) {
            this.rateLimitService.updateRateLimitInfo({
              remaining: parseInt(remaining, 10),
              limit: parseInt(limit, 10),
              reset: reset ? parseInt(reset, 10) : null
            });
          }

          // Handle CAPTCHA requirement for order creation
          if (requiresCaptcha === 'true' && orderAttempts) {
            this.rateLimitService.setCaptchaRequired(true, parseInt(orderAttempts, 10));
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 429) {
          // Rate limit exceeded
          let retryAfter = 60; // Default 60 seconds
          
          try {
            const errorBody = error.error;
            if (errorBody && errorBody.retryAfter) {
              retryAfter = errorBody.retryAfter;
            }
          } catch (e) {
            // Use default if parsing fails
          }

          // Show user-friendly error message
          const message = `Trop de requêtes. Veuillez patienter ${retryAfter} seconde${retryAfter > 1 ? 's' : ''} avant de réessayer.`;
          this.snackBar.open(message, 'Fermer', {
            duration: Math.min(retryAfter * 1000, 10000), // Max 10 seconds
            panelClass: ['error-snackbar']
          });

          // Update rate limit service
          this.rateLimitService.setRateLimitExceeded(true, retryAfter);
        }
        return throwError(() => error);
      })
    );
  }
}

