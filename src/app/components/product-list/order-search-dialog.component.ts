import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-search-dialog',
  templateUrl: './order-search-dialog.component.html',
  styleUrls: ['./order-search-dialog.component.scss']
})
export class OrderSearchDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OrderSearchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { order: any },
    private router: Router,
    private marketplaceService: MarketplaceService,
    private snackBar: MatSnackBar
  ) {}

  getStatusLabel(status: string): string {
    const statusMap: any = {
      'EN_ATTENTE': 'En attente',
      'CONFIRME': 'Confirmé',
      'EN_COURS': 'En cours',
      'LIVRE': 'Livré',
      'ANNULE': 'Annulé'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    return 'status-' + status?.toLowerCase();
  }

  downloadPDF(): void {
    this.marketplaceService.downloadOrderPDF(this.data.order.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `commande_${this.data.order.numeroCommande}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.snackBar.open('PDF téléchargé avec succès', 'Fermer', { duration: 2000 });
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du téléchargement du PDF', 'Fermer', { duration: 3000 });
      }
    });
  }

  payOrder(): void {
    this.dialogRef.close();
    this.router.navigate(['/payment', this.data.order.id]);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
