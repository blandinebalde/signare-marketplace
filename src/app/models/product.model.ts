export interface MarketplaceProduct {
  id: number;
  code: string;
  nom: string;
  description: string;
  prixUnitaire: number;
  imagePath?: string;
  entrepotId: number;
  entrepotNom: string;
  quantityAvailable: number;
  price: number;
}

export interface Entrepot {
  id: number;
  code: string;
  nom: string;
  localisation: string;
  ville: string;
  telephone?: string;
}

