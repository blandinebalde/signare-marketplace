import { CartItem } from './cart.model';

export interface MarketplaceOrderRequest {
  entrepotId: number;
  cartItems: CartItem[];
  delivery: boolean;
  clientNom?: string;
  clientPrenom?: string;
  clientTelephone?: string;
  clientEmail?: string;
  clientAdresse?: string;
  clientVille?: string;
  deliveryZone?: string;
  deliveryDescription?: string;
  deliveryPrice?: number;
  totalAmount: number;
}

export interface Order {
  id: number;
  numeroCommande: string;
  dateCommande: string;
  totalAmount: number;
  statut: string;
  delivery: boolean;
  isPaid: boolean;
}

export interface MobileMoneyPaymentRequest {
  orderId: number;
  numeroTelephone: string;
  operateur: string;
  titulaire: string;
  montant: number;
  description?: string;
}

