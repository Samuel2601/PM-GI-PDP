import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GLOBAL } from './GLOBAL';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
@Injectable({
	providedIn: 'root',
})
export class AdminService {
	public url;
	
	constructor(private _http: HttpClient) {
		this.url = GLOBAL.url;
	}
	agregar_ctacontable( token: any,data: any):Observable<any>{
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.post(this.url + 'agregar_ctacontable', data, { headers: headers });
	}

	agregar_proveedor( token: any,data: any):Observable<any>{
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.post(this.url + 'agregar_proveedor', data, { headers: headers });
	}
	listar_proveedor( token: any):Observable<any>{
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_proveedor', { headers: headers });
	}
	listar_ctacontable( token: any):Observable<any>{
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_ctacontable', { headers: headers });
	}

	getapitoken():Observable<any>{
		return this._http.get('./assets/tokendigitalocean.json')
	}
	actualizzas_dash( token: any,data: any):Observable<any>{
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'actualizzas_dash', data, { headers: headers });
	}

	getDashboar_estudiante(token:any):Observable<any>{
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'getDashboar_estudiante', {
			headers: headers,
		});
	}
	obtener_info_admin(token:any):Observable<any>{
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_info_admin', {
			headers: headers,
		});
	}
	obtener_config_plana(token:any):Observable<any>{
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_config_plana', {
			headers: headers,
		});
	}
	obtener_institucion(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_institucion/' + id, { headers: headers });
	}
	crear_config_plana(data: any): Observable<any> {
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.post(this.url + 'crear_config_plana', data, {
			headers: headers,
		});
	}
	actualizar_config_plana(id: any, data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'actualizar_config_plana/' + id, data, {
			headers: headers,
		});
	}

	conec_api(token:any):Observable<any>{
		const apiKey= 'DO002CF4YQ6CAA3PMRBF'
		const httpOptions = {
			headers: new HttpHeaders({
			  'Content-Type': 'application/json',
			  'Authorization': 'Bearer ' + apiKey
			})
		  };

		//const token = 'dop_v1_bdb76a778174aeda31018939d47d5c2be8763f6c8ba98d67c740b7a0a6b83655';
		const headers = { 'Authorization': `Bearer ${token}` };
		
		
		const url = 'https://api.digitalocean.com/v2/customers/my/billing_history';
	  
		return this._http.get(url, { headers });
		//return this._http.get(url, httpOptions);
	}

	balance(token:any):Observable<any>{
		const apiKey= 'DO002CF4YQ6CAA3PMRBF'
		const httpOptions = {
			headers: new HttpHeaders({
			  'Content-Type': 'application/json',
			  'Authorization': 'Bearer ' + apiKey
			})
		  };

		//const token = 'dop_v1_bdb76a778174aeda31018939d47d5c2be8763f6c8ba98d67c740b7a0a6b83655';
		const headers = { 'Authorization': `Bearer ${token}` };
		
		
		const url2 = "https://api.digitalocean.com/v2/customers/my/balance";
	  
		return  this._http.get(url2, { headers });
		//return this._http.get(url, httpOptions);
	}

	obtener_ip_admin(): Observable<any> {
		return this._http.get('https://api.ipify.org/?format=json');
	}
	obtener_data_admin(ip: any): Observable<any> {
		return this._http.get('https://ipapi.co/' + ip + '/json');
	}
	cambiar_base(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'cambiar_base', data, {
			headers: headers,
		});
	}
	facturacion(wsdl: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			//"mode": 'no-cors',
			//Authorization: token
		});
		return this._http.post('http://181.113.65.229:8080/interfaceFacturaWeb/index.xhtml?', wsdl, {
			headers: headers,
		});
	}
	registro_estudiante(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.post(this.url + 'registro_estudiante', data, { headers: headers });
	}
	registro_estudiante_masivo(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.post(this.url + 'registro_estudiante_masivo', data, { headers: headers });
	}

	registro_admin(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.post(this.url + 'registro_admin', data, { headers: headers });
	}
	obtener_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_admin/' + id, { headers: headers });
	}
	actualizar_admin(id: any, data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'actualizar_admin/' + id, data, {
			headers: headers,
		});
	}
	actualizar_admininstitucion(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'actualizar_admininstitucion/' + id, {
			headers: headers,
		});
	}
	eliminar_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'eliminar_admin/' + id, { headers: headers });
	}

	eliminar_estudiante_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'eliminar_estudiante_admin/' + id, {
			headers: headers,
		});
	}
	reactivar_estudiante_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'reactivar_estudiante_admin/' + id, {
			headers: headers,
		});
	}

	crear_pension_estudiante(data: any): Observable<any> {
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.post(this.url + 'crear_pension_estudiante', data, {
			headers: headers,
		});
	}

	login_admin(data: any): Observable<any> {
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.post(this.url + 'login_admin', data, { headers: headers });
	}
	forgotpassword(data: any): Observable<any> {
		let headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this._http.post(this.url + 'forgotpassword', data, { headers: headers });
	}
	newpassword(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.post(this.url + 'newpassword', data, { headers: headers });
	}

	registrar_admin(data: any, file: any): Observable<any> {
		let headers = new HttpHeaders({ Authorization: 'registroadmin' });
		const fd = new FormData();
		fd.append('titulo', data.titulo);
		fd.append('pais', data.pais);
		fd.append('provincia', data.provincia);
		fd.append('canton', data.canton);
		fd.append('parroquia', data.parroquia);
		fd.append('calle1', data.calle1);
		fd.append('calle2', data.calle2);
		fd.append('codigopostal', data.codigopostal);
		fd.append('referencia', data.referencia);
		fd.append('telefonocon', data.telefonocon);
		fd.append('telefonoinsti', data.telefonoinsti);
		fd.append('nombres', data.nombres);
		fd.append('apellidos', data.apellidos);
		fd.append('email', data.email);
		fd.append('password', data.passwordadmin);
		fd.append('telefono', data.telefono);
		fd.append('dni', data.dni);
		fd.append('base', data.base);
		fd.append('portada', file);
		return this._http.post(this.url + 'registrar_admin', fd, { headers: headers });
	}

	listar_estudiantes_tienda(token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_estudiantes_tienda', { headers: headers });
	}

	listar_pensiones_estudiantes_tienda(token: any,id:any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_pensiones_estudiantes_tienda/'+id, {
			headers: headers,
		});
	}
	listar_admin(token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_admin', { headers: headers });
	}
	listar_admininstitucion(token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_admininstitucion', { headers: headers });
	}

	listar_registro(token: any, desde: any, hasta: any): Observable<any> {
		let headers = new HttpHeaders({
		  'Content-Type': 'application/json',
		  Authorization: token,
		});
		
		// Usamos comillas inversas para interpolar las variables en la URL
		return this._http.get(`${this.url}listar_registro/${desde}/${hasta}`, { headers: headers });
	  }

	obtener_estudiante_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_estudiante_admin/' + id, {
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

	get_categorias(): Observable<any> {
		return this._http.get('./assets/categorias.json');
	}

	listar_etiquetas_admin(token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_etiquetas_admin', { headers: headers });
	}

	eliminar_etiqueta_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.delete(this.url + 'eliminar_etiqueta_admin/' + id, {
			headers: headers,
		});
	}

	agregar_etiqueta_admin(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.post(this.url + 'agregar_etiqueta_admin', data, {
			headers: headers,
		});
	}

	registro_documento_admin(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({ Authorization: token });
		const fd = new FormData();
		fd.append('documento', data.documento);
		fd.append('valor', data.valor);
		fd.append('descripcion', data.descripcion);
		fd.append('contenido', data.contenido);
		fd.append('cuenta', data.cuenta);
		fd.append('f_deposito', data.f_deposito);

		return this._http.post(this.url + 'registro_documento_admin', fd, {
			headers: headers,
		});
	}

	listar_documentos_admin(token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_documentos_admin', { headers: headers });
	}

	obtener_documento_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_documento_admin/' + id, {
			headers: headers,
		});
	}

	listar_etiquetas_documento_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_etiquetas_documento_admin/' + id, {
			headers: headers,
		});
	}

	eliminar_etiqueta_documento_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.delete(this.url + 'eliminar_etiqueta_documento_admin/' + id, {
			headers: headers,
		});
	}

	agregar_etiqueta_documento_admin(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.post(this.url + 'agregar_etiqueta_documento_admin', data, {
			headers: headers,
		});
	}

	actualizar_documento_admin(data: any, id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'actualizar_documento_admin/' + id, data, {
			headers: headers,
		});
	}

	listar_variedades_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_variedades_admin/' + id, {
			headers: headers,
		});
	}

	actualizar_documento_variedades_admin(data: any, id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'actualizar_documento_variedades_admin/' + id, data, {
			headers: headers,
		});
	}

	eliminar_variedad_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.delete(this.url + 'eliminar_variedad_admin/' + id, {
			headers: headers,
		});
	}

	agregar_nueva_variedad_admin(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.post(this.url + 'agregar_nueva_variedad_admin', data, {
			headers: headers,
		});
	}

	listar_inventario_documento_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_inventario_documento_admin/' + id, {
			headers: headers,
		});
	}

	registro_inventario_documento_admin(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.post(this.url + 'registro_inventario_documento_admin', data, {
			headers: headers,
		});
	}

	agregar_imagen_galeria_admin(id: any, data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({ Authorization: token });

		const fd = new FormData();
		fd.append('_id', data._id);
		fd.append('imagen', data.imagen);
		return this._http.put(this.url + 'agregar_imagen_galeria_admin/' + id, fd, {
			headers: headers,
		});
	}

	eliminar_imagen_galeria_admin(id: any, data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'eliminar_imagen_galeria_admin/' + id, data, {
			headers: headers,
		});
	}

	verificar_token(token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'verificar_token', { headers: headers });
	}

	registro_cupon_admin(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.post(this.url + 'registro_cupon_admin', data, { headers: headers });
	}

	listar_cupones_admin(token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_cupones_admin', { headers: headers });
	}

	obtener_cupon_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_cupon_admin/' + id, { headers: headers });
	}

	actualizar_cupon_admin(id: any, data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'actualizar_cupon_admin/' + id, data, {
			headers: headers,
		});
	}

	eliminar_cupon_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.delete(this.url + 'eliminar_cupon_admin/' + id, {
			headers: headers,
		});
	}

	cambiar_vs_documento_admin(id: any, estado: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'cambiar_vs_documento_admin/' + id + '/' + estado, {
			headers: headers,
		});
	}

	obtener_config_admin(token: any): Observable<any> {
		let headers = new HttpHeaders({ 'Content-Type': 'application/json', Authorization: token });
		return this._http.get(this.url + 'obtener_config_admin', { headers: headers });
	}

	actualizar_config_admin(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'actualizar_config_admin', data, {
			headers: headers,
		});
	}

	isAuthenticate() {
		const token: any = localStorage.getItem('token');

		try {
			const helper = new JwtHelperService();
			var decodedToken = helper.decodeToken(token);

			if (!token) {
				localStorage.clear();
				return false;
			}

			if (!decodedToken) {
				localStorage.clear();
				return false;
			}

			if (helper.isTokenExpired(token)) {
				localStorage.clear();
				return false;
			}
		} catch (error) {
			//console.log(error);

			localStorage.clear();
			return false;
		}

		return true;
	}

	obtener_pagos_admin(token: any, desde: any, hasta: any): Observable<any> {
		let headers = new HttpHeaders({
		  'Content-Type': 'application/json',
		  Authorization: token,
		});
		
		// Usamos comillas inversas para interpolar las variables en la URL
		return this._http.get(`${this.url}obtener_pagos_admin/${desde}/${hasta}`, { headers: headers });
	}
	obtener_pagos_dash(token: any, desde: any, hasta: any): Observable<any> {
		let headers = new HttpHeaders({
		  'Content-Type': 'application/json',
		  Authorization: token,
		});
		
		// Usamos comillas inversas para interpolar las variables en la URL
		return this._http.get(`${this.url}obtener_pagos_dash/${desde}/${hasta}`, { headers: headers });
	}


	obtener_detallespagos_admin(token: any, id:any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token
		});
		return this._http.get(this.url + 'obtener_detallespagos_admin/'+id, { headers: headers });
	}

	obtener_detalles_ordenes_estudiante_abono(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_detalles_ordenes_estudiante_abono/' + id, {
			headers: headers,
		});
	}
	obtener_becas_conf(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_becas_conf/' + id, {
			headers: headers,
		});
	}
	obtener_detalles_ordenes_rubro(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_detalles_ordenes_rubro/' + id, {
			headers: headers,
		});
	}
	obtener_detalles_ordenes_estudiante(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_detalles_ordenes_estudiante/' + id, {
			headers: headers,
		});
	}

	obtener_detalles_por_estudiante(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_detalles_por_estudiante/' + id, {
			headers: headers,
		});
	}

	obtenerPago(id: any): Observable<any> {
		let headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer TEST-1565437970717712-100416-3da5767dad6b8dfef6c0563925dadf81-612621626');
		return this._http.get('https://api.mercadopago.com/v1/payments/' + id, {
			headers: headers,
		});
	}

	marcar_finalizado_orden(id: any, data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'marcar_finalizado_orden/' + id, data, {
			headers: headers,
		});
	}
	eliminar_finalizado_orden(id: any, data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'eliminar_finalizado_orden/' + id, data, {
			headers: headers,
		});
	}

	eliminar_orden_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.delete(this.url + 'eliminar_orden_admin/' + id, {
			headers: headers,
		});
	}
	/*
	eliminar_orden_pm(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.delete(this.url + 'eliminar_orden_pm/' + id, {
			headers: headers,
		});
	}*/

	eliminar_documento_admin(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.delete(this.url + 'eliminar_documento_admin/' + id, {
			headers: headers,
		});
	}

	marcar_envio_orden(id: any, data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'marcar_envio_orden/' + id, data, {
			headers: headers,
		});
	}

	confirmar_pago_orden(id: any, data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.put(this.url + 'confirmar_pago_orden/' + id, data, {
			headers: headers,
		});
	}

	obtener_direccion_todos_estudiante(id: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'obtener_direccion_todos_estudiante/' + id, {
			headers: headers,
		});
	}

	registro_compra_manual_estudiante(data: any, token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.post(this.url + 'registro_compra_manual_estudiante', data, {
			headers: headers,
		});
	}

	listar_documento_documentos_admin(token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_documento_documentos_admin', {
			headers: headers,
		});
	}

	//Registro PAGO
	listar_estudiantes_pago(token: any): Observable<any> {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: token,
		});
		return this._http.get(this.url + 'listar_estudiantes_pago', { headers: headers });
	}


}
