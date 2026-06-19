import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { ClientPortfolio } from '../domain/model/client-portfolio.entity';
import { ClientPortfolioResource, ClientPortfoliosResponse } from './client-portfolio-response';
import { ClientPortfolioAssembler } from './client-portfolio-assembler';

const reportingEndpointUrl = `${environment.serverBasePath}${environment.reportingReportsEndpointPath}`;

/**
 * @summary Endpoint API para gestión de portafolio de clientes.
 * @remarks Carga todos los clientes de una vez. El filtro por sector
 * se maneja client-side en el store (filterBySector) para evitar
 * problemas de routing en json-server.
 * @author FullTank Platform
 */
export class ClientPortfolioApiEndpoint extends BaseApiEndpoint<
  ClientPortfolio,
  ClientPortfolioResource,
  ClientPortfoliosResponse,
  ClientPortfolioAssembler
> {
  constructor(http: HttpClient) {
    super(http, reportingEndpointUrl, new ClientPortfolioAssembler());
  }

  /**
   * Carga todos los clientes. json-server devuelve array plano.
   */
  getClientPortfolio(providerId: string): Observable<ClientPortfolio[]> {
    return this.http
      .get<any>(`${this.endpointUrl}/clients`)
      .pipe(
        map((response) => {
          const list: ClientPortfolioResource[] = Array.isArray(response)
            ? response
            : response.clients ?? [];
          return list
            .filter((r) => r.providerId === providerId)
            .map((r) => this.assembler.toEntityFromResource(r));
        }),
        catchError(this.handleError(`Failed to fetch client portfolio`)),
      );
  }

  /**
   * @deprecated Usar store.filterBySector() en su lugar.
   * Mantenido para compatibilidad con ReportingApi.
   */
  getClientsBySector(providerId: string, sector: string): Observable<ClientPortfolio[]> {
    return this.getClientPortfolio(providerId).pipe(
      map((clients) => clients.filter((c) => c.sector === sector)),
    );
  }
}
