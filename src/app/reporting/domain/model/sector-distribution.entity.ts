import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * @summary Entidad de dominio que representa distribución de volumen por sector.
 * @remarks Almacena el porcentaje de volumen vendido a cada sector industrial:
 * Logistics, Mining, Construction, Maritime, etc. Utilizado para gráficos.
 * @author FullTank Platform
 */
export class SectorDistribution implements BaseEntity {
  id: string;
  providerId: string;
  sector: string; // Transport, Mining, Construction, Maritime, Logistics
  volumePercentage: number; // Porcentaje del total
  totalVolume: number; // Volumen absoluto en MT
  period: string; // Q1_2024, Q2_2024, etc.
  createdAt: string;

  constructor(params: {
    id: string;
    providerId: string;
    sector: string;
    volumePercentage: number;
    totalVolume: number;
    period: string;
    createdAt: string;
  }) {
    this.id = params.id;
    this.providerId = params.providerId;
    this.sector = params.sector;
    this.volumePercentage = params.volumePercentage;
    this.totalVolume = params.totalVolume;
    this.period = params.period;
    this.createdAt = params.createdAt;
  }
}
