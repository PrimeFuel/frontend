import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardStore {

  totalFuel = signal(0);

  pendingOrders = signal(0);

  activeOrders = signal<any[]>([]);

}
