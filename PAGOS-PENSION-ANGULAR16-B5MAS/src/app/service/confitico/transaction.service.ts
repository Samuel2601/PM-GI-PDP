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

  getXml_Ride(id: string): Observable<any> {
    const data: any = {
      Operacion: 'C1',
      Fecha1: '2020/01/01',
      Fecha2: '2020/01/01',
      Parametro1: id,
      Parametro2: '',
      Sesion: {
        IdInstitucion: 311505,
        IdOficina: 335006,
        CodigoEmpresa: '0891792143001',
        IdPerfilUsuario: 0,
        Identificacion: '0891792143001',
        CodigoPerfil: '0',
        IdUsuario: 3271,
        FechaSistema: '2025-05-13',
        NombreCompletoUsuario: '',
        NombreCortoUsuario: 'uesarevalo',
        IdTransaccion: 0,
        IPEstacion: '0.00',
        IdEmpresaOperadora: 1655,
      },
    };
    return this.http.post(
      `https://plataforma.geoneg.com:8081/api/Invoice/ConsultaXML_RIDE`,
      {
        headers: this.getHeaders(),
      }
    );
  }
}
