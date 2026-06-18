import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Invoice } from '../domain/model/invoice.entity';
import { InvoiceResource, InvoicesResponse } from './payment-response';

export class InvoiceAssembler implements BaseAssembler<Invoice, InvoiceResource, InvoicesResponse> {
  toEntityFromResource(resource: InvoiceResource): Invoice {
    return new Invoice({
      id: Number(resource.id),
      paymentId: resource.paymentId,
      orderId: resource.orderId,
      invoiceNumber: resource.invoiceNumber,
      providerRuc: resource.providerRuc,
      providerName: resource.providerName,
      buyerRuc: resource.buyerRuc,
      buyerName: resource.buyerName,
      fuelType: resource.fuelType,
      quantity: resource.quantity,
      unit: resource.unit,
      unitPrice: resource.unitPrice,
      subtotal: resource.subtotal,
      igv: resource.igv,
      total: resource.total,
      issueDate: resource.issueDate,
      status: resource.status,
    });
  }

  toResourceFromEntity(entity: Invoice): InvoiceResource {
    return {
      id: entity.id,
      paymentId: entity.paymentId,
      orderId: entity.orderId,
      invoiceNumber: entity.invoiceNumber,
      providerRuc: entity.providerRuc,
      providerName: entity.providerName,
      buyerRuc: entity.buyerRuc,
      buyerName: entity.buyerName,
      fuelType: entity.fuelType,
      quantity: entity.quantity,
      unit: entity.unit,
      unitPrice: entity.unitPrice,
      subtotal: entity.subtotal,
      igv: entity.igv,
      total: entity.total,
      issueDate: entity.issueDate,
      status: entity.status,
    };
  }

  toEntitiesFromResponse(response: InvoicesResponse): Invoice[] {
    return response.invoices.map((r) => this.toEntityFromResource(r));
  }
}
