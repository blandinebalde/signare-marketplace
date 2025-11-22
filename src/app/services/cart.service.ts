import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const stored = localStorage.getItem('marketplace_cart');
    if (stored) {
      this.cartItems = JSON.parse(stored);
      this.cartSubject.next(this.cartItems);
    }
  }

  private saveCartToStorage(): void {
    localStorage.setItem('marketplace_cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }

  addToCart(item: CartItem): void {
    const existingItem = this.cartItems.find(
      i => i.productId === item.productId && i.entrepotId === item.entrepotId
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.subtotal = existingItem.quantity * existingItem.unitPrice;
    } else {
      this.cartItems.push({ ...item });
    }
    this.saveCartToStorage();
  }

  removeFromCart(productId: number, entrepotId: number): void {
    this.cartItems = this.cartItems.filter(
      item => !(item.productId === productId && item.entrepotId === entrepotId)
    );
    this.saveCartToStorage();
  }

  updateQuantity(productId: number, entrepotId: number, quantity: number): void {
    const item = this.cartItems.find(
      i => i.productId === productId && i.entrepotId === entrepotId
    );
    if (item) {
      item.quantity = quantity;
      item.subtotal = item.quantity * item.unitPrice;
      this.saveCartToStorage();
    }
  }

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  getCartItemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCartToStorage();
  }

  isEmpty(): boolean {
    return this.cartItems.length === 0;
  }
}

