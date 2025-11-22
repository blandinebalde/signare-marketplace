import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { CartService } from '../../services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MarketplaceProduct, Entrepot } from '../../models/product.model';
import { CartItem } from '../../models/cart.model';
import { QuantityDialogComponent } from './quantity-dialog.component';
import { environment, imageUrl } from '../../../environments/environment';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  entrepots: Entrepot[] = [];
  selectedEntrepotId: number | null = null;
  products: MarketplaceProduct[] = [];
  filteredProducts: MarketplaceProduct[] = [];
  loading = false;
  searchProduct: string = '';

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
          this.filterProducts();
        }
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du chargement des produits', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  filterProducts(): void {
    if (!this.searchProduct || this.searchProduct.trim() === '') {
      this.filteredProducts = this.products;
    } else {
      const searchTerm = this.searchProduct.toLowerCase().trim();
      this.filteredProducts = this.products.filter(product =>
        product.nom.toLowerCase().includes(searchTerm) ||
        product.code.toLowerCase().includes(searchTerm)
      );
    }
  }

  onSearchChange(): void {
    this.filterProducts();
  }

  onEntrepotChange(): void {
    this.loadProducts();
  }

  openQuantityDialog(product: MarketplaceProduct): void {
    // Vérification avant d'ouvrir le dialog
    if (!product || product.quantityAvailable === 0) {
      this.snackBar.open('Ce produit est en rupture de stock', 'Fermer', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(QuantityDialogComponent, {
      width: '380px',
      data: { 
        product: product,
        maxQuantity: product.quantityAvailable 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.quantity) {
        const quantity = parseFloat(result.quantity);
        
        // Vérifications avant d'ajouter
        if (isNaN(quantity) || quantity <= 0) {
          this.snackBar.open('La quantité doit être supérieure à 0', 'Fermer', { duration: 3000 });
          return;
        }
        
        if (quantity > product.quantityAvailable) {
          this.snackBar.open(`Stock insuffisant. Disponible: ${product.quantityAvailable} kg`, 'Fermer', { duration: 3000 });
          return;
        }
        
        // Vérifier que le produit est toujours disponible
        if (product.quantityAvailable === 0) {
          this.snackBar.open('Ce produit n\'est plus disponible', 'Fermer', { duration: 3000 });
          return;
        }
        
        this.addToCart(product, quantity);
      }
    });
  }

  addToCart(product: MarketplaceProduct, quantity: number = 1): void {
    // Vérifications finales avant d'ajouter au panier
    if (!product) {
      this.snackBar.open('Erreur: produit invalide', 'Fermer', { duration: 3000 });
      return;
    }

    const qty = parseFloat(quantity.toString());
    
    if (isNaN(qty) || qty <= 0) {
      this.snackBar.open('La quantité doit être supérieure à 0', 'Fermer', { duration: 3000 });
      return;
    }

    if (qty > product.quantityAvailable) {
      this.snackBar.open(`Stock insuffisant. Disponible: ${product.quantityAvailable} kg`, 'Fermer', { duration: 3000 });
      return;
    }

    if (product.quantityAvailable === 0) {
      this.snackBar.open('Ce produit est en rupture de stock', 'Fermer', { duration: 3000 });
      return;
    }

    const cartItem: CartItem = {
      productId: product.id,
      productName: product.nom,
      productCode: product.code,
      entrepotId: product.entrepotId,
      entrepotNom: product.entrepotNom,
      quantity: qty,
      unitPrice: product.price,
      subtotal: product.price * qty,
      imagePath: product.imagePath
    };

    console.log(cartItem);

    this.cartService.addToCart(cartItem);
    this.snackBar.open(`${qty} kg ajouté(s) au panier`, 'Fermer', { duration: 2000 });
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      console.log('No imagePath provided');
      return '';
    }

    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const fullUrl = `${imageUrl}/${cleanPath}`;

    console.log('Image URL constructed:', {
      originalPath: imagePath,
      cleanPath: cleanPath,
      fullUrl: fullUrl,
      apiUrl: environment.apiUrl
    });

    return fullUrl;
  }

  onImageError(event: any): void {
    // Hide the broken image and show placeholder
    event.target.style.display = 'none';
    
    // Show a placeholder icon
    const parent = event.target.parentElement;
    if (parent && !parent.querySelector('mat-icon')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'product-image-placeholder';
      placeholder.innerHTML = '<mat-icon>image</mat-icon>';
      parent.appendChild(placeholder);
    }
  }

  hasValidImage(product: MarketplaceProduct): boolean {
    return !!(product.imagePath && product.imagePath.trim() !== '');
  }

  onImageLoad(event: any): void {
    // Image loaded successfully
    console.log('Image loaded successfully:', event.target.src);
  }
}
