import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { MarketplaceService } from '../../services/marketplace.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  orderId: number | null = null;
  order: Order | null = null;
  paymentForm: FormGroup;
  loading = false;
  paymentSuccess = false;
  pdfUrl: string | null = null;

  paymentMethods = [
    { value: 'LIVRAISON', label: 'Paiement à la livraison', icon: 'local_shipping' },
    { value: 'WAVE', label: 'Wave', icon: 'account_balance_wallet' },
    { value: 'ORANGE_MONEY', label: 'Orange Money', icon: 'phone_android' }
  ];

  operators = [
    { value: 'ORANGE_MONEY', label: 'Orange Money' },
    { value: 'MTN_MOBILE_MONEY', label: 'MTN Mobile Money' },
    { value: 'MOOV_MONEY', label: 'Moov Money' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private marketplaceService: MarketplaceService,
    private snackBar: MatSnackBar
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: ['', Validators.required],
      numeroTelephone: [''],
      operateur: [''],
      titulaire: [''],
      description: ['']
    });

    // Ajouter validations conditionnelles
    this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      const phoneControl = this.paymentForm.get('numeroTelephone');
      const operatorControl = this.paymentForm.get('operateur');
      const titulaireControl = this.paymentForm.get('titulaire');
      
      if (method === 'ORANGE_MONEY' || method === 'WAVE') {
        phoneControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{8,10}$/)]);
        operatorControl?.setValidators([Validators.required]);
        titulaireControl?.setValidators([Validators.required]);
      } else {
        phoneControl?.clearValidators();
        operatorControl?.clearValidators();
        titulaireControl?.clearValidators();
      }
      phoneControl?.updateValueAndValidity();
      operatorControl?.updateValueAndValidity();
      titulaireControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.orderId = +this.route.snapshot.paramMap.get('orderId')!;
    if (this.orderId) {
      this.loadOrder();
    }
  }

  loadOrder(): void {
    if (!this.orderId) return;
    
    this.marketplaceService.getOrder(this.orderId).subscribe({
      next: (response) => {
        if (response.success) {
          this.order = response.data;
          if (this.order && this.order.isPaid) {
            this.paymentSuccess = true;
            this.downloadPDF();
          }
          // Si pas de livraison, mettre paiement à la livraison par défaut
          if (this.order && !this.order.delivery) {
            this.paymentForm.patchValue({ paymentMethod: 'LIVRAISON' });
          }
        }
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du chargement de la commande', 'Fermer', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid || !this.orderId || !this.order) {
      return;
    }

    const formValue = this.paymentForm.value;
    const paymentMethod = formValue.paymentMethod;

    this.loading = true;

    if (paymentMethod === 'LIVRAISON') {
      // Paiement à la livraison - mettre la commande en attente
      this.paymentService.payOnDelivery(this.orderId).subscribe({
        next: (response) => {
          this.handlePaymentSuccess(response);
        },
        error: (error) => {
          this.handlePaymentError(error);
        }
      });
    } else if (paymentMethod === 'WAVE') {
      // Paiement Wave
      const paymentRequest = {
        orderId: this.orderId,
        paymentMethod: 'WAVE',
        numeroTelephone: formValue.numeroTelephone,
        titulaire: formValue.titulaire,
        montant: this.order.totalAmount,
        description: formValue.description || `Paiement Wave commande ${this.order.numeroCommande}`
      };
      this.paymentService.payWithWave(this.orderId, paymentRequest).subscribe({
        next: (response) => {
          this.handlePaymentSuccess(response);
        },
        error: (error) => {
          this.handlePaymentError(error);
        }
      });
    } else if (paymentMethod === 'ORANGE_MONEY') {
      // Paiement Orange Money
      const paymentRequest = {
        orderId: this.orderId,
        numeroTelephone: formValue.numeroTelephone,
        operateur: formValue.operateur || 'ORANGE_MONEY',
        titulaire: formValue.titulaire,
        montant: this.order.totalAmount,
        description: formValue.description || `Paiement Orange Money commande ${this.order.numeroCommande}`
      };
      this.paymentService.payWithMobileMoney(this.orderId, paymentRequest).subscribe({
        next: (response) => {
          this.handlePaymentSuccess(response);
        },
        error: (error) => {
          this.handlePaymentError(error);
        }
      });
    }
  }

  handlePaymentSuccess(response: any): void {
    this.loading = false;
    if (response.success) {
      this.paymentSuccess = true;
      this.snackBar.open('Commande confirmée avec succès!', 'Fermer', { duration: 5000 });
      this.downloadPDF();
    } else {
      this.snackBar.open(response.message || 'Erreur lors du paiement', 'Fermer', { duration: 3000 });
    }
  }

  handlePaymentError(error: any): void {
    this.loading = false;
    const errorMessage = error.error?.message || error.message || 'Erreur lors du paiement';
    this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
  }

  downloadPDF(): void {
    if (!this.orderId) return;
    
    this.marketplaceService.downloadOrderPDF(this.orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        this.pdfUrl = url;
        const link = document.createElement('a');
        link.href = url;
        link.download = `commande_${this.order?.numeroCommande || this.orderId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du PDF:', error);
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
