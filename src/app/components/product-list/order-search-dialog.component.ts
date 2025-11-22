import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-search-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon>receipt</mat-icon>
      Commande {{ data.order.numeroCommande }}
    </h2>
    <mat-dialog-content>
      <div class="order-details">
        <div class="detail-row">
          <span class="label">Date:</span>
          <span>{{ data.order.dateCommande | date:'dd/MM/yyyy à HH:mm' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Statut:</span>
          <span [class]="'status-' + data.order.statut?.toLowerCase()">{{ getStatusLabel(data.order.statut) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Montant:</span>
          <span class="amount">{{ data.order.totalAmount | number }} FCFA</span>
        </div>
        <div class="detail-row" *ngIf="data.order.delivery">
          <span class="label">Livraison:</span>
          <span>Oui</span>
        </div>
        <div class="detail-row">
          <span class="label">Payé:</span>
          <span>{{ data.order.isPaid ? 'Oui' : 'Non' }}</span>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="downloadPDF()">
        <mat-icon>picture_as_pdf</mat-icon>
        <span>Télécharger PDF</span>
      </button>
      <button mat-button *ngIf="canModify()" (click)="modifyOrder()" color="primary">
        <mat-icon>edit</mat-icon>
        <span>Modifier</span>
      </button>
      <button mat-button *ngIf="!data.order.isPaid" (click)="payOrder()" color="primary">
        <mat-icon>payment</mat-icon>
        <span>Payer</span>
      </button>
      <button mat-button (click)="onClose()">Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 1.25rem;
    }
    mat-dialog-content {
      padding: 1rem 0;
    }
    .order-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #666;
    }
    .amount {
      font-weight: 700;
      color: #2563EB;
      font-size: 1.1rem;
    }
    .status-en_attente {
      color: #F59E0B;
      font-weight: 600;
    }
    .status-confirme {
      color: #10B981;
      font-weight: 600;
    }
    mat-dialog-actions {
      padding: 1rem 0;
    }
    button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
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

  canModify(): boolean {
    return this.data.order.statut === 'EN_ATTENTE' && !this.data.order.isPaid;
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

  modifyOrder(): void {
    this.dialogRef.close();
    this.router.navigate(['/payment', this.data.order.id]);
  }

  payOrder(): void {
    this.dialogRef.close();
    this.router.navigate(['/payment', this.data.order.id]);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

