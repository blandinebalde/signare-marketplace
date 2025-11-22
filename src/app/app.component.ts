import { Component, HostListener } from '@angular/core';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Marketplace';
  currentYear = new Date().getFullYear();
  mobileMenuOpen = false;

  constructor(public cartService: CartService) {}

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth > 768) {
      this.mobileMenuOpen = false;
    }
  }
}

