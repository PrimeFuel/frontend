/**
 * Base entity interface for all FullTank domain entities.
 * @remarks Uses string UUID as identifier to align with the Spring Boot
 * backend that generates UUIDs (VARCHAR(36)) for all entity IDs.
 * @author FullTank Platform
 */
export interface BaseEntity {
  id: string;
}
