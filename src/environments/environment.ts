export const environment = {
  production: true,

  // ── Spring Boot REST API base ──────────────────────────────────────────────
  // The frontend now consumes the real Spring Boot backend instead of json-server.
  // Override this value with the deployed backend URL when publishing to prod.
  serverBasePath: 'http://localhost:8080/api/v1',

  // IAM (Identity and Access Management)
  iamSignInEndpointPath: '/authentication/sign-in',
  iamSignUpEndpointPath: '/authentication/sign-up',
  iamRecoverPasswordEndpointPath: '/auth/recover-password',
  iamUsersEndpointPath: '/users',
  iamBuyerCompaniesEndpointPath: '/buyer-companies',
  iamProviderCompaniesEndpointPath: '/provider-companies',
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

  // Catalog
  catalogProvidersEndpointPath: '/provider-companies',
  catalogProductsEndpointPath: '/fuel-products',

  // Equipment
  equipmentEndpointPath: '/equipment',
  favoriteProvidersEndpointPath: '/favorite-providers',
  refillHistoryEndpointPath: '/refill-history',

  // Payment
  paymentPaymentsEndpointPath: '/payments',
  paymentInvoicesEndpointPath: '/invoices',

  // Notification
  notificationEndpointPath: '/notifications',
  // Reporting (Reportes y Analytics)
  reportingReportsEndpointPath: '/reporting/reports',
  reportingKpisEndpointPath: '/reporting/kpis',
  reportingSalesEndpointPath: '/reporting/sales',
  reportingConsumptionEndpointPath: '/reporting/consumption',
  analyticsEndpointPath: '/analytics',
  reportingMonthlyRevenueEndpointPath: '/monthly-revenue',  // ← agregar esto

};
