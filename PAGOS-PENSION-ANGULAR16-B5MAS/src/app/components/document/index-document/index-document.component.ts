import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/service/admin.service';
import { GLOBAL } from 'src/app/service/GLOBAL';

import iziToast from 'izitoast';
declare var $: any;

@Component({
  selector: 'app-index-document',
  templateUrl: './index-document.component.html',
  styleUrls: ['./index-document.component.scss']
})

export class IndexDocumentComponent implements OnInit {
	public documentos: Array<any> = [];
	public documentos_const: Array<any> = [];
	public token = localStorage.getItem('token');
	public page = 1;
	public pageSize = 10;
	public filtro = '';
	public rol: any;
	public load_btn_etiqueta = false;
	public load_data_etiqueta = false;
	public nueva_etiqueta = '';
	public etiquetas: Array<any> = [];
	public load_del_etiqueta = false;
	public load_btn = false;
	public load = false;
	public aux: any;
	public load_estado = false;
	public url = GLOBAL.url;
	public total = 0;
	public load_data_doc = true;
	public vc = 0;
	constructor(private _adminService: AdminService) {}

	ngOnInit(): void {
		let aux = localStorage.getItem('identity');
		this._adminService.obtener_admin(aux, this.token).subscribe((response) => {

			if(response.data){
				this.rol = response.data.rol;
				this.aux = response.data.email;
				this.init_data();
				////console.log(this.rol);
			}else{
				let user= JSON.parse(localStorage.getItem('user_data')!);

				if(!this.rol){
					this.rol=user.rol;
					this.aux = user.email;
					this.init_data();
				}
			}

		});
	}

	init_data() {
		this.documentos = [];
		this.documentos_const = [];
		this.load = true;
		this.load_data_doc = true;
		this._adminService.listar_documentos_admin(this.token).subscribe((response) => {
      //console.log(response.data.map((element:any)=>element._id));
			this.documentos_const = response.data;

			this.documentos_const.forEach((element) => {
				this.documentos.push({ ckechk: 0, element });
			});
			//this.documentos = this.documentos_const;
			//console.log(this.documentos);
			this.load = false;
			this.load_data_doc = false;
		});
	}
	public fact: Array<any> = [];
	obtener(id:any){
		if(this.fact.find((element:any)=>element.id==id)==undefined){
			this._adminService.obtener_documento_admin(id,this.token).subscribe((response)=>{
				if(response.fact){
					this.fact.push({id:id,fact:response.fact});
				}
				//console.log(this.fact);
			});
		}


	}
	editar(element:any){
		//console.log(element);
		if(element.valor>0){
			this._adminService.actualizar_documento_admin(element,element._id,this.token).subscribe((response)=>{
				//console.log(response);
				if(response.data.ok==1){
					iziToast.success({
						title: 'ÉXITOSO',
						position: 'topRight',
						message: 'Actualizado con exito',
					});
				}
			});
		}else{
			iziToast.error({
				title: 'ERROR',
				position: 'topRight',
				message: 'Tiene que ser 0 o más',
			});
		}

	}
	select_todo() {
		if (this.total == 1) {
			this.documentos.forEach((element: any) => {
				element.ckechk = 0;
			});
		} else {
			this.documentos.forEach((element: any) => {
				element.ckechk = 1;
			});
		}
	}
	eliminar_todo() {
		this.load_data_doc = true;
		//this.load_data_est=true;
		//////console.log(id);
		var con = 0;
		let ultimo = 0;
		this.documentos.forEach((element) => {
			if (element.ckechk == 1) {
				ultimo++;
			}
		});
		////console.log(ultimo);
		this.documentos.forEach((element: any) => {
			if (element.ckechk == 1) {
				this._adminService.eliminar_documento_admin(element.element._id, this.token).subscribe(
					(response) => {
						con++;
						if (con == ultimo) {
							iziToast.success({
								title: 'ÉXITOSO',
								position: 'topRight',
								message: 'Se eliminó correctamente el(los) documento.' + '(' + con + ')',
							});
							this.total = 0;
							$('#delete-todo').modal('hide');
							$('.modal-backdrop').removeClass('show');
							this.init_data();
						}
						//this.recarga();
					},
					(error) => {
						//////console.log(error);
					}
				);
			}
		});
	}
	filtrar_documento() {
		this.documentos=[];
		if (this.filtro) {
			var term = new RegExp(this.filtro.toString().trim(), 'i');

			this.documentos_const.forEach((element) => {
				this.documentos.push({ ckechk: 0, element });
			});

			this.documentos = this.documentos.filter(
				(item) => term.test(item.element.documento)
				|| term.test(item.element._id)
				|| term.test(item.element.cuenta)
				|| term.test(item.element.createdAt)
			);
		} else {
			this.documentos_const.forEach((element) => {
				this.documentos.push({ ckechk: 0, element });
			});
		}
	}
	eliminar(id: any) {
		//////console.log(id);
		this._adminService.eliminar_documento_admin(id, this.token).subscribe(
			(response) => {
				if (response.message == 'Eliminado con exito') {
					iziToast.success({
						title: 'ÉXITOSO',
						position: 'topRight',
						message: response.message,
					});
				} else {
					iziToast.error({
						title: 'ERROR',
						position: 'topRight',
						message: response.message,
					});
				}

				$('#delete-' + id).modal('hide');
				$('.modal-backdrop').removeClass('show');

				this.ngOnInit();
			},
			(error) => {
				//////console.log(error);
			}
		);
	}
}
