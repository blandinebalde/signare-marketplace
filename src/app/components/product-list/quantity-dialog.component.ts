import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MarketplaceProduct } from '../../models/product.model';

@Component({
  selector: 'app-quantity-dialog',
  template: `
    <div class="dialog-container">
      <h2 class="dialog-title">Quantité à ajouter</h2>
      <div class="dialog-content">
        <div class="product-info">
          <strong class="product-name">{{ data.product.nom }}</strong>
        </div>
        <form [formGroup]="quantityForm" class="quantity-form">
          <div class="form-group">
            <label>Quantité (en kg) *</label>
            <input type="number" 
                   formControlName="quantity" 
                   min="0.1" 
                   step="0.1" 
                   class="quantity-input"
                   placeholder="0.0">
            <span class="error" *ngIf="quantityForm.get('quantity')?.hasError('required') && quantityForm.get('quantity')?.touched">
              La quantité est requise
            </span>
            <span class="error" *ngIf="quantityForm.get('quantity')?.hasError('min') && quantityForm.get('quantity')?.touched">
              La quantité doit être supérieure à 0
            </span>
            <span class="error" *ngIf="quantityForm.get('quantity')?.hasError('max') && quantityForm.get('quantity')?.touched">
              Stock insuffisant (max: {{ data.maxQuantity }} kg)
            </span>
          </div>
          <div class="price-preview" *ngIf="quantityForm.get('quantity')?.value && quantityForm.get('quantity')?.valid">
            <span class="price-label">Total:</span>
            <span class="price-value">{{ (quantityForm.get('quantity')?.value * data.product.price) | number }} FCFA</span>
          </div>
        </form>
      </div>
      <div class="dialog-actions">
        <button class="btn-cancel" (click)="onCancel()">Annuler</button>
        <button class="btn-confirm" (click)="onConfirm()" [disabled]="quantityForm.invalid">
          Ajouter
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 1rem;
      min-width: 320px;
    }
    
    .dialog-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: var(--color-text);
    }
    
    .dialog-content {
      margin-bottom: 1rem;
    }
    
    .product-info {
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .product-name {
      display: block;
      font-size: 0.9375rem;
      color: var(--color-text);
      margin-bottom: 0.375rem;
    }
    
    .stock-info {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }
    
    .stock-amount {
      font-weight: 600;
      color: var(--color-primary);
    }
    
    .quantity-form {
      margin-top: 0.75rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
    }
    
    .form-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 0.375rem;
    }
    
    .quantity-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.9375rem;
      font-family: inherit;
      transition: all 0.2s ease;
      background: white;
      
      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
      
      &::placeholder {
        color: #9ca3af;
      }
    }
    
    .error {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    
    .price-preview {
      margin-top: 0.75rem;
      padding: 0.5rem;
      background: #f3f4f6;
      border-radius: 0.375rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .price-label {
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .price-value {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-primary);
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid #e5e7eb;
    }
    
    .btn-cancel,
    .btn-confirm {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-cancel {
      background: #f3f4f6;
      color: #374151;
      
      &:hover {
        background: #e5e7eb;
      }
    }
    
    .btn-confirm {
      background: var(--color-primary);
      color: white;
      
      &:hover:not(:disabled) {
        background: #5568d3;
      }
      
      &:disabled {
        background: #d1d5db;
        cursor: not-allowed;
      }
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

