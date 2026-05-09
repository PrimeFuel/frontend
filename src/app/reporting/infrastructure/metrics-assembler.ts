import { SalesMetrics } from '../domain/model/sales-metrics.entity';
import { FulfillmentMetrics } from '../domain/model/fulfillment-metrics.entity';
import { SectorDistribution } from '../domain/model/sector-distribution.entity';
import {
  SalesMetricsResource,
  FulfillmentMetricsResource,
  SectorDistributionResource,
} from './metrics-response';

/**
 * @summary Assembler para transformar métricas entre capas.
 * @remarks Convierte recursos de métricas a entidades de dominio.
 * @author FullTank Platform
 */
export class MetricsAssembler {
  toSalesMetricsEntity(resource: SalesMetricsResource): SalesMetrics {
    return new SalesMetrics({
      id: resource.id,
      providerId: resource.providerId,
      totalRevenue: resource.totalRevenue,
      revenueGrowthRate: resource.revenueGrowthRate,
      totalClients: resource.totalClients,
      activeOrders: resource.activeOrders,
      period: resource.period,
      createdAt: resource.createdAt,
    });
  }

  toFulfillmentMetricsEntity(resource: FulfillmentMetricsResource): FulfillmentMetrics {
    return new FulfillmentMetrics({
      id: resource.id,
      providerId: resource.providerId,
      avgFulfillmentRate: resource.avgFulfillmentRate,
      avgLeadTime: resource.avgLeadTime,
      totalDeliveries: resource.totalDeliveries,
      onTimeDeliveries: resource.onTimeDeliveries,
      period: resource.period,
      createdAt: resource.createdAt,
    });
  }

  toSectorDistributionEntities(resources: SectorDistributionResource[]): SectorDistribution[] {
    return resources.map((resource) => new SectorDistribution({
      id: resource.id,
      providerId: resource.providerId,
      sector: resource.sector,
      volumePercentage: resource.volumePercentage,
      totalVolume: resource.totalVolume,
      period: resource.period,
      createdAt: resource.createdAt,
    }));
  }
}
