import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShopService } from '../../../core/services/shop.service';
import { Product } from '../../../shared/models/product';
import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field'
import { MatInput } from '@angular/material/input';
import { CartService } from '../../../core/services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  imports: [
    MatIcon,
    MatFormField,
    MatDivider,
    MatLabel,
    CurrencyPipe,
    MatButton,
    MatFormField,
    MatInput,
    FormsModule,
    NgIf,
    NgFor,
    NgClass
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  private shopService = inject(ShopService);
  private cartService = inject(CartService);
  private activatedRoute = inject(ActivatedRoute);
  product?: Product;
  quantityInCart = 0;
  quantity = 1;
  selectedColor?: string;
  selectedSize?: string;


  ngOnInit() {
    this.loadProduct();
  }

  loadProduct() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) return;
    this.shopService.getProduct(+id).subscribe({
      next: product => {
        this.product = product;
        if (product.colors && product.colors.length > 0) {
          this.selectedColor = product.colors[0];
        }
        if (product.sizes && product.sizes.length > 0) {
          this.selectedSize = product.sizes[0];
        }
        this.updateQuantityInBasket();
      },
      error: error => console.log(error)
    });
  }

  updateCart() {
    if (!this.product) return;

    if (this.quantity > this.quantityInCart) {
      const itemsToAdd = this.quantity - this.quantityInCart;
      this.cartService.addItemToCart(this.product, itemsToAdd, this.selectedColor, this.selectedSize);
    } else {
      const itemsToRemove = this.quantityInCart - this.quantity;
      this.cartService.removeItemFromCart(this.product.id, itemsToRemove, this.selectedColor, this.selectedSize);
    }
    this.quantityInCart = this.quantity;
  }

  updateQuantityInBasket() {
    const cart = this.cartService.cart();
    if (this.product && cart) {
      const item = cart.items.find(i =>
        i.productId === this.product?.id &&
        i.color === this.selectedColor &&
        i.size === this.selectedSize
      );
      this.quantityInCart = item ? item.quantity : 0;
    } else {
      this.quantityInCart = 0;
    }
    this.quantity = this.quantityInCart > 0 ? this.quantityInCart : 1;
  }

  getButtonText() {
    return this.quantityInCart > 0 ? 'Update Cart' : 'Add to Cart';
  }

  selectColor(color: string) {
    this.selectedColor = color;
    this.updateQuantityInBasket();
  }

  selectSize(size: string) {
    this.selectedSize = size;
    this.updateQuantityInBasket();
  }
}
