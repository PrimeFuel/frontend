import { Injectable, signal, computed } from '@angular/core';
import { retry } from 'rxjs';
import { ReportingApi } from '../infrastructure/reporting-api';
import { ClientPortfolio } from '../domain/model/client-portfolio.entity';
import { FulfillmentMetrics } from '../domain/model/fulfillment-metrics.entity';
import { SectorDistribution } from '../domain/model/sector-distribution.entity';

/**
 * @summary Store de estado para el BC Reporting.
 * @remarks KPIs (revenue, totalClients, activeOrders, sectorDistribution)
 * se calculan en tiempo real desde _allClients para que siempre reflejen
 * los datos reales del db.json. El filtro por sector es client-side.
 * @author FullTank Platform
 */
@Injectable({ providedIn: 'root' })
export class ReportingStore {
  // ── State ────────────────────────────────────────────────────────────────
  private readonly _allClients = signal<ClientPortfolio[]>([]);       // todos, sin filtro
  private readonly _clientList = signal<ClientPortfolio[]>([]);       // con filtro aplicado
  private readonly _fulfillmentMetrics = signal<FulfillmentMetrics | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string>('');
  private readonly _successMsg = signal<string>('');

  // ── Public Readonly Signals ──────────────────────────────────────────────
  public readonly clientList = this._clientList.asReadonly();
  public readonly fulfillmentMetrics = this._fulfillmentMetrics.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly successMsg = this._successMsg.asReadonly();

  // ── Computed from real client data ───────────────────────────────────────

  /** Suma de totalCost de todos los clientes */
  public readonly totalRevenue = computed(() =>
    this._allClients().reduce((sum, c) => sum + (c.totalCost ?? 0), 0)
  );

  /** Número real de clientes en db */
  public readonly totalClients = computed(() =>
    this._allClients().length
  );

  /** Suma de activeOrders de todos los clientes */
  public readonly totalActiveOrders = computed(() =>
    this._allClients().reduce((sum, c) => sum + (c.activeOrders ?? 0), 0)
  );

  /** Tasa de crecimiento fija (dato externo, no calculable desde clientes) */
  public readonly revenueGrowthRate = computed(() => 12.4);

  /** salesMetrics-compatible para vistas que lo usan */
  public readonly salesMetrics = computed(() => {
    const clients = this._allClients();
    if (clients.length === 0) return null;
    return {
      totalRevenue: this.totalRevenue(),
      totalClients: this.totalClients(),
      activeOrders: this.totalActiveOrders(),
      revenueGrowthRate: this.revenueGrowthRate(),
    };
  });

  public readonly avgFulfillmentRate = computed(() =>
    this._fulfillmentMetrics()?.avgFulfillmentRate ?? 0
  );

  /**
   * Distribución por sector calculada desde los clientes reales.
   * Usa totalCost para el porcentaje de revenue por sector.
   */
  public readonly sectorDistribution = computed((): SectorDistribution[] => {
    const clients = this._allClients();
    if (clients.length === 0) return [];

    const totalCost = clients.reduce((sum, c) => sum + (c.totalCost ?? 0), 0);
    const grouped = new Map<string, { volume: number; cost: number }>();

    clients.forEach((c) => {
      const existing = grouped.get(c.sector) ?? { volume: 0, cost: 0 };
      grouped.set(c.sector, {
        volume: existing.volume + c.totalVolume,
        cost: existing.cost + (c.totalCost ?? 0),
      });
    });

    return Array.from(grouped.entries())
      .sort((a, b) => b[1].cost - a[1].cost)
      .map(([sector, data], index) => new SectorDistribution({
        id: `computed-${index}`,
        providerId: '1',
        sector,
        volumePercentage: totalCost > 0 ? Math.round((data.cost / totalCost) * 100) : 0,
        totalVolume: data.volume,
        period: 'LIVE',
        createdAt: new Date().toISOString(),
      }));
  });

  public readonly activeClients = computed(() =>
    this._allClients().filter((c) => c.status === 'ACTIVE')
  );

  constructor(private api: ReportingApi) {}

  // ── Client Portfolio Operations ──────────────────────────────────────────

  /**
   * Carga todos los clientes. Guarda en _allClients (para KPIs)
   * y en _clientList (para la tabla, sin filtro).
   */
  loadClientPortfolio(providerId: string): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .getClientPortfolio(providerId)
      .pipe(retry(2))
      .subscribe({
        next: (clients) => {
          this._allClients.set(clients);
          this._clientList.set(clients);
          this._isLoading.set(false);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load client portfolio');
          this._isLoading.set(false);
        },
      });
  }

  /**
   * Filtra la tabla client-side desde _allClients.
   * No hace llamada HTTP — instantáneo y sin errores de routing.
   */
  filterBySector(sector: string): void {
    const all = this._allClients();
    if (sector === 'all') {
      this._clientList.set(all);
    } else {
      this._clientList.set(all.filter((c) => c.sector === sector));
    }
  }

  // ── Metrics Operations ───────────────────────────────────────────────────

  loadFulfillmentMetrics(providerId: string, period: string): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .getFulfillmentMetrics(providerId, period)
      .pipe(retry(2))
      .subscribe({
        next: (metrics) => {
          this._fulfillmentMetrics.set(metrics);
          this._isLoading.set(false);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load fulfillment metrics');
          this._isLoading.set(false);
        },
      });
  }

  // kept for API compatibility — now a no-op since we compute from clients
  loadSalesMetrics(_providerId: string, _period: string): void {}
  loadSectorDistribution(_providerId: string, _period: string): void {}
  loadAllMetrics(providerId: string, period: string): void {
    this.loadFulfillmentMetrics(providerId, period);
  }

  // ── Utility ──────────────────────────────────────────────────────────────
  clearMessages(): void {
    this._error.set('');
    this._successMsg.set('');
  }
}
