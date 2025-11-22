export interface CartItem {
  productId: number;
  productName: string;
  productCode: string;
  entrepotId: number;
  entrepotNom: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imagePath?: string;
}

