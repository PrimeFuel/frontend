import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * @summary Entidad de dominio que representa métricas de cumplimiento logístico.
 * @remarks Almacena indicadores de eficiencia operativa: tasa de cumplimiento
 * (fulfillment rate) y tiempo promedio de entrega (lead time).
 * @author FullTank Platform
 */
export class FulfillmentMetrics implements BaseEntity {
  id: string;
  providerId: string;
  avgFulfillmentRate: number; // Porcentaje de entregas a tiempo
  avgLeadTime: number; // Días promedio de entrega
  totalDeliveries: number;
  onTimeDeliveries: number;
  period: string; // Q1_2024, Q2_2024, etc.
  createdAt: string;

  constructor(params: {
    id: string;
    providerId: string;
    avgFulfillmentRate: number;
    avgLeadTime: number;
    totalDeliveries: number;
    onTimeDeliveries: number;
    period: string;
    createdAt: string;
  }) {
    this.id = params.id;
    this.providerId = params.providerId;
    this.avgFulfillmentRate = params.avgFulfillmentRate;
    this.avgLeadTime = params.avgLeadTime;
    this.totalDeliveries = params.totalDeliveries;
    this.onTimeDeliveries = params.onTimeDeliveries;
    this.period = params.period;
    this.createdAt = params.createdAt;
  }
}
