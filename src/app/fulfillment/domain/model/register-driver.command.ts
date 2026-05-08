/**
 * @summary Comando para registrar un nuevo conductor.
 * @remarks Define los datos necesarios para dar de alta un conductor
 * autorizado para realizar entregas. Utilizado por proveedores.
 * @author FullTank Platform
 */
export interface RegisterDriverCommand {
  providerId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
}
