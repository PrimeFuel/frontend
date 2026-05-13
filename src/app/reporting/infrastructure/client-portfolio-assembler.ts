import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { ClientPortfolio } from '../domain/model/client-portfolio.entity';
import { ClientPortfolioResource, ClientPortfoliosResponse } from './client-portfolio-response';

/**
 * @summary Assembler para transformar portafolio de clientes entre capas.
 * @author FullTank Platform
 */
export class ClientPortfolioAssembler
  implements BaseAssembler<ClientPortfolio, ClientPortfolioResource, ClientPortfoliosResponse>
{
  toEntitiesFromResponse(response: ClientPortfoliosResponse): ClientPortfolio[] {
    return response.clients.map((r) => this.toEntityFromResource(r));
  }

  toEntityFromResource(resource: ClientPortfolioResource): ClientPortfolio {
    return new ClientPortfolio({
      id: resource.id,
      providerId: resource.providerId,
      companyName: resource.companyName,
      sector: resource.sector,
      totalVolume: resource.totalVolume,
      totalCost: (resource as any).totalCost ?? 0,
      activeOrders: (resource as any).activeOrders ?? 0,
      lastActiveDate: resource.lastActiveDate,
      status: resource.status,
      createdAt: resource.createdAt,
    });
  }

  toResourceFromEntity(entity: ClientPortfolio): ClientPortfolioResource {
    return {
      id: entity.id,
      providerId: entity.providerId,
      companyName: entity.companyName,
      sector: entity.sector,
      totalVolume: entity.totalVolume,
      lastActiveDate: entity.lastActiveDate,
      status: entity.status,
      createdAt: entity.createdAt,
    } as ClientPortfolioResource;
  }
}
