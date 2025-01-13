import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GLOBAL } from '../GLOBAL';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly baseUrl = GLOBAL.url + 'http://localhost:3000'; // Cambia la URL base según tu configuración

  constructor(private http: HttpClient) {}

  // Obtener encabezados con token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Categorías
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categoria`, {
      headers: this.getHeaders(),
    });
  }

  getCategoryById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/categoria/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Bodegas
  getWarehouses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/bodega`, {
      headers: this.getHeaders(),
    });
  }

  getWarehouseById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/bodega/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Variantes
  getVariants(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/variante`, {
      headers: this.getHeaders(),
    });
  }

  getVariantById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/variante/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Productos
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/producto`, {
      headers: this.getHeaders(),
    });
  }

  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/producto/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/producto`, product, {
      headers: this.getHeaders(),
    });
  }

  updateProduct(id: string, product: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/producto/${id}`, product, {
      headers: this.getHeaders(),
    });
  }

  getProductStock(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/producto/${id}/stock`, {
      headers: this.getHeaders(),
    });
  }

  // Movimientos de inventario
  getInventoryMovements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/movimiento-inventario`, {
      headers: this.getHeaders(),
    });
  }

  getInventoryMovementById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/movimiento-inventario/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createInventoryMovement(movement: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/movimiento-inventario`,
      movement,
      {
        headers: this.getHeaders(),
      }
    );
  }

  // Guías de envío
  getShippingGuides(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/inventario/guia`, {
      headers: this.getHeaders(),
    });
  }

  createShippingGuide(guide: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/inventario/guia`, guide, {
      headers: this.getHeaders(),
    });
  }

  // Marcas
  getBrands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/marca`, {
      headers: this.getHeaders(),
    });
  }
}
