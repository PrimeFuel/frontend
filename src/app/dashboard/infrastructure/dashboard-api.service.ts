import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {

  private http = inject(HttpClient);

  private serverUrl = 'http://localhost:3000';

  getInventory() {
    return this.http.get<any[]>(`${this.serverUrl}/inventory`);
  }

  getOrders() {
    return this.http.get<any[]>(`${this.serverUrl}/orders`);
  }

}
