import { Component, inject, Input } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-item',
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink
  ],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss'
})
export class ProductItemComponent {
 @Input() product?: Product;
 cartService = inject(CartService);


 getProductRating(): number {
   if (!this.product) return 0;
   // Use product ID to consistently generate the same rating
   const ratingVariation = (this.product.id % 6) * 0.25; // 0, 0.25, 0.5, 0.75, 1.0, 1.25
   return 3.5 + ratingVariation; // Rating between 3.5-4.75
 }

}
