import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderingApi } from '../../ordering/infrastructure/ordering-api';
import { Request } from '../../ordering/domain/model/request.entity';
import { IamStore } from '../../iam/application/iam.store';

@Injectable({ providedIn: 'root' })
export class CoordinationService {
  private readonly orderingApi = inject(OrderingApi);
  private readonly iam = inject(IamStore);

  createFuelRequest(params: {
    providerId: number;
    productId: number;
    equipmentId: number | null;
    quantity: number;
    fuelType: string;
    productName: string;
    unitPrice: number;
    deliveryAddress: string;
    desiredDeliveryDate: string;
  }): Observable<Request> {
    const now = new Date().toISOString();
    const companyId = this.iam.currentCompanyId() ?? 1;
    const request = new Request({
      id: `req-${Date.now()}`,
      clientId: String(companyId),
      companyId,
      providerId: String(params.providerId),
      productId: String(params.productId),
      equipmentId: params.equipmentId,
      fuelType: params.fuelType,
      productName: params.productName,
      quantity: params.quantity,
      unit: 'LITERS',
      unitPrice: params.unitPrice,
      desiredDeliveryDate: params.desiredDeliveryDate,
      deliveryAddress: params.deliveryAddress,
      source: 'CATALOG',
      status: 'PENDING',
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    });

    return this.orderingApi.createRequest(request);
  }
}
