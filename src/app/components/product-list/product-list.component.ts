import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { CartService } from '../../services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MarketplaceProduct, Entrepot } from '../../models/product.model';
import { CartItem } from '../../models/cart.model';
import { QuantityDialogComponent } from './quantity-dialog.component';
import { OrderSearchDialogComponent } from './order-search-dialog.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  entrepots: Entrepot[] = [];
  selectedEntrepotId: number | null = null;
  products: MarketplaceProduct[] = [];
  loading = false;
  searchOrderNumber: string = '';

  constructor(
    private marketplaceService: MarketplaceService,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEntrepots();
  }

  loadEntrepots(): void {
    this.marketplaceService.getEntrepots().subscribe({
      next: (response) => {
        if (response.success) {
          this.entrepots = response.data;
          if (this.entrepots.length > 0) {
            this.selectedEntrepotId = this.entrepots[0].id;
            this.loadProducts();
          }
        }
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du chargement des entrepôts', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadProducts(): void {
    if (!this.selectedEntrepotId) return;
    
    this.loading = true;
    this.marketplaceService.getProductsByEntrepot(this.selectedEntrepotId).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du chargement des produits', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onEntrepotChange(): void {
    this.loadProducts();
  }

  openQuantityDialog(product: MarketplaceProduct): void {
    const dialogRef = this.dialog.open(QuantityDialogComponent, {
      width: '400px',
      data: { 
        product: product,
        maxQuantity: product.quantityAvailable 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.quantity > 0) {
        this.addToCart(product, result.quantity);
      }
    });
  }

  addToCart(product: MarketplaceProduct, quantity: number = 1): void {
    if (quantity > product.quantityAvailable) {
      this.snackBar.open('Stock insuffisant', 'Fermer', { duration: 3000 });
      return;
    }

    if (quantity <= 0) {
      this.snackBar.open('La quantité doit être supérieure à 0', 'Fermer', { duration: 3000 });
      return;
    }

    const cartItem: CartItem = {
      productId: product.id,
      productName: product.nom,
      productCode: product.code,
      entrepotId: product.entrepotId,
      entrepotNom: product.entrepotNom,
      quantity: quantity,
      unitPrice: product.price,
      subtotal: product.price * quantity,
      imagePath: product.imagePath
    };

    this.cartService.addToCart(cartItem);
    this.snackBar.open(`${quantity} kg ajouté(s) au panier`, 'Fermer', { duration: 2000 });
  }

  searchOrder(): void {
    if (!this.searchOrderNumber || this.searchOrderNumber.trim() === '') {
      this.snackBar.open('Veuillez entrer un numéro de commande', 'Fermer', { duration: 3000 });
      return;
    }

    this.marketplaceService.getOrderByNumber(this.searchOrderNumber.trim()).subscribe({
      next: (response) => {
        if (response.success) {
          const order = response.data;
          this.dialog.open(OrderSearchDialogComponent, {
            width: '600px',
            data: { order: order }
          });
        } else {
          this.snackBar.open('Commande non trouvée', 'Fermer', { duration: 3000 });
        }
      },
      error: (error) => {
        this.snackBar.open('Commande non trouvée', 'Fermer', { duration: 3000 });
      }
    });
  }
}
