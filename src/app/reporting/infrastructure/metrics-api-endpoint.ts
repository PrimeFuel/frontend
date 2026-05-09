import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type';
import { environment } from '../../../environments/environment';
import { SalesMetrics } from '../domain/model/sales-metrics.entity';
import { FulfillmentMetrics } from '../domain/model/fulfillment-metrics.entity';
import { SectorDistribution } from '../domain/model/sector-distribution.entity';
import { MetricsResponse } from './metrics-response';
import { MetricsAssembler } from './metrics-assembler';

const kpiEndpointUrl = `${environment.serverBasePath}${environment.reportingKpisEndpointPath}`;

/**
 * @summary Endpoint API para métricas y KPIs.
 * @remarks Expone consultas de métricas de ventas, cumplimiento y distribución.
 * @author FullTank Platform
 */
export class MetricsApiEndpoint extends ErrorHandlingEnabledBaseType {
  private assembler = new MetricsAssembler();

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Obtiene métricas de ventas de un proveedor.
   */
  getSalesMetrics(providerId: string, period: string): Observable<SalesMetrics | null> {
    return this.http.get<MetricsResponse>(`${kpiEndpointUrl}/sales/${providerId}?period=${period}`).pipe(
      map((response) => response.salesMetrics ? this.assembler.toSalesMetricsEntity(response.salesMetrics) : null),
      catchError(this.handleError('Failed to fetch sales metrics')),
    );
  }

  /**
   * Obtiene métricas de cumplimiento de un proveedor.
   */
  getFulfillmentMetrics(providerId: string, period: string): Observable<FulfillmentMetrics | null> {
    return this.http.get<MetricsResponse>(`${kpiEndpointUrl}/fulfillment/${providerId}?period=${period}`).pipe(
      map((response) => response.fulfillmentMetrics ? this.assembler.toFulfillmentMetricsEntity(response.fulfillmentMetrics) : null),
      catchError(this.handleError('Failed to fetch fulfillment metrics')),
    );
  }

  /**
   * Obtiene distribución sectorial de un proveedor.
   */
  getSectorDistribution(providerId: string, period: string): Observable<SectorDistribution[]> {
    return this.http.get<MetricsResponse>(`${kpiEndpointUrl}/sectors/${providerId}?period=${period}`).pipe(
      map((response) => response.sectorDistribution ? this.assembler.toSectorDistributionEntities(response.sectorDistribution) : []),
      catchError(this.handleError('Failed to fetch sector distribution')),
    );
  }
}
