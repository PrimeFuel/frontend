import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';

import { ClientPortfolio } from '../domain/model/client-portfolio.entity';
import { SalesMetrics } from '../domain/model/sales-metrics.entity';
import { FulfillmentMetrics } from '../domain/model/fulfillment-metrics.entity';
import { SectorDistribution } from '../domain/model/sector-distribution.entity';

import { ClientPortfolioApiEndpoint } from './client-portfolio-api-endpoint';
import { MetricsApiEndpoint } from './metrics-api-endpoint';

/**
 * @summary API gateway para el bounded context Reporting.
 * @remarks Agrega ClientPortfolioApiEndpoint y MetricsApiEndpoint,
 * exponiendo operaciones de reportes y análisis al application layer.
 * @author FullTank Platform
 */
@Injectable({ providedIn: 'root' })
export class ReportingApi extends BaseApi {
  private readonly _clientPortfolioEndpoint: ClientPortfolioApiEndpoint;
  private readonly _metricsEndpoint: MetricsApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this._clientPortfolioEndpoint = new ClientPortfolioApiEndpoint(http);
    this._metricsEndpoint = new MetricsApiEndpoint(http);
  }

  // ── Client Portfolio ─────────────────────────────────────────────────────
  getClientPortfolio(providerId: string): Observable<ClientPortfolio[]> {
    return this._clientPortfolioEndpoint.getClientPortfolio(providerId);
  }

  getClientsBySector(providerId: string, sector: string): Observable<ClientPortfolio[]> {
    return this._clientPortfolioEndpoint.getClientsBySector(providerId, sector);
  }

  // ── Metrics ──────────────────────────────────────────────────────────────
  getSalesMetrics(providerId: string, period: string): Observable<SalesMetrics | null> {
    return this._metricsEndpoint.getSalesMetrics(providerId, period);
  }

  getFulfillmentMetrics(providerId: string, period: string): Observable<FulfillmentMetrics | null> {
    return this._metricsEndpoint.getFulfillmentMetrics(providerId, period);
  }

  getSectorDistribution(providerId: string, period: string): Observable<SectorDistribution[]> {
    return this._metricsEndpoint.getSectorDistribution(providerId, period);
  }
}
