import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type';
import { environment } from '../../../environments/environment';
import { SalesMetrics } from '../domain/model/sales-metrics.entity';
import { FulfillmentMetrics } from '../domain/model/fulfillment-metrics.entity';
import { SectorDistribution } from '../domain/model/sector-distribution.entity';
import { MetricsAssembler } from './metrics-assembler';
import {
  SalesMetricsResource,
  FulfillmentMetricsResource,
  SectorDistributionResource,
} from './metrics-response';

const kpiEndpointUrl = `${environment.serverBasePath}${environment.reportingKpisEndpointPath}`;

/**
 * @summary Endpoint API para métricas y KPIs.
 * @remarks Rutas ajustadas para json-server:
 *   /reporting/kpis/sales/1       → objeto único (id = providerId)
 *   /reporting/kpis/fulfillment/1 → objeto único (id = providerId)
 *   /reporting/kpis/sectors       → array completo, filtrado client-side
 * @author FullTank Platform
 */
export class MetricsApiEndpoint extends ErrorHandlingEnabledBaseType {
  private assembler = new MetricsAssembler();

  constructor(private http: HttpClient) {
    super();
  }

  getSalesMetrics(providerId: string, period: string): Observable<SalesMetrics | null> {
    return this.http
      .get<any>(`${kpiEndpointUrl}/sales/${providerId}`)
      .pipe(
        map((response) => {
          if (!response) return null;
          const resource: SalesMetricsResource = response.salesMetrics ?? response;
          return this.assembler.toSalesMetricsEntity(resource);
        }),
        catchError(this.handleError('Failed to fetch sales metrics')),
      );
  }

  getFulfillmentMetrics(providerId: string, period: string): Observable<FulfillmentMetrics | null> {
    return this.http
      .get<any>(`${kpiEndpointUrl}/fulfillment/${providerId}`)
      .pipe(
        map((response) => {
          if (!response) return null;
          const resource: FulfillmentMetricsResource = response.fulfillmentMetrics ?? response;
          return this.assembler.toFulfillmentMetricsEntity(resource);
        }),
        catchError(this.handleError('Failed to fetch fulfillment metrics')),
      );
  }

  getSectorDistribution(providerId: string, period: string): Observable<SectorDistribution[]> {
    return this.http
      .get<any>(`${kpiEndpointUrl}/sectors`)
      .pipe(
        map((response) => {
          let resources: SectorDistributionResource[];
          if (Array.isArray(response)) {
            resources = response.filter((r: any) => r.providerId === providerId);
          } else {
            resources = response.sectorDistribution ?? [];
          }
          return this.assembler.toSectorDistributionEntities(resources);
        }),
        catchError(this.handleError('Failed to fetch sector distribution')),
      );
  }
}
