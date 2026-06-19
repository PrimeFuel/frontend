import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { ClientPortfolio } from '../domain/model/client-portfolio.entity';
import { ClientPortfolioResource, ClientPortfoliosResponse } from './client-portfolio-response';
import { ClientPortfolioAssembler } from './client-portfolio-assembler';

const analyticsEndpointUrl = `${environment.serverBasePath}${environment.analyticsEndpointPath}`;

interface ProviderOrderResource {
  id: number;
  companyId: number;
  requestedQuantity?: number;
  totalPrice?: number;
  scheduledDate?: string | null;
  status: string;
}

interface BuyerCompanyResource {
  id: number;
  name: string;
  sector?: string;
}

export class ClientPortfolioApiEndpoint extends BaseApiEndpoint<
  ClientPortfolio,
  ClientPortfolioResource,
  ClientPortfoliosResponse,
  ClientPortfolioAssembler
> {
  constructor(http: HttpClient) {
    super(http, analyticsEndpointUrl, new ClientPortfolioAssembler());
  }

  getClientPortfolio(providerId: string): Observable<ClientPortfolio[]> {
    return forkJoin({
      orders: this.http.get<ProviderOrderResource[]>(
        `${environment.serverBasePath}/fuel-orders/provider/${providerId}`,
      ),
      buyers: this.http.get<BuyerCompanyResource[]>(`${environment.serverBasePath}/buyer-companies`),
    }).pipe(
      map(({ orders, buyers }) => this.toClientPortfolio(providerId, orders ?? [], buyers ?? [])),
      catchError(() => of([])),
    );
  }

  getClientsBySector(providerId: string, sector: string): Observable<ClientPortfolio[]> {
    return this.getClientPortfolio(providerId).pipe(
      map((clients) => clients.filter((c) => c.sector === sector)),
    );
  }

  private toClientPortfolio(
    providerId: string,
    orders: ProviderOrderResource[],
    buyers: BuyerCompanyResource[],
  ): ClientPortfolio[] {
    const buyerById = new Map(buyers.map((buyer) => [buyer.id, buyer]));
    const grouped = new Map<
      number,
      { quantity: number; total: number; activeOrders: number; lastActiveDate: string }
    >();

    orders.forEach((order) => {
      const existing = grouped.get(order.companyId) ?? {
        quantity: 0,
        total: 0,
        activeOrders: 0,
        lastActiveDate: '',
      };
      const scheduledDate = order.scheduledDate ?? '';
      grouped.set(order.companyId, {
        quantity: existing.quantity + Number(order.requestedQuantity ?? 0),
        total: existing.total + Number(order.totalPrice ?? 0),
        activeOrders:
          existing.activeOrders + (['PENDING', 'CONFIRMED'].includes(order.status) ? 1 : 0),
        lastActiveDate:
          scheduledDate && scheduledDate > existing.lastActiveDate
            ? scheduledDate
            : existing.lastActiveDate,
      });
    });

    return Array.from(grouped.entries()).map(([companyId, data]) => {
      const buyer = buyerById.get(companyId);
      return new ClientPortfolio({
        id: String(companyId),
        providerId,
        companyName: buyer?.name ?? `Cliente ${companyId}`,
        sector: buyer?.sector ?? 'GENERAL',
        totalVolume: data.quantity,
        totalCost: data.total,
        activeOrders: data.activeOrders,
        lastActiveDate: data.lastActiveDate || new Date().toISOString(),
        status: data.activeOrders > 0 ? 'ACTIVE' : 'INACTIVE',
        createdAt: new Date().toISOString(),
      });
    });
  }
}
