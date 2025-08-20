import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrderParams } from '../../shared/models/orderParams';
import { Order } from '../../shared/models/order';
import { Product } from '../../shared/models/product';
import { Pagination } from '../../shared/models/pagination';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getOrders(orderParams: OrderParams) {
    let params = new HttpParams();
    if (orderParams.filter && orderParams.filter !== 'All') {
      params = params.append('status', orderParams.filter);
    } 
    params = params.append('pageSize', orderParams.pageSize);
    params = params.append('pageIndex', orderParams.pageNumber);
    return this.http.get<Pagination<Order>>(this.baseUrl + 'admin/orders', {params});
  }

  getOrder(id: number) {
    return this.http.get<Order>(this.baseUrl + 'admin/orders/' + id);
  }

  refundOrder(id: number) {
    return this.http.post<Order>(this.baseUrl + 'admin/orders/refund/' + id, {});
  }

  // Product Management Methods
  getProducts(pageSize: number = 10, pageIndex: number = 1, status?: string) {
    let params = new HttpParams();
    params = params.append('pageSize', pageSize);
    params = params.append('pageIndex', pageIndex);
    if (status) {
      params = params.append('status', status);
    }
    return this.http.get<Pagination<Product>>(this.baseUrl + 'admin/products', {params});
  }

  getPendingProductsCount() {
    return this.getProducts(1000, 1, 'Pending'); // Get all pending products to count them
  }

  approveProduct(id: number) {
    return this.http.post<Product>(this.baseUrl + 'admin/products/' + id + '/approve', {});
  }

  rejectProduct(id: number) {
    return this.http.post<Product>(this.baseUrl + 'admin/products/' + id + '/reject', {});
  }

  suspendProduct(id: number) {
    return this.http.post<Product>(this.baseUrl + 'admin/products/' + id + '/suspend', {});
  }
}
