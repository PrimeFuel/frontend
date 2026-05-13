import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {

  private http = inject(HttpClient);

  private serverUrl = environment.serverBasePath;

  getInventory() {
    return this.http.get<any[]>(`${this.serverUrl}/inventory`);
  }

  getOrders() {
    return this.http.get<any[]>(`${this.serverUrl}/orders`);
  }

}
