import { Component } from '@angular/core';

interface TermSection {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent {
  sections: TermSection[] = [
    {
      icon: 'check_circle',
      title: 'Acceptation des conditions',
      description: 'En utilisant notre marketplace, vous acceptez d\'être lié par ces conditions générales. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser notre service.'
    },
    {
      icon: 'shopping_cart',
      title: 'Commandes',
      description: 'Toutes les commandes sont soumises à acceptation de notre part. Nous nous réservons le droit de refuser ou d\'annuler toute commande pour quelque raison que ce soit.'
    },
    {
      icon: 'payment',
      title: 'Prix et paiement',
      description: 'Les prix sont indiqués en FCFA et sont sujets à modification sans préavis. Le paiement peut être effectué par mobile money (Orange Money, Wave) ou à la livraison.'
    },
    {
      icon: 'local_shipping',
      title: 'Livraison',
      description: 'Les frais de livraison sont calculés en fonction de la zone sélectionnée. Les délais de livraison sont indicatifs et peuvent varier selon les circonstances.'
    },
    {
      icon: 'undo',
      title: 'Retours et remboursements',
      description: 'Les retours et remboursements sont soumis à notre politique de retour. Veuillez nous contacter dans les 48 heures suivant la réception de votre commande.'
    },
    {
      icon: 'copyright',
      title: 'Propriété intellectuelle',
      description: 'Tous les contenus de ce site sont protégés par les lois sur la propriété intellectuelle. Toute reproduction non autorisée est strictement interdite.'
    },
    {
      icon: 'security',
      title: 'Limitation de responsabilité',
      description: 'Nous ne serons pas responsables des dommages indirects résultant de l\'utilisation de notre service.'
    },
    {
      icon: 'edit',
      title: 'Modifications',
      description: 'Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entreront en vigueur dès leur publication sur ce site.'
    },
    {
      icon: 'contact_support',
      title: 'Contact',
      description: 'Pour toute question concernant ces conditions, veuillez nous contacter via notre page de contact.'
    }
  ];

  constructor() {}
}

