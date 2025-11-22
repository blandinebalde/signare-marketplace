import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { CartService } from '../../services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MarketplaceOrderRequest } from '../../models/order.model';
import { DeliveryPrice } from '../../models/delivery-price.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: any[] = [];
  total = 0;
  deliveryPrice = 0;
  finalTotal = 0;
  loading = false;
  deliveryZones: DeliveryPrice[] = [];
  loadingZones = false;
  selectedEntrepotId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private marketplaceService: MarketplaceService,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.checkoutForm = this.fb.group({
      delivery: [false],
      clientNom: ['', Validators.required],
      clientPrenom: [''],
      clientTelephone: ['', Validators.required],
      clientEmail: ['', [Validators.email]],
      clientAdresse: [''],
      clientVille: [''],
      deliveryZone: [''], // Zone de livraison
      deliveryDescription: [''] // Description détaillée de l'adresse
    });

    // Afficher les champs d'adresse si livraison
    this.checkoutForm.get('delivery')?.valueChanges.subscribe(delivery => {
      const adresseControl = this.checkoutForm.get('clientAdresse');
      const villeControl = this.checkoutForm.get('clientVille');
      const zoneControl = this.checkoutForm.get('deliveryZone');
      const descriptionControl = this.checkoutForm.get('deliveryDescription');
      
      if (delivery) {
        adresseControl?.setValidators([Validators.required]);
        villeControl?.setValidators([Validators.required]);
        zoneControl?.setValidators([Validators.required]);
        descriptionControl?.setValidators([Validators.required]);
        this.loadDeliveryZones();
      } else {
        adresseControl?.clearValidators();
        villeControl?.clearValidators();
        zoneControl?.clearValidators();
        descriptionControl?.clearValidators();
        this.deliveryZones = [];
        this.deliveryPrice = 0;
        this.updateFinalTotal();
      }
      adresseControl?.updateValueAndValidity();
      villeControl?.updateValueAndValidity();
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
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
      this.updateFinalTotal();
    });
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
      clientAdresse: formValue.clientAdresse,
      clientVille: formValue.clientVille,
      deliveryZone: selectedZone?.zone,
      deliveryDescription: formValue.deliveryDescription,
      deliveryPrice: selectedZone?.price || 0,
      totalAmount: this.finalTotal
    };

    this.loading = true;
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
        const errorMessage = error.error?.message || error.message || 'Erreur lors de la création de la commande';
        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
      }
    });
  }
}
