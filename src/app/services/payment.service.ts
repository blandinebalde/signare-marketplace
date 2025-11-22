import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MobileMoneyPaymentRequest } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) { }

  payWithMobileMoney(orderId: number, paymentRequest: MobileMoneyPaymentRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/orders/${orderId}/payment/mobile-money`, paymentRequest);
  }

  payWithWave(orderId: number, paymentRequest: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/orders/${orderId}/payment/wave`, paymentRequest);
  }

  payOnDelivery(orderId: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/orders/${orderId}/payment/delivery`, {});
  }
}
