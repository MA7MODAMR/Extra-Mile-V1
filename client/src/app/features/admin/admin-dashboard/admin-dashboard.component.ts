import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    NgxChartsModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  // Real Stats Data
  totalOrders = 0;
  pendingProducts = 0;
  activeVendors = 0;
  totalRevenue = 0;
  isLoading = true;

  // Mock Chart Data
  salesData = [
    { name: 'January', value: 12000 },
    { name: 'February', value: 15500 },
    { name: 'March', value: 18000 },
    { name: 'April', value: 17000 },
    { name: 'May', value: 21000 },
    { name: 'June', value: 23000 }
  ];

  productStatusData = [
    { name: 'Approved', value: 850 },
    { name: 'Pending', value: 45 },
    { name: 'Rejected', value: 15 },
    { name: 'Suspended', value: 5 }
  ];

  // Mock Recent Activity
  recentActivity = [
    { icon: 'check_circle', message: 'Product "SuperWidget" was approved.', time: '15 minutes ago' },
    { icon: 'person_add', message: 'New vendor "Global Imports" registered.', time: '1 hour ago' },
    { icon: 'shopping_cart', message: 'New order #11234 placed for $250.00.', time: '3 hours ago' },
    { icon: 'warning', message: 'Product "Old Gadget" was suspended.', time: 'Yesterday' },
    { icon: 'thumb_down', message: 'Product "Faulty Device" was rejected.', time: 'Yesterday' }
  ];

  ngOnInit(): void {
    this.loadDashboardData();
    
    // Refresh data every 30 seconds to keep it up to date
    setInterval(() => {
      this.loadDashboardData();
    }, 30000);
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load total orders
    this.adminService.getOrders({ pageSize: 1, pageNumber: 1 } as any).subscribe({
      next: response => {
        this.totalOrders = response.count || 0;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error loading orders count:', err);
        this.isLoading = false;
      }
    });

    // Load pending products count
    this.adminService.getPendingProductsCount().subscribe({
      next: response => {
        this.pendingProducts = response.count || 0;
      },
      error: err => {
        console.error('Error loading pending products count:', err);
      }
    });

    // Mock data for demo purposes
    this.activeVendors = 25;
    this.totalRevenue = 125000;
  }

  navigateToOrders(): void {
    this.router.navigate(['/admin/orders']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/admin/products']);
  }
}
