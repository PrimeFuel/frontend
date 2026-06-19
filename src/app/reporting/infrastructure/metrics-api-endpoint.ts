import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type';
import { environment } from '../../../environments/environment';
import { SalesMetrics } from '../domain/model/sales-metrics.entity';
import { FulfillmentMetrics } from '../domain/model/fulfillment-metrics.entity';
import { SectorDistribution } from '../domain/model/sector-distribution.entity';
import { MetricsAssembler } from './metrics-assembler';
import { SalesMetricsResource } from './metrics-response';

const analyticsBase = `${environment.serverBasePath}${environment.analyticsEndpointPath}`;

interface ProviderAnalyticsResource {
  providerId: number;
  totalOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export class MetricsApiEndpoint extends ErrorHandlingEnabledBaseType {
  private assembler = new MetricsAssembler();

  constructor(private http: HttpClient) {
    super();
  }

  getSalesMetrics(providerId: string, period: string): Observable<SalesMetrics | null> {
    return this.http.get<ProviderAnalyticsResource>(`${analyticsBase}/providers/${providerId}`).pipe(
      map((view) => {
        if (!view) return null;
        const resource: SalesMetricsResource = {
          id: providerId,
          providerId,
          totalRevenue: Number(view.totalRevenue ?? 0),
          revenueGrowthRate: 0,
          totalClients: 0,
          activeOrders: Number(view.confirmedOrders ?? view.totalOrders ?? 0),
          period,
          createdAt: new Date().toISOString(),
        };
        return this.assembler.toSalesMetricsEntity(resource);
      }),
      catchError(() => of(null)),
    );
  }

  getFulfillmentMetrics(_providerId: string, _period: string): Observable<FulfillmentMetrics | null> {
    return of(null);
  }

  getSectorDistribution(_providerId: string, _period: string): Observable<SectorDistribution[]> {
    return of([]);
  }
}
