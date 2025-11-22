import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ContactInfo {
  icon: string;
  title: string;
  details: string[];
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  loading = false;

  contactInfo: ContactInfo[] = [
    {
      icon: 'phone',
      title: 'Téléphone',
      details: ['+221 XX XXX XX XX']
    },
    {
      icon: 'email',
      title: 'Email',
      details: ['contact@marketplace-signare.com']
    },
    {
      icon: 'location_on',
      title: 'Adresse',
      details: ['Dakar, Sénégal']
    },
    {
      icon: 'schedule',
      title: 'Heures d\'ouverture',
      details: ['Lun - Ven: 8h00 - 18h00', 'Sam: 9h00 - 13h00']
    }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.loading = true;
      // Simuler l'envoi du formulaire
      setTimeout(() => {
        this.loading = false;
        this.snackBar.open('Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.', 'Fermer', {
          duration: 5000
        });
        this.contactForm.reset();
      }, 1500);
    } else {
      this.snackBar.open('Veuillez remplir tous les champs correctement', 'Fermer', { duration: 3000 });
    }
  }
}

