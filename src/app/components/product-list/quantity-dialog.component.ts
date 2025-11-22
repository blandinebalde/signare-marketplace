import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MarketplaceProduct } from '../../models/product.model';

@Component({
  selector: 'app-quantity-dialog',
  template: `
    <h2 mat-dialog-title>Quantité à ajouter</h2>
    <mat-dialog-content>
      <p><strong>{{ data.product.nom }}</strong></p>
      <p class="stock-info">Stock disponible: {{ data.maxQuantity }} kg</p>
      <form [formGroup]="quantityForm">
        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>Quantité (en kg)</mat-label>
          <input matInput type="number" formControlName="quantity" min="0.1" step="0.1" required>
          <mat-icon matSuffix>scale</mat-icon>
          <mat-error *ngIf="quantityForm.get('quantity')?.hasError('required')">
            La quantité est requise
          </mat-error>
          <mat-error *ngIf="quantityForm.get('quantity')?.hasError('min')">
            La quantité doit être supérieure à 0
          </mat-error>
          <mat-error *ngIf="quantityForm.get('quantity')?.hasError('max')">
            Stock insuffisant (max: {{ data.maxQuantity }} kg)
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onConfirm()" [disabled]="quantityForm.invalid">
        Ajouter
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      margin-bottom: 12px;
      font-size: 1.25rem;
    }
    mat-dialog-content {
      padding: 12px 0;
      min-width: 300px;
    }
    p {
      margin-bottom: 8px;
      font-size: 0.95rem;
    }
    .stock-info {
      color: #666;
      font-size: 0.85rem;
      margin-bottom: 16px;
    }
    mat-form-field {
      margin-top: 8px;
    }
    mat-dialog-actions {
      padding: 12px 0;
    }
  `]
})
export class QuantityDialogComponent {
  quantityForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<QuantityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: MarketplaceProduct; maxQuantity: number }
  ) {
    this.quantityForm = this.fb.group({
      quantity: [1, [
        Validators.required,
        Validators.min(0.1),
        Validators.max(data.maxQuantity)
      ]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.quantityForm.valid) {
      this.dialogRef.close({ quantity: this.quantityForm.value.quantity });
    }
  }
}

