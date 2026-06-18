import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface PaymentResource extends BaseResource {
  id: string;
  orderId: string;
  companyId: number;
  providerId?: number;
  method?: string;
  paymentMethod?: string;
  amount: number;
  status: string;
  maskedCard?: string | null;
  cardHolder?: string | null;
  reference?: string | null;
  transactionReference?: string | null;
  paidAt?: string | null;
  createdAt?: string;
}

export interface PaymentsResponse extends BaseResponse {
  payments: PaymentResource[];
}

export interface InvoiceResource extends BaseResource {
  id: string;
  paymentId: number;
  orderId: string;
  invoiceNumber: string;
  providerRuc: string;
  providerName: string;
  buyerRuc: string;
  buyerName: string;
  fuelType: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  igv: number;
  total: number;
  issueDate: string;
  status: string;
}

export interface InvoicesResponse extends BaseResponse {
  invoices: InvoiceResource[];
}
