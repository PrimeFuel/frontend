import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Payment } from '../domain/model/payment.entity';
import { PaymentResource, PaymentsResponse } from './payment-response';

export class PaymentAssembler implements BaseAssembler<Payment, PaymentResource, PaymentsResponse> {
  toEntityFromResource(resource: PaymentResource): Payment {
    return new Payment({
      id: Number(resource.id),
      orderId: String(resource.orderId),
      companyId: resource.companyId,
      providerId: resource.providerId ?? 0,
      method: resource.method ?? resource.paymentMethod ?? 'BANK_TRANSFER',
      amount: resource.amount,
      status: resource.status,
      maskedCard: resource.maskedCard ?? null,
      cardHolder: resource.cardHolder ?? null,
      reference: resource.reference ?? resource.transactionReference ?? null,
      createdAt: resource.createdAt ?? resource.paidAt ?? '',
    });
  }

  toResourceFromEntity(entity: Payment): PaymentResource {
    return {
      id: entity.id,
      orderId: entity.orderId,
      companyId: entity.companyId,
      providerId: entity.providerId,
      method: entity.method,
      paymentMethod: entity.method,
      amount: entity.amount,
      status: entity.status,
      maskedCard: entity.maskedCard,
      cardHolder: entity.cardHolder,
      reference: entity.reference,
      transactionReference: entity.reference,
      createdAt: entity.createdAt,
    };
  }

  toEntitiesFromResponse(response: PaymentsResponse): Payment[] {
    return response.payments.map((r) => this.toEntityFromResource(r));
  }
}
