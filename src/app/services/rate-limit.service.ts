import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class RateLimitService {
  private rateLimitInfo$ = new BehaviorSubject<RateLimitInfo | null>(null);
  private rateLimitExceeded$ = new BehaviorSubject<{ exceeded: boolean; retryAfter: number }>({
    exceeded: false,
    retryAfter: 0
  });
  private captchaRequired$ = new BehaviorSubject<{ required: boolean; attempts: number }>({
    required: false,
    attempts: 0
  });

  constructor() {}

  /**
   * Update rate limit information
   */
  updateRateLimitInfo(info: RateLimitInfo): void {
    this.rateLimitInfo$.next(info);
  }

  /**
   * Get rate limit information as observable
   */
  getRateLimitInfo(): Observable<RateLimitInfo | null> {
    return this.rateLimitInfo$.asObservable();
  }

  /**
   * Get current rate limit information
   */
  getCurrentRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo$.value;
  }

  /**
   * Set rate limit exceeded status
   */
  setRateLimitExceeded(exceeded: boolean, retryAfter: number = 0): void {
    this.rateLimitExceeded$.next({ exceeded, retryAfter });
  }

  /**
   * Get rate limit exceeded status as observable
   */
  getRateLimitExceeded(): Observable<{ exceeded: boolean; retryAfter: number }> {
    return this.rateLimitExceeded$.asObservable();
  }

  /**
   * Check if rate limit is currently exceeded
   */
  isRateLimitExceeded(): boolean {
    return this.rateLimitExceeded$.value.exceeded;
  }

  /**
   * Set CAPTCHA requirement status
   */
  setCaptchaRequired(required: boolean, attempts: number = 0): void {
    this.captchaRequired$.next({ required, attempts });
  }

  /**
   * Get CAPTCHA requirement status as observable
   */
  getCaptchaRequired(): Observable<{ required: boolean; attempts: number }> {
    return this.captchaRequired$.asObservable();
  }

  /**
   * Check if CAPTCHA is currently required
   */
  isCaptchaRequired(): boolean {
    return this.captchaRequired$.value.required;
  }

  /**
   * Get current CAPTCHA attempts
   */
  getCaptchaAttempts(): number {
    return this.captchaRequired$.value.attempts;
  }

  /**
   * Reset all rate limit states
   */
  reset(): void {
    this.rateLimitInfo$.next(null);
    this.rateLimitExceeded$.next({ exceeded: false, retryAfter: 0 });
    this.captchaRequired$.next({ required: false, attempts: 0 });
  }
}

