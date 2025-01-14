import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GLOBAL } from '../GLOBAL';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private readonly baseUrl = GLOBAL.url + 'persona'; // Base URL para las rutas de personas

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

  // Obtener todas las personas
  getPersons(): Observable<any> {
    return this.http.get(this.baseUrl, { headers: this.getHeaders() });
  }

  // Obtener una persona por ID
  getPersonById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Crear una nueva persona
  createPerson(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data, {
      headers: this.getHeaders(),
    });
  }

  // Actualizar una persona
  updatePerson(data: any): Observable<any> {
    return this.http.put(this.baseUrl, data, {
      headers: this.getHeaders(),
    });
  }
}
