/**
 * @summary Comando para generar reportes analíticos.
 * @remarks Solicita la generación de reportes consolidados para un proveedor
 * en un período específico. Puede incluir métricas de ventas, cumplimiento,
 * portafolio de clientes y distribución sectorial.
 * @author FullTank Platform
 */
export interface GenerateReportCommand {
  providerId: string;
  reportType: string; // SALES, FULFILLMENT, CLIENT_PORTFOLIO, SECTOR_DISTRIBUTION, COMPREHENSIVE
  period: string; // Q1_2024, Q2_2024, YEAR_2024, CUSTOM
  startDate?: string; // Para períodos custom
  endDate?: string; // Para períodos custom
}
