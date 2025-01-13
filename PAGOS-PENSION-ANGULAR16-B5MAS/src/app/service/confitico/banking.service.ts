import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GLOBAL } from '../GLOBAL';

@Injectable({
  providedIn: 'root',
})
export class BankingService {
  private readonly baseUrl = GLOBAL.url + '/banco'; // Base URL para las rutas de banco

  constructor(private http: HttpClient) {}

  // Obtener encabezados con token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Obtener todas las cuentas bancarias
  getBankAccounts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cuenta`, {
      headers: this.getHeaders(),
    });
  }

  // Obtener todos los movimientos bancarios
  getBankMovements(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movimiento`, {
      headers: this.getHeaders(),
    });
  }
}
