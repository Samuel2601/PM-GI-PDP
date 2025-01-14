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

  // Corrección en getHeaders
  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.clear();
      throw new Error('No token found');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `${token}`, // Aseguramos que el token se envíe en el formato correcto
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
