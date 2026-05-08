/**
 * @summary Comando para ejecutar el despacho de una entrega.
 * @remarks Inicia el proceso de entrega, cambiando el estado de ASSIGNED a IN_TRANSIT.
 * Marca vehículo y conductor como ocupados. Utilizado cuando el despacho sale.
 * @author FullTank Platform
 */
export interface ExecuteDispatchCommand {
  deliveryId: string;
  dispatchTime: string;
  notes?: string;
}
