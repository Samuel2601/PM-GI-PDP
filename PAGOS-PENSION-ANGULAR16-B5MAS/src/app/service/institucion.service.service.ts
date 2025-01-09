import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';

@Injectable({
  providedIn: 'root',
})
export class InstitucionServiceService {
  private url;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getTypeInstitucion(name: any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.get(
      this.url + 'instituciones/tipo-escuela?base=' + name,
      { headers: headers }
    );
  }
}
