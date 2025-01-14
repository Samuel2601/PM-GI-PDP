import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GLOBAL } from '../GLOBAL';

@Injectable({
  providedIn: 'root',
})
export class AccountingService {
  private readonly baseUrl = GLOBAL.url + '/contabilidad'; // Base URL para las rutas de contabilidad

  constructor(private http: HttpClient) {}

  // Obtener encabezados con token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Obtener todos los centros de costo
  getCostCenters(): Observable<any> {
    return this.http.get(`${this.baseUrl}/centro-costo`, {
      headers: this.getHeaders(),
    });
  }

  // Obtener todas las cuentas contables
  getAccountingAccounts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cuenta-contable`, {
      headers: this.getHeaders(),
    });
  }

  // Crear un asiento contable
  createJournalEntry(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/asiento`, data, {
      headers: this.getHeaders(),
    });
  }

  // Obtener un asiento contable por ID
  getJournalEntryById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/asiento/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
