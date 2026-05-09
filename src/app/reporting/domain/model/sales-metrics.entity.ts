import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class SalesMetrics implements BaseEntity {
  id: string;
  providerId: string;
  totalRevenue: number;
  revenueGrowthRate: number; // Porcentaje de crecimiento
  totalClients: number;
  activeOrders: number;
  period: string; // Q1_2024, Q2_2024, etc.
  createdAt: string;

  constructor(params: {
    id: string;
    providerId: string;
    totalRevenue: number;
    revenueGrowthRate: number;
    totalClients: number;
    activeOrders: number;
    period: string;
    createdAt: string;
  }) {
    this.id = params.id;
    this.providerId = params.providerId;
    this.totalRevenue = params.totalRevenue;
    this.revenueGrowthRate = params.revenueGrowthRate;
    this.totalClients = params.totalClients;
    this.activeOrders = params.activeOrders;
    this.period = params.period;
    this.createdAt = params.createdAt;
  }
}
