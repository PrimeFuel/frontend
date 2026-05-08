/**
 * @summary Comando para asignar recursos logísticos a una orden.
 * @remarks Vincula un vehículo y conductor a una orden aprobada.
 * Crea una entrega en estado ASSIGNED. Utilizado por proveedores.
 * @author FullTank Platform
 */
export interface AssignResourcesCommand {
  orderId: string;
  vehicleId: string;
  driverId: string;
  scheduledDate: string;
  notes?: string;
}
