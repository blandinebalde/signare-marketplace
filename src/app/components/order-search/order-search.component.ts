import { Component, OnInit } from '@angular/core';
import { MarketplaceService } from '../../services/marketplace.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OrderSearchDialogComponent } from '../product-list/order-search-dialog.component';

@Component({
  selector: 'app-order-search',
  templateUrl: './order-search.component.html',
  styleUrls: ['./order-search.component.scss']
})
export class OrderSearchComponent implements OnInit {
  searchOrderNumber: string = '';
  loading = false;

  constructor(
    private marketplaceService: MarketplaceService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {}

  searchOrder(): void {
    if (!this.searchOrderNumber || this.searchOrderNumber.trim() === '') {
      this.snackBar.open('Veuillez entrer un numéro de commande', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.marketplaceService.getOrderByNumber(this.searchOrderNumber.trim()).subscribe({
      next: (response) => {
        this.loading = false;
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
        this.loading = false;
        this.snackBar.open('Commande non trouvée', 'Fermer', { duration: 3000 });
      }
    });
  }
}

