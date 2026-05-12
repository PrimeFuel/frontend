import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { InventoryStore } from '../../../application/inventory.store';

/**
 * @summary Vista de inventario de productos de combustible.
 * @remarks Muestra stock disponible y reservado por proveedor.
 * Permite filtrar por proveedor y actualizar cantidades.
 * @author FullTank Platform
 */
@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    TranslatePipe,
  ],
  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.css',
})
export class InventoryList implements OnInit {
  protected readonly store = inject(InventoryStore);

  // TODO: Reemplazar con providerId real de IAM cuando se implemente
  private readonly TEMP_PROVIDER_ID = '1';

  protected readonly displayedColumns: string[] = [
    'productId',
    'availableQuantity',
    'reservedQuantity',
    'unit',
    'lastUpdated',
    'actions',
  ];

  ngOnInit(): void {
    this.store.loadInventoryByProvider(this.TEMP_PROVIDER_ID);
  }

  protected onRefresh(): void {
    this.store.loadInventoryByProvider(this.TEMP_PROVIDER_ID);
  }

  protected getTotalStock(item: any): number {
    return item.availableQuantity + item.reservedQuantity;
  }

  protected getStockStatus(available: number): string {
    if (available < 1000) return 'low';
    if (available < 5000) return 'medium';
    return 'high';
  }
}
