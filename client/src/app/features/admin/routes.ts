import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminProductManagementComponent } from './admin-product-management/admin-product-management.component';
import { AdminOrdersComponent } from './admin-orders/admin-orders.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: AdminDashboardComponent
  },
  {
    path: 'products',
    component: AdminProductManagementComponent
  },
  {
    path: 'orders',
    component: AdminOrdersComponent
  }
];
