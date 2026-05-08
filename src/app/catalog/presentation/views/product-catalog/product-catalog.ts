import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CatalogStore } from '../../../application/catalog.store';

/**
 * @summary Vista de catálogo de productos de combustible.
 * @remarks Muestra tabla de productos con filtros por tipo y estado activo.
 * Permite navegar a formulario de creación y detalle de productos.
 * @author FullTank Platform
 */
@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    RouterModule,
    TranslatePipe,
  ],
  templateUrl: './product-catalog.html',
  styleUrl: './product-catalog.css',
})
export class ProductCatalog implements OnInit {
  protected readonly store = inject(CatalogStore);

  protected readonly displayedColumns: string[] = [
    'name',
    'type',
    'pricePerLiter',
    'unit',
    'status',
    'actions',
  ];

  ngOnInit(): void {
    this.store.loadActiveProducts();
  }

  protected onRefresh(): void {
    this.store.loadActiveProducts();
  }

  protected onShowAll(): void {
    this.store.loadAllProducts();
  }
}
