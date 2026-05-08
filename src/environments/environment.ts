export const environment = {
  production: true,
  // Base API URL
  serverBasePath: 'http://localhost:8080/api/v1',
  // IAM (Identity and Access Management)
  iamSignInEndpointPath: '/auth/sign-in',
  iamSignUpEndpointPath: '/auth/sign-up',
  iamRecoverPasswordEndpointPath: '/auth/recover-password',
  // Catalog (Productos e Inventario)
  catalogEndpointPath: '/catalog',
  catalogProductsEndpointPath: '/catalog/products',
  catalogInventoryEndpointPath: '/catalog/inventory',
  // Ordering (Solicitudes y Órdenes)
  orderingRequestsEndpointPath: '/ordering/requests',
  orderingOrdersEndpointPath: '/ordering/orders',
  // Fulfillment (Logística y Despacho)
  fulfillmentVehiclesEndpointPath: '/fulfillment/vehicles',
  fulfillmentDriversEndpointPath: '/fulfillment/drivers',
  fulfillmentDeliveriesEndpointPath: '/fulfillment/deliveries',
  // Payment (Transacciones y Pagos)
  paymentTransactionsEndpointPath: '/payment/transactions',
  paymentPaymentsEndpointPath: '/payment/payments',
  // Notification (Notificaciones)
  notificationEndpointPath: '/notifications',
  // Reporting (Reportes y Analytics)
  reportingReportsEndpointPath: '/reporting/reports',
  reportingKpisEndpointPath: '/reporting/kpis',
  reportingSalesEndpointPath: '/reporting/sales',
  reportingConsumptionEndpointPath: '/reporting/consumption',
};
