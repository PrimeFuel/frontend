export const environment = {
  production: false,
  // Base API URL
  serverBasePath: 'https://json-server-y51j.onrender.com',
  // IAM (Identity and Access Management)
  iamSignInEndpointPath: '/auth/sign-in',
  iamSignUpEndpointPath: '/auth/sign-up',
  iamRecoverPasswordEndpointPath: '/auth/recover-password',
  // Catalog (Productos e Inventario)
  catalogEndpointPath: '/catalog',
  catalogProductsEndpointPath: '/catalog',
  catalogInventoryEndpointPath: '/catalog',
  // Ordering (Solicitudes y Órdenes)
  orderingRequestsEndpointPath: '/ordering/requests',
  orderingOrdersEndpointPath: '/ordering/orders',
  // Fulfillment (Logística y Despacho)
  fulfillmentVehiclesEndpointPath: '/vehicles',
  fulfillmentDriversEndpointPath: '/drivers',
  fulfillmentDeliveriesEndpointPath: '/deliveries',
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
