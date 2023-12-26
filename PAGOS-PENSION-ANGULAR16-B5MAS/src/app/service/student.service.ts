import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GLOBAL } from './GLOBAL';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class EstudianteService {
	public url;
	public fact;
	constructor(private _http: HttpClient) {
		this.url = GLOBAL.url;
		this.fact = GLOBAL.fact;
	}

	listar_estudiantes_filtro_admin(tipo: any, filtro: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_estudiantes_filtro_admin/' + tipo + '/' + filtro, {
			headers: headers,
		});
	}

	registro_estudiante_admin(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.post(this.url + 'registro_estudiante_admin', data, {
			headers: headers,
		});
	}

	obtener_estudiante_guest(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_estudiante_guest/' + id, {
			headers: headers,
		});
	}
	obtener_pension_estudiante_guest(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_pension_estudiante_guest/' + id, {
			headers: headers,
		});
	}

	actualizar_estudiante_admin(id: any, data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'actualizar_estudiante_admin/' + id, data, {
			headers: headers,
		});
	}

	eliminar_estudiante_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.delete(this.url + 'eliminar_estudiante_admin/' + id, {
			headers: headers,
		});
	}
}
