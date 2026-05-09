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
 * @remarks Expone consultas de clientes del proveedor para reportes.
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
   * Obtiene el portafolio de clientes de un proveedor.
   */
  getClientPortfolio(providerId: string): Observable<ClientPortfolio[]> {
    return this.http.get<ClientPortfoliosResponse>(`${this.endpointUrl}/clients/${providerId}`).pipe(
      map((response) => this.assembler.toEntitiesFromResponse(response)),
      catchError(this.handleError(`Failed to fetch client portfolio for provider ${providerId}`)),
    );
  }

  /**
   * Obtiene clientes filtrados por sector.
   */
  getClientsBySector(providerId: string, sector: string): Observable<ClientPortfolio[]> {
    return this.http.get<ClientPortfoliosResponse>(`${this.endpointUrl}/clients/${providerId}/sector/${sector}`).pipe(
      map((response) => this.assembler.toEntitiesFromResponse(response)),
      catchError(this.handleError(`Failed to fetch clients for sector ${sector}`)),
    );
  }
}
