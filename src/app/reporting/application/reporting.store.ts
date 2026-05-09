import { Injectable, signal, computed } from '@angular/core';
import { retry } from 'rxjs';
import { ReportingApi } from '../infrastructure/reporting-api';
import { ClientPortfolio } from '../domain/model/client-portfolio.entity';
import { SalesMetrics } from '../domain/model/sales-metrics.entity';
import { FulfillmentMetrics } from '../domain/model/fulfillment-metrics.entity';
import { SectorDistribution } from '../domain/model/sector-distribution.entity';

/**
 * @summary Store de estado para el BC Reporting.
 * @remarks Gestiona estado de portafolio de clientes, métricas de ventas,
 * métricas de cumplimiento y distribución sectorial usando signals.
 * @author FullTank Platform
 */
@Injectable({ providedIn: 'root' })
export class ReportingStore {
  // ── State ────────────────────────────────────────────────────────────────
  private readonly _clientList = signal<ClientPortfolio[]>([]);
  private readonly _salesMetrics = signal<SalesMetrics | null>(null);
  private readonly _fulfillmentMetrics = signal<FulfillmentMetrics | null>(null);
  private readonly _sectorDistribution = signal<SectorDistribution[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string>('');
  private readonly _successMsg = signal<string>('');

  // ── Public Readonly Signals ──────────────────────────────────────────────
  public readonly clientList = this._clientList.asReadonly();
  public readonly salesMetrics = this._salesMetrics.asReadonly();
  public readonly fulfillmentMetrics = this._fulfillmentMetrics.asReadonly();
  public readonly sectorDistribution = this._sectorDistribution.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly successMsg = this._successMsg.asReadonly();

  // ── Computed ─────────────────────────────────────────────────────────────
  public readonly activeClients = computed(() =>
    this._clientList().filter((client) => client.status === 'ACTIVE'),
  );

  public readonly clientsBySector = computed(() => {
    const sectors = new Map<string, ClientPortfolio[]>();
    this._clientList().forEach((client) => {
      const existing = sectors.get(client.sector) || [];
      sectors.set(client.sector, [...existing, client]);
    });
    return sectors;
  });

  public readonly totalRevenue = computed(() => {
    return this._salesMetrics()?.totalRevenue || 0;
  });

  public readonly avgFulfillmentRate = computed(() => {
    return this._fulfillmentMetrics()?.avgFulfillmentRate || 0;
  });

  constructor(private api: ReportingApi) {}

  // ── Client Portfolio Operations ──────────────────────────────────────────
  loadClientPortfolio(providerId: string): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .getClientPortfolio(providerId)
      .pipe(retry(2))
      .subscribe({
        next: (clients) => {
          setTimeout(() => {
            this._clientList.set(clients);
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load client portfolio');
          this._isLoading.set(false);
        },
      });
  }

  loadClientsBySector(providerId: string, sector: string): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .getClientsBySector(providerId, sector)
      .pipe(retry(2))
      .subscribe({
        next: (clients) => {
          setTimeout(() => {
            this._clientList.set(clients);
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || `Failed to load clients for sector ${sector}`);
          this._isLoading.set(false);
        },
      });
  }

  // ── Metrics Operations ───────────────────────────────────────────────────
  loadSalesMetrics(providerId: string, period: string): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .getSalesMetrics(providerId, period)
      .pipe(retry(2))
      .subscribe({
        next: (metrics) => {
          setTimeout(() => {
            this._salesMetrics.set(metrics);
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load sales metrics');
          this._isLoading.set(false);
        },
      });
  }

  loadFulfillmentMetrics(providerId: string, period: string): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .getFulfillmentMetrics(providerId, period)
      .pipe(retry(2))
      .subscribe({
        next: (metrics) => {
          setTimeout(() => {
            this._fulfillmentMetrics.set(metrics);
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load fulfillment metrics');
          this._isLoading.set(false);
        },
      });
  }

  loadSectorDistribution(providerId: string, period: string): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .getSectorDistribution(providerId, period)
      .pipe(retry(2))
      .subscribe({
        next: (distribution) => {
          setTimeout(() => {
            this._sectorDistribution.set(distribution);
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load sector distribution');
          this._isLoading.set(false);
        },
      });
  }

  // ── Comprehensive Load ───────────────────────────────────────────────────
  loadAllMetrics(providerId: string, period: string): void {
    this.loadSalesMetrics(providerId, period);
    this.loadFulfillmentMetrics(providerId, period);
    this.loadSectorDistribution(providerId, period);
  }

  // ── Utility ──────────────────────────────────────────────────────────────
  clearMessages(): void {
    this._error.set('');
    this._successMsg.set('');
  }
}
