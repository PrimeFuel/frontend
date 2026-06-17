export class Payment {
  id: string;
  orderId: string;
  companyId: number;
  providerId: number;
  method: string;
  amount: number;
  status: string;
  maskedCard: string | null;
  cardHolder: string | null;
  reference: string | null;
  createdAt: string;

  constructor(params: {
    id: number | string;
    orderId: string;
    companyId: number;
    providerId: number;
    method: string;
    amount: number;
    status: string;
    maskedCard: string | null;
    cardHolder: string | null;
    reference: string | null;
    createdAt: string;
  }) {
    this.id = String(params.id);
    this.orderId = params.orderId;
    this.companyId = params.companyId;
    this.providerId = params.providerId;
    this.method = params.method;
    this.amount = params.amount;
    this.status = params.status;
    this.maskedCard = params.maskedCard;
    this.cardHolder = params.cardHolder;
    this.reference = params.reference;
    this.createdAt = params.createdAt;
  }
}
