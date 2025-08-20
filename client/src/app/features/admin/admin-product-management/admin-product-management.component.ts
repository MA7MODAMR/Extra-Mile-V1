import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { Product } from '../../../shared/models/product';
import { AdminService } from '../../../core/services/admin.service';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-admin-product-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-product-management.component.html',
  styleUrl: './admin-product-management.component.scss'
})
export class AdminProductManagementComponent implements OnInit, AfterViewInit {
  private adminService = inject(AdminService);
  private dialogService = inject(DialogService);

  displayedColumns: string[] = ['name', 'brand', 'type', 'price', 'quantityInStock', 'status', 'actions'];
  dataSource = new MatTableDataSource<Product>([]);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProducts(): void {
    this.isLoading = true;
    this.adminService.getProducts(this.pageSize, this.pageIndex + 1).subscribe({
      next: response => {
        if (response.data) {
          this.dataSource.data = response.data;
          this.totalItems = response.count;
        }
        this.isLoading = false;
      },
      error: err => {
        console.error('Error loading products:', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async approveProduct(product: Product): Promise<void> {
    const confirmed = await this.dialogService.confirm(
      'Confirm Approval',
      `Are you sure you want to approve "${product.name}"?`
    );

    if (confirmed) {
      this.adminService.approveProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: err => {
          console.error('Error approving product:', err);
        }
      });
    }
  }

  async rejectProduct(product: Product): Promise<void> {
    const confirmed = await this.dialogService.confirm(
      'Confirm Rejection',
      `Are you sure you want to reject "${product.name}"?`
    );

    if (confirmed) {
      this.adminService.rejectProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: err => {
          console.error('Error rejecting product:', err);
        }
      });
    }
  }

  async suspendProduct(product: Product): Promise<void> {
    const confirmed = await this.dialogService.confirm(
      'Confirm Suspension',
      `Are you sure you want to suspend "${product.name}"?`
    );

    if (confirmed) {
      this.adminService.suspendProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: err => {
          console.error('Error suspending product:', err);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Suspended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }
}
