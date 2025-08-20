import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../shared/models/product';
import { StatusHistory } from '../../../shared/models/status-history';
import { ProductService } from '../../../core/services/product.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vendor-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './vendor-product-detail.component.html',
  styleUrls: ['./vendor-product-detail.component.scss']
})
export class VendorProductDetailComponent implements OnInit {
  product?: Product;
  statusHistory: StatusHistory[] = [];
  imageUrl: string | null = null;
  imageError: boolean = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getVendorProduct(+id).subscribe({
        next: (product: Product) => {
          this.product = product;
          
          // Handle the image URL properly
          if (product.pictureUrl) {
            console.log('Original pictureUrl:', product.pictureUrl);
            
            // If it's already a full URL, use it as is
            if (product.pictureUrl.startsWith('http://') || product.pictureUrl.startsWith('https://')) {
              this.imageUrl = product.pictureUrl;
            } else {
              // If it's a relative path, construct the full URL
              const baseUrl = 'https://localhost:5001'; // Use the API base URL
              console.log('Base URL:', baseUrl);
              
              // Handle different possible path formats
              let imagePath = product.pictureUrl;
              
              // If it doesn't start with /, add it
              if (!imagePath.startsWith('/')) {
                imagePath = `/${imagePath}`;
              }
              
              this.imageUrl = `${baseUrl}${imagePath}`;
              console.log('Constructed image URL:', this.imageUrl);
            }
          } else {
            // Use a default placeholder image if no product image is available
            this.imageUrl = 'https://via.placeholder.com/400x300?text=No+Image+Available';
            console.log('No pictureUrl found, using placeholder:', this.imageUrl);
          }
          
          // You can also fetch status history here if your API supports it
          this.statusHistory = [
            { status: 'Submitted', date: new Date(), notes: 'Initial submission by vendor.' },
            { status: 'Pending', date: new Date(), notes: 'Product is under review by the admin team.' }
          ];
        },
        error: (error) => {
          console.error('Error loading product:', error);
          // Handle error - could redirect to products list or show error message
        }
      });
    }
  }

  onEditProduct(): void {
    if (this.product) {
      this.router.navigate(['/vendor/products', this.product.id, 'edit']);
    }
  }

  onSubmitForReview(): void {
    if (this.product) {
      // Navigate to the vendor products list
      this.router.navigate(['/vendor/products']);
    }
  }



  onImageError(event: any): void {
    console.error('Image failed to load:', event);
    console.log('Failed image URL:', this.imageUrl);
    this.imageError = true;
    
    // Try alternative URL construction if the first one fails
    if (this.imageUrl && !this.imageUrl.includes('data:') && !this.imageUrl.includes('via.placeholder.com')) {
      // Try different URL patterns
      let alternativeUrl = this.imageUrl;
      
      // Try HTTP instead of HTTPS
      if (alternativeUrl.includes('https://localhost:5001')) {
        alternativeUrl = alternativeUrl.replace('https://localhost:5001', 'http://localhost:5000');
      }
      // Try with /images/ prefix if not present
      else if (!alternativeUrl.includes('/images/')) {
        const urlParts = alternativeUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        alternativeUrl = alternativeUrl.replace(`/${filename}`, `/images/${filename}`);
      }
      // Try without /images/ prefix if present
      else if (alternativeUrl.includes('/images/')) {
        alternativeUrl = alternativeUrl.replace('/images/', '/');
      }
      
      console.log('Trying alternative URL:', alternativeUrl);
      event.target.src = alternativeUrl;
      
      // If this also fails, use placeholder as final fallback
      setTimeout(() => {
        if (event.target.naturalWidth === 0) {
          console.log('Alternative URL also failed, using placeholder...');
          event.target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
        }
      }, 1000);
    } else {
      // If it's already a placeholder or data URL, just show the placeholder
      event.target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
    }
  }

  onImageLoad(event: any): void {
    console.log('Image loaded successfully:', event);
    this.imageError = false;
  }
}
