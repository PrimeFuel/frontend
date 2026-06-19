export class Invoice {
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

  constructor(params: {
    id: number | string;
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
  }) {
    Object.assign(this, params);
    this.id = String(params.id);
    this.paymentId = params.paymentId;
    this.orderId = params.orderId;
    this.invoiceNumber = params.invoiceNumber;
    this.providerRuc = params.providerRuc;
    this.providerName = params.providerName;
    this.buyerRuc = params.buyerRuc;
    this.buyerName = params.buyerName;
    this.fuelType = params.fuelType;
    this.quantity = params.quantity;
    this.unit = params.unit;
    this.unitPrice = params.unitPrice;
    this.subtotal = params.subtotal;
    this.igv = params.igv;
    this.total = params.total;
    this.issueDate = params.issueDate;
    this.status = params.status;
  }
}
