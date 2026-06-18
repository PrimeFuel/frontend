import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Payment } from '../domain/model/payment.entity';
import { PaymentResource, PaymentsResponse } from './payment-response';
import { PaymentAssembler } from './payment-assembler';

const paymentsEndpointUrl = `${environment.serverBasePath}${environment.paymentPaymentsEndpointPath}`;

export class PaymentApiEndpoint extends BaseApiEndpoint<
  Payment,
  PaymentResource,
  PaymentsResponse,
  PaymentAssembler
> {
  constructor(http: HttpClient) {
    super(http, paymentsEndpointUrl, new PaymentAssembler());
  }

  getByCompanyId(companyId: number): Observable<Payment[]> {
    // Backend route: GET /payments/company/{companyId}
    return this.http
      .get<PaymentResource[]>(`${this.endpointUrl}/company/${companyId}`)
      .pipe(
        map((resources) => resources.map((r) => this.assembler.toEntityFromResource(r))),
        catchError(this.handleError(`Failed to fetch payments for company ${companyId}`)),
      );
  }

  override create(payment: Payment): Observable<Payment> {
    const resource = this.assembler.toResourceFromEntity(payment);
    return this.http.post<PaymentResource>(this.endpointUrl, {
      orderId: Number(resource.orderId),
      companyId: resource.companyId,
      amount: resource.amount,
      paymentMethod: resource.paymentMethod ?? resource.method,
    }).pipe(
      map((created) => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create payment')),
    );
  }
}
