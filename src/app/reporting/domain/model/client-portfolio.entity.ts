import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class ClientPortfolio implements BaseEntity {
  id: string;
  providerId: string;
  companyName: string;
  sector: string; // Transport, Mining, Construction, Maritime, Logistics
  totalVolume: number; // Volumen total comprado (MT - metric tons)
  lastActiveDate: string;
  status: string; // ACTIVE, PENDING, INACTIVE
  createdAt: string;

  constructor(params: {
    id: string;
    providerId: string;
    companyName: string;
    sector: string;
    totalVolume: number;
    lastActiveDate: string;
    status: string;
    createdAt: string;
  }) {
    this.id = params.id;
    this.providerId = params.providerId;
    this.companyName = params.companyName;
    this.sector = params.sector;
    this.totalVolume = params.totalVolume;
    this.lastActiveDate = params.lastActiveDate;
    this.status = params.status;
    this.createdAt = params.createdAt;
  }
}
