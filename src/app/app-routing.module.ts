import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { PaymentComponent } from './components/payment/payment.component';
import { OrderSearchComponent } from './components/order-search/order-search.component';
import { TermsComponent } from './components/terms/terms.component';
import { ContactComponent } from './components/contact/contact.component';

const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'payment/:orderId', component: PaymentComponent },
  { path: 'order-search', component: OrderSearchComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

