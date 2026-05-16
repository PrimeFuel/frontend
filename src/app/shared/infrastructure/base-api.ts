/**
 * Abstract base class for all FullTank API gateway services.
 * @remarks Acts as the root class for bounded context API classes
 * (e.g. InventoryApi, OrderingApi, FulfillmentApi). Child classes aggregate
 * multiple endpoint classes and expose them to the application store.
 * @author FullTank Platform
 */
export abstract class BaseApi {
  // No methods defined; children classes aggregate specific API endpoints.
}
