# Marketplace - Application Angular

Application marketplace permettant aux clients de commander des produits disponibles par entrepôt sans nécessiter de connexion.

## Fonctionnalités

- ✅ Consultation des produits disponibles par entrepôt
- ✅ Ajout de produits au panier
- ✅ Gestion du panier (ajout, modification, suppression)
- ✅ Création de commande sans authentification
- ✅ Choix entre livraison ou récupération sur place
- ✅ Paiement par mobile money (Orange Money, MTN Mobile Money, Moov Money)

## Installation

1. Installer les dépendances:
```bash
npm install
```

2. Configurer l'URL de l'API dans `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/public'
};
```

3. Démarrer l'application:
```bash
npm start
```

L'application sera accessible sur `http://localhost:4200`

## Structure de l'application

```
marketplace/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── product-list/     # Liste des produits par entrepôt
│   │   │   ├── cart/              # Panier d'achat
│   │   │   ├── checkout/          # Formulaire de commande
│   │   │   └── payment/           # Paiement mobile money
│   │   ├── models/                # Modèles TypeScript
│   │   ├── services/              # Services Angular
│   │   └── app.component.*        # Composant principal
│   └── environments/              # Configuration environnement
```

## Endpoints API utilisés

- `GET /api/public/entrepots` - Liste des entrepôts
- `GET /api/public/products/entrepot/{entrepotId}` - Produits par entrepôt
- `POST /api/public/orders` - Créer une commande
- `GET /api/public/orders/{orderId}` - Détails d'une commande
- `POST /api/public/orders/{orderId}/payment/mobile-money` - Paiement mobile money

## Utilisation

1. **Sélectionner un entrepôt**: Choisissez un entrepôt dans la liste déroulante
2. **Ajouter au panier**: Cliquez sur "Ajouter au panier" pour chaque produit
3. **Voir le panier**: Cliquez sur l'icône panier dans la barre de navigation
4. **Passer la commande**: Remplissez le formulaire avec vos informations
5. **Payer**: Choisissez le mode de paiement mobile money et complétez les informations

## Notes

- Le panier est sauvegardé dans le localStorage du navigateur
- Aucune authentification n'est requise
- Les commandes peuvent être livrées ou récupérées sur place
- Le paiement par mobile money est disponible pour Orange Money, MTN Mobile Money et Moov Money

