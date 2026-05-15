export const environment = {
  production: true,

  // Base API URL
  serverBasePath: 'https://json-server-y51j.onrender.com',
  // IAM (Identity and Access Management)
  iamSignInEndpointPath: '/auth/sign-in',
  iamSignUpEndpointPath: '/auth/sign-up',
  iamRecoverPasswordEndpointPath: '/auth/recover-password',
  // Inventory (Productos e Inventario)
  inventoryEndpointPath: '/inventory',
  inventoryProductsEndpointPath: '/inventory',
  inventoryStockEndpointPath: '/inventory',
  // Ordering (Solicitudes y Órdenes)
  orderingRequestsEndpointPath: '/requests',
  orderingOrdersEndpointPath: '/orders',
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
  reportingMonthlyRevenueEndpointPath: '/monthly-revenue',

};
