import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export abstract class ErrorHandlingEnabledBaseType {

  protected handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      let errorMessage = operation;

      if (error.status === 400) {
        errorMessage = `${operation}: Invalid request data`;
      } else if (error.status === 401) {
        errorMessage = `${operation}: Unauthorized. Please sign in again`;
      } else if (error.status === 403) {
        errorMessage = `${operation}: Forbidden. Insufficient permissions`;
      } else if (error.status === 404) {
        errorMessage = `Resource not found: ${operation}`;
      } else if (error.status === 409) {
        errorMessage = `${operation}: Conflict. The resource already exists`;
      } else if (error.status === 422) {
        errorMessage = `${operation}: Unprocessable entity. Insufficient data`;
      } else if (error.error instanceof ErrorEvent) {
        errorMessage = `${operation}: ${error.error.message}`;
      } else {
        errorMessage = `${operation}: ${error.statusText || 'Unexpected server error'}`;
      }

      console.error(`[FullTank API Error] ${errorMessage}`, error);
      return throwError(() => new Error(errorMessage));
    };
  }
}
