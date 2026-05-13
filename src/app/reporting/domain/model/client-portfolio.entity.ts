import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * @summary Entidad de dominio para el portafolio de clientes.
 * @remarks totalCost es el costo total facturado al cliente (S/).
 * activeOrders es el número de órdenes activas actuales.
 * @author FullTank Platform
 */
export class ClientPortfolio implements BaseEntity {
  id: string;
  providerId: string;
  companyName: string;
  sector: string;
  totalVolume: number;   // Volumen total (MT)
  totalCost: number;     // Costo total facturado (S/)
  activeOrders: number;  // Órdenes activas actuales
  lastActiveDate: string;
  status: string;        // ACTIVE, PENDING, INACTIVE, REVIEW
  createdAt: string;

  constructor(params: {
    id: string;
    providerId: string;
    companyName: string;
    sector: string;
    totalVolume: number;
    totalCost: number;
    activeOrders: number;
    lastActiveDate: string;
    status: string;
    createdAt: string;
  }) {
    this.id = params.id;
    this.providerId = params.providerId;
    this.companyName = params.companyName;
    this.sector = params.sector;
    this.totalVolume = params.totalVolume;
    this.totalCost = params.totalCost ?? 0;
    this.activeOrders = params.activeOrders ?? 0;
    this.lastActiveDate = params.lastActiveDate;
    this.status = params.status;
    this.createdAt = params.createdAt;
  }
}
