import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ReportingStore } from '../../../application/reporting.store';

/**
 * @summary Vista de portafolio completo de clientes.
 * @remarks KPIs calculados en tiempo real desde los clientes del db.
 * Filtro por sector es client-side (store.filterBySector).
 * @author FullTank Platform
 */
@Component({
  selector: 'app-client-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    RouterModule,
    TranslatePipe,
  ],
  templateUrl: './client-portfolio.html',
  styleUrl: './client-portfolio.css',
})
export class ClientPortfolio implements OnInit {
  protected readonly store = inject(ReportingStore);

  private readonly TEMP_PROVIDER_ID = '1';
  private readonly CURRENT_PERIOD = 'Q3_2024';

  protected selectedSector = 'all';

  protected readonly displayedColumns: string[] = [
    'companyName',
    'sector',
    'totalVolume',
    'totalCost',
    'lastActive',
    'status',
  ];

  protected readonly sectors = [
    { value: 'all',          label: 'client-portfolio.all-sectors' },
    { value: 'Transport',    label: 'client-portfolio.sectors.transport' },
    { value: 'Mining',       label: 'client-portfolio.sectors.mining' },
    { value: 'Construction', label: 'client-portfolio.sectors.construction' },
    { value: 'Maritime',     label: 'client-portfolio.sectors.maritime' },
    { value: 'Logistics',    label: 'client-portfolio.sectors.logistics' },
  ];

  ngOnInit(): void {
    this.loadPortfolioData();
  }

  protected loadPortfolioData(): void {
    this.store.loadClientPortfolio(this.TEMP_PROVIDER_ID);
    this.store.loadFulfillmentMetrics(this.TEMP_PROVIDER_ID, this.CURRENT_PERIOD);
  }

  protected onSectorChange(): void {
    // Client-side filter — no HTTP call, no errors
    this.store.filterBySector(this.selectedSector);
  }

  protected onRefresh(): void {
    this.selectedSector = 'all';
    this.loadPortfolioData();
  }

  protected getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  protected getSectorClass(sector: string): string {
    return sector.toLowerCase().replace(/\s+/g, '-');
  }
}
