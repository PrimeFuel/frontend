import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Invoice } from '../domain/model/invoice.entity';
import { InvoiceResource, InvoicesResponse } from './payment-response';
import { InvoiceAssembler } from './invoice-assembler';

const invoicesEndpointUrl = `${environment.serverBasePath}${environment.paymentInvoicesEndpointPath}`;

export class InvoiceApiEndpoint extends BaseApiEndpoint<
  Invoice,
  InvoiceResource,
  InvoicesResponse,
  InvoiceAssembler
> {
  constructor(http: HttpClient) {
    super(http, invoicesEndpointUrl, new InvoiceAssembler());
  }

  override getAll(): Observable<Invoice[]> {
    return of([]);
  }

  getByPaymentId(_paymentId: number): Observable<Invoice[]> {
    return of([]);
  }

  override create(invoice: Invoice): Observable<Invoice> {
    return of(invoice);
  }
}
