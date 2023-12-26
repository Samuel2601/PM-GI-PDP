
import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/service/admin.service';
declare var $: any;
import iziToast from 'izitoast';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-index-payments',
  templateUrl: './index-payments.component.html',
  styleUrls: ['./index-payments.component.scss']
})

export class IndexPaymentsComponent implements OnInit {
	public pagos: Array<any> = [];
	public pagos_const: Array<any> = [];
	public total_monto: Array<any> = [];
	public auxtotal = 0;
	public const_pagos: Array<any> = [];
	public token = localStorage.getItem('token');
	public page = 1;
	public pageSize = 10;
	public filtro = '';
	public desde: any = new Date();
	public hasta: any = new Date();

	
	public load = false;
	public rol: any;
	public aux: any;
	public total = 0;
	public vc = 0;
	constructor(private _adminService: AdminService) {}

	ngOnInit(): void {
		// Restar un mes a la fecha "desde"
		this.desde.setDate(this.desde.getDate() - 1);
//this.desde.setMonth(this.desde.getMonth() - 1);

		this.pagos = [];
		this.pagos_const = [];
		let aux = localStorage.getItem('identity');
		this._adminService.obtener_admin(aux, this.token).subscribe((response) => {

			if(response.data){
				this.rol = response.data.rol;
				this.aux = response.data.email;
				this.recarga();
				////console.log(this.rol);
			}else{
				let user= JSON.parse(localStorage.getItem('user_data')!);

				if(!this.rol){
					this.rol=user.rol;
					this.aux = user.email;
					this.recarga();
				}
			}
			
		});
		
		//this.recarga();
	}
	recarga() {
		this.pagos=[];
		this.pagos_const=[];
		this.auxtotal = 0;
		this.load = true;
		this._adminService.obtener_pagos_admin(this.token,this.desde,this.hasta).subscribe((response) => {
			this.auxtotal = 0;
			this.pagos_const = response.data;
			this.pagos_const.forEach((element) => {
				this.pagos.push({ ckechk: 0, element });
			});
			this.pagos.forEach((element: any) => {
				this.auxtotal = element.element.total_pagar + this.auxtotal;
			});
			//console.log(this.pagos);
			this.const_pagos = this.pagos;
			this.load = false;
			this.listar();
		});
		
		// this.auxtotal=parseFloat(this.auxtotal.toFixed(2));
	}


	listar() {
	const requests = this.pagos.map((element: any) => {
		return this._adminService.obtener_detalles_ordenes_estudiante(element.element._id, this.token);
	});

	forkJoin(requests).subscribe((responses) => {
		responses.forEach((response: any, index: number) => {
		if (response.detalles != undefined) {
			this.pagos[index].detalle = response.detalles;
		}
		});

		let arreglar: any[] = [];
		//console.log(this.pagos);

		this.pagos.forEach((element1: any) => {
		let suma = 0;
		//console.log(element1.ckechk, element1.element, element1.detalle, element1);
		if (element1.detalle && element1.detalle.length > 0) {
			element1.detalle.forEach((element2: any) => {
			suma += element2.valor; // Sum the values
			});

			if (parseFloat(suma.toFixed(2))  !== parseFloat(element1.element.total_pagar.toFixed(2))) {
				//console.log(parseFloat(suma.toFixed(2)),parseFloat(element1.element.total_pagar.toFixed(2)),parseFloat(suma.toFixed(2))  !== parseFloat(element1.element.total_pagar.toFixed(2)));
			arreglar.push(element1);
			}
		}
		});

		//console.log(arreglar);
	});
	}


	filtrar_pagos() {
		this.pagos = [];
		this.auxtotal = 0;
		if (this.filtro) {
			var term = new RegExp(this.filtro.toString().trim(), 'i');
			this.pagos_const.forEach((element) => {
				this.pagos.push({ ckechk: 0, element });
			});
			this.pagos = this.pagos.filter(
				(item) =>
					term.test(item.element._id) ||
					term.test(item.element.estudiante.nombres) ||
					term.test(item.element.estudiante.apellidos) ||
					term.test(item.element.dni)||
					term.test(item.element.estado)
			);
			this.pagos.forEach((element: any) => {
				this.auxtotal = element.element.total_pagar + this.auxtotal;
			});
		} else {
			this.pagos_const.forEach((element) => {
				this.pagos.push({ ckechk: 0, element });
			});
			this.pagos.forEach((element: any) => {
				this.auxtotal = element.element.total_pagar + this.auxtotal;
			});
		}
		//this.auxtotal=parseFloat(this.auxtotal.toFixed(2));
	}
	select_todo() {
		if (this.total == 1) {
			this.pagos.forEach((element: any) => {
				element.ckechk = 0;
			});
		} else {
			this.pagos.forEach((element: any) => {
				element.ckechk = 1;
			});
		}
	}

	filtrar_fechas() {
		this.recarga();
	}

	reset_data() {
		this.auxtotal = 0;
		this.desde.setMonth(this.desde.getMonth() - 1);
		this.hasta = new Date();;
		this.filtro = '';
		this.pagos = [];
		this.pagos_const=[];
		this.recarga();
	}

	eliminar(id: any) {
		//////console.log(id);
		this._adminService.eliminar_orden_admin(id, this.token).subscribe(
			(response) => {
				if (response.message == 'Eliminado con exito') {
					iziToast.success({
						title: 'SUCCESS',
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
	eliminar_todo() {
		this.load = true;
		//this.load_data_est=true;
		//////console.log(id);
		var con = 0;
		let ultimo = 0;
		this.pagos.forEach((element) => {
			if (element.ckechk == 1) {
				ultimo++;
			}
		});
		////console.log(ultimo);
		this.pagos.forEach((element: any) => {
			if (element.ckechk == 1) {
				this._adminService.eliminar_orden_admin(element.element._id, this.token).subscribe(
					(response) => {
						con++;
						if (con == ultimo) {
							iziToast.success({
								title: 'SUCCESS',
								position: 'topRight',
								message: 'Se eliminó correctamente el(los) pago.' + '(' + con + ')',
							});
							this.total = 0;
							$('#delete-todo').modal('hide');
							$('.modal-backdrop').removeClass('show');
							this.ngOnInit();
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
}
