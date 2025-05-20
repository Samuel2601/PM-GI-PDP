import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GLOBAL } from '../GLOBAL';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly baseUrl = GLOBAL.url + 'transaccion'; // Base URL para las rutas de transacciones

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

  createDocument(data: any, id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/documento/` + id, data, {
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

  createDocumentNuevoProveedor(data: any): Observable<any> {
    return this.http.post(
      `https://plataforma.geoneg.com:8081/api/Invoice/GuardarComprobantesAPI`,
      data,
      {
        headers: this.getHeaders(),
      }
    );
  }

  generarDocumentoNuevoProveedor(id: string, token: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token,
    });

    return this.http.get(`${GLOBAL.url}/generarDocumentoNuevoProveedor/${id}`, {
      headers: headers,
    });
  }

  getXml_Ride(id: string, token: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token,
    });

    return this.http.get(`${GLOBAL.url}/getXmlRide/${id}`, {
      headers: headers,
    });
  }
}
