import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GLOBAL } from '../GLOBAL';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly baseUrl = GLOBAL.url + '/transacciones'; // Base URL para las rutas de transacciones

  constructor(private http: HttpClient) {}

  // Obtener encabezados con token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Documentos
  getDocuments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/documento`, {
      headers: this.getHeaders(),
    });
  }

  getDocumentById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/documento/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createDocument(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/documento`, data, {
      headers: this.getHeaders(),
    });
  }

  updateDocument(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/documento`, data, {
      headers: this.getHeaders(),
    });
  }

  submitDocumentToSRI(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/documento/${id}/sri`, data, {
      headers: this.getHeaders(),
    });
  }

  // Transacciones
  getTransactions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/transaccion`, {
      headers: this.getHeaders(),
    });
  }

  getTransactionById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/transaccion/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
