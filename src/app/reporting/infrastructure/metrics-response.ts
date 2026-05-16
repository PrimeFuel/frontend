import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * @summary Resource DTO para métricas consolidadas.
 * @remarks Define la estructura de respuesta del backend para métricas
 * de ventas, cumplimiento y distribución sectorial.
 * @author FullTank Platform
 */
export interface SalesMetricsResource extends BaseResource {
  id: string;
  providerId: string;
  totalRevenue: number;
  revenueGrowthRate: number;
  totalClients: number;
  activeOrders: number;
  period: string;
  createdAt: string;
}

export interface FulfillmentMetricsResource extends BaseResource {
  id: string;
  providerId: string;
  avgFulfillmentRate: number;
  avgLeadTime: number;
  totalDeliveries: number;
  onTimeDeliveries: number;
  period: string;
  createdAt: string;
}

export interface SectorDistributionResource extends BaseResource {
  id: string;
  providerId: string;
  sector: string;
  volumePercentage: number;
  totalVolume: number;
  period: string;
  createdAt: string;
}

export interface MetricsResponse extends BaseResponse {
  salesMetrics?: SalesMetricsResource;
  fulfillmentMetrics?: FulfillmentMetricsResource;
  sectorDistribution?: SectorDistributionResource[];
}
