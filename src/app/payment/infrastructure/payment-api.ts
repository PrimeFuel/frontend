import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Payment } from '../domain/model/payment.entity';
import { Invoice } from '../domain/model/invoice.entity';
import { PaymentApiEndpoint } from './payment-api-endpoint';
import { InvoiceApiEndpoint } from './invoice-api-endpoint';

@Injectable({ providedIn: 'root' })
export class PaymentApi extends BaseApi {
  private readonly paymentsEndpoint: PaymentApiEndpoint;
  private readonly invoicesEndpoint: InvoiceApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.paymentsEndpoint = new PaymentApiEndpoint(http);
    this.invoicesEndpoint = new InvoiceApiEndpoint(http);
  }

  getPaymentsByCompany(companyId: number): Observable<Payment[]> {
    return this.paymentsEndpoint.getByCompanyId(companyId);
  }

  createPayment(payment: Payment): Observable<Payment> {
    return this.paymentsEndpoint.create(payment);
  }

  getInvoicesByPaymentId(paymentId: number): Observable<Invoice[]> {
    return this.invoicesEndpoint.getByPaymentId(paymentId);
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.invoicesEndpoint.create(invoice);
  }

  getAllInvoices(): Observable<Invoice[]> {
    return this.invoicesEndpoint.getAll();
  }
}
