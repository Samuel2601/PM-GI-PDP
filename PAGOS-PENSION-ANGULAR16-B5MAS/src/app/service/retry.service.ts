import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RetryService {
  /**
   * Implementa una estrategia de reintento con retroceso exponencial
   * @param maxRetries Número máximo de reintentos
   * @param initialDelay Retraso inicial en milisegundos
   * @param backoffMultiplier Multiplicador para aumentar el retraso en cada intento
   * @param onRetry Función opcional que se ejecuta en cada reintento
   */
  exponentialBackoff(
    maxRetries: number = 3,
    initialDelay: number = 1000,
    backoffMultiplier: number = 2,
    onRetry?: (retryCount: number, error: any) => void
  ) {
    let retries = 0;

    return retryWhen(errors => 
      errors.pipe(
        mergeMap(error => {
          if (retries >= maxRetries) {
            return throwError(() => error);
          }
          
          retries++;
          const delay = initialDelay * Math.pow(backoffMultiplier, retries - 1);
          
          if (onRetry) {
            onRetry(retries, error);
          }
          
          return timer(delay);
        }),
        finalize(() => retries = 0)
      )
    );
  }
}