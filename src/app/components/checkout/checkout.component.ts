import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { CartService } from '../../services/cart.service';
import { RateLimitService } from '../../services/rate-limit.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MarketplaceOrderRequest } from '../../models/order.model';
import { DeliveryPrice } from '../../models/delivery-price.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm: FormGroup;
  cartItems: any[] = [];
  total = 0;
  deliveryPrice = 0;
  finalTotal = 0;
  loading = false;
  deliveryZones: DeliveryPrice[] = [];
  loadingZones = false;
  selectedEntrepotId: number | null = null;
  captchaRequired = false;
  captchaAttempts = 0;
  captchaToken: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private marketplaceService: MarketplaceService,
    private cartService: CartService,
    private rateLimitService: RateLimitService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.checkoutForm = this.fb.group({
      delivery: [false],
      clientNom: ['', Validators.required],
      clientPrenom: [''],
      clientTelephone: ['', Validators.required],
      clientEmail: ['', [Validators.email]],
      deliveryZone: [''], // Zone de livraison sélectionnée
      deliveryDescription: [''] // Description détaillée pour faciliter la localisation
    });

    // Afficher les champs de livraison si livraison
    this.checkoutForm.get('delivery')?.valueChanges.subscribe(delivery => {
      const zoneControl = this.checkoutForm.get('deliveryZone');
      const descriptionControl = this.checkoutForm.get('deliveryDescription');
      
      if (delivery) {
        zoneControl?.setValidators([Validators.required]);
        descriptionControl?.setValidators([Validators.required]);
        this.loadDeliveryZones();
      } else {
        zoneControl?.clearValidators();
        descriptionControl?.clearValidators();
        this.deliveryZones = [];
        this.deliveryPrice = 0;
        this.updateFinalTotal();
      }
      zoneControl?.updateValueAndValidity();
      descriptionControl?.updateValueAndValidity();
    });

    // Calculer le prix de livraison quand la zone change
    this.checkoutForm.get('deliveryZone')?.valueChanges.subscribe(zoneId => {
      if (zoneId) {
        const selectedZone = this.deliveryZones.find(z => z.id === zoneId);
        if (selectedZone) {
          this.deliveryPrice = selectedZone.price;
          this.updateFinalTotal();
        }
      } else {
        this.deliveryPrice = 0;
        this.updateFinalTotal();
      }
    });
  }

  ngOnInit(): void {
    this.cartItems = this.cartService.getCartItems();
    this.total = this.cartService.getTotal();
    this.finalTotal = this.total;
    
    if (this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    // Déterminer l'entrepôt (tous les items doivent être du même entrepôt)
    const entrepotIds = [...new Set(this.cartItems.map(item => item.entrepotId))];
    if (entrepotIds.length === 1) {
      this.selectedEntrepotId = entrepotIds[0];
    }
    
    // Subscribe to cart changes
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
      this.updateFinalTotal();
    });

    // Subscribe to CAPTCHA requirement
    this.rateLimitService.getCaptchaRequired()
      .pipe(takeUntil(this.destroy$))
      .subscribe(captcha => {
        this.captchaRequired = captcha.required;
        this.captchaAttempts = captcha.attempts;
        if (this.captchaRequired) {
          this.snackBar.open(
            `Pour votre sécurité, veuillez compléter le CAPTCHA (${this.captchaAttempts} tentatives)`,
            'Fermer',
            { duration: 5000 }
          );
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDeliveryZones(): void {
    if (!this.selectedEntrepotId) {
      return;
    }

    this.loadingZones = true;
    this.marketplaceService.getDeliveryPricesByEntrepot(this.selectedEntrepotId).subscribe({
      next: (response) => {
        this.loadingZones = false;
        if (response.success) {
          this.deliveryZones = response.data || [];
          if (this.deliveryZones.length === 0) {
            this.snackBar.open('Aucune zone de livraison disponible pour cet entrepôt', 'Fermer', { duration: 3000 });
          }
        } else {
          this.deliveryZones = [];
        }
      },
      error: (error) => {
        this.loadingZones = false;
        console.error('Error loading delivery zones:', error);
        this.deliveryZones = [];
        this.snackBar.open('Erreur lors du chargement des zones de livraison', 'Fermer', { duration: 3000 });
      }
    });
  }

  updateFinalTotal(): void {
    this.finalTotal = this.total + this.deliveryPrice;
  }

  getSelectedZoneDescription(): string {
    const zoneId = this.checkoutForm.get('deliveryZone')?.value;
    if (zoneId) {
      const selectedZone = this.deliveryZones.find(z => z.id === zoneId);
      return selectedZone?.description || '';
    }
    return '';
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', { duration: 3000 });
      return;
    }

    // Check if CAPTCHA is required but not provided
    if (this.captchaRequired && !this.captchaToken) {
      this.snackBar.open('Veuillez compléter le CAPTCHA pour continuer', 'Fermer', { duration: 3000 });
      return;
    }

    const formValue = this.checkoutForm.value;
    
    // Vérifier que tous les items sont du même entrepôt
    const entrepotIds = [...new Set(this.cartItems.map(item => item.entrepotId))];
    if (entrepotIds.length > 1) {
      this.snackBar.open('Tous les produits doivent être du même entrepôt', 'Fermer', { duration: 3000 });
      return;
    }

    // Si livraison, vérifier que la zone est sélectionnée
    if (formValue.delivery && !formValue.deliveryZone) {
      this.snackBar.open('Veuillez sélectionner une zone de livraison', 'Fermer', { duration: 3000 });
      return;
    }

    const selectedZone = formValue.deliveryZone ? 
      this.deliveryZones.find(z => z.id === formValue.deliveryZone) : null;

    const orderRequest: MarketplaceOrderRequest = {
      entrepotId: this.cartItems[0].entrepotId,
      cartItems: this.cartItems,
      delivery: formValue.delivery,
      clientNom: formValue.clientNom,
      clientPrenom: formValue.clientPrenom,
      clientTelephone: formValue.clientTelephone,
      clientEmail: formValue.clientEmail,
      clientAdresse: undefined, // Plus utilisé, remplacé par la zone
      clientVille: undefined, // Plus utilisé, remplacé par la zone
      deliveryZone: selectedZone?.zone, // Zone sélectionnée = adresse de livraison
      deliveryDescription: formValue.deliveryDescription, // Description détaillée
      deliveryPrice: selectedZone?.price || 0,
      totalAmount: this.finalTotal
    };

    this.loading = true;
    
    // Add CAPTCHA token if required
    if (this.captchaToken) {
      // TODO: Add captchaToken to orderRequest when CAPTCHA service is integrated
      // orderRequest.captchaToken = this.captchaToken;
    }

    this.marketplaceService.createOrder(orderRequest).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Order response:', response);
        
        // Handle different response formats
        let orderId;
        if (response.success && response.data) {
          orderId = response.data.id || response.data;
        } else if (response.id) {
          orderId = response.id;
        } else if (response) {
          orderId = response;
        }
        
        if (orderId) {
          this.cartService.clearCart();
          this.router.navigate(['/payment', orderId]);
        } else {
          console.error('No order ID in response:', response);
          this.snackBar.open(response.message || 'Erreur: Aucun ID de commande reçu', 'Fermer', { duration: 3000 });
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Order creation error:', error);
        
        // Handle rate limit errors (429) - already handled by interceptor, but show specific message
        if (error.status === 429) {
          // Message already shown by interceptor
          return;
        }
        
        const errorMessage = error.error?.message || error.message || 'Erreur lors de la création de la commande';
        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
      }
    });
  }

  /**
   * Handle CAPTCHA verification
   * TODO: Integrate with CAPTCHA service (e.g., Google reCAPTCHA)
   */
  onCaptchaVerified(token: string): void {
    this.captchaToken = token;
  }
}
