import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MarketplaceProduct, Entrepot } from '../models/product.model';
import { MarketplaceOrderRequest, Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {

  constructor(private http: HttpClient) { }

  getEntrepots(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/entrepots`);
  }

  getProductsByEntrepot(entrepotId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/products/entrepot/${entrepotId}`);
  }

  getProduct(productId: number, entrepotId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/products/${productId}/entrepot/${entrepotId}`);
  }

  createOrder(orderRequest: MarketplaceOrderRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/orders`, orderRequest).pipe(
      map(response => {
        // Handle different response formats
        if (response.success !== undefined) {
          return response;
        }
        // If response is the order object directly
        if (response.id) {
          return { success: true, data: response };
        }
        // Default success response
        return { success: true, data: response };
      }),
      catchError(error => {
        console.error('Order creation error:', error);
        return throwError(() => error);
      })
    );
  }

  getOrder(orderId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/orders/${orderId}`);
  }

  getOrderByNumber(numeroCommande: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/orders/number/${numeroCommande}`);
  }

  downloadOrderPDF(orderId: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/orders/${orderId}/pdf`, { responseType: 'blob' });
  }

  updateOrder(orderId: number, orderRequest: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/orders/${orderId}`, orderRequest);
  }

  getDeliveryPricesByEntrepot(entrepotId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/delivery-prices/entrepot/${entrepotId}`).pipe(
      map(response => {
        // Handle different response formats
        if (response.success !== undefined) {
          return response;
        }
        // If response is array directly
        if (Array.isArray(response)) {
          return { success: true, data: response };
        }
        // Default success response
        return { success: true, data: response };
      }),
      catchError(error => {
        console.error('Error loading delivery prices:', error);
        return throwError(() => error);
      })
    );
  }
}

