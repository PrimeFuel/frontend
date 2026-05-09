import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * @summary Resource DTO para portafolio de clientes.
 * @remarks Define la estructura de respuesta del backend para clientes.
 * @author FullTank Platform
 */
export interface ClientPortfolioResource extends BaseResource {
  id: string;
  providerId: string;
  companyName: string;
  sector: string;
  totalVolume: number;
  lastActiveDate: string;
  status: string;
  createdAt: string;
}

export interface ClientPortfoliosResponse extends BaseResponse {
  clients: ClientPortfolioResource[];
}
