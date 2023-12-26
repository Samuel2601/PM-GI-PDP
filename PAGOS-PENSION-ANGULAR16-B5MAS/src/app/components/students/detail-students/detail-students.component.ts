
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import { GLOBAL } from 'src/app/service/GLOBAL';
import { EstudianteService } from 'src/app/service/student.service';
import { ConfigService } from 'src/app/service/config.service';
import iziToast from 'izitoast';
declare var $: any;
@Component({
  selector: 'app-detail-students',
  templateUrl: './detail-students.component.html',
  styleUrls: ['./detail-students.component.scss']
})

export class DetailStudentsComponent implements OnInit {
	public estudiante: any = {};
	public id: string = '';
	public pago: any = {};
	public total_pagar = 0;
	public fecha: Array<any> = [];
	public pagopension: Array<any> = [];
	public detalles: any = {};
	public auxbecares = 0;
	public pensionesestudiante: any = {};
	public idexpension = 0;

	public config: any = {};

	public load_del = true;
	public pension: any = {};
	public idpension = -1;
	public auxmes = 0;
	public condicion = 'No';
	public review: any = {};
	public load_send = false;
	public load_conf_pago = false;
	public load_final = false;
	public tracking = '';
	public diciembre: any;
	public load_btn = false;
	public load_data = true;
	public token = localStorage.getItem('token');
	public url = GLOBAL.url;
	public p: any = [];
	public arr_pagos: Array<any> = [];
	public arr_becas: Array<any> = [];
	public load_pension = false;
	public load_todapension = false;
	constructor(
		private _route: ActivatedRoute,

		private _estudianteService: EstudianteService,
		private _adminService: AdminService,
		private _router: Router,
    private progressBarService: ConfigService
	) {}

	ngOnInit(): void {
		(function () {
			'use strict';

			// Fetch all the forms we want to apply custom Bootstrap validation styles to
			var forms = document.querySelectorAll('.needs-validation');

			// Loop over them and prevent submission
			Array.prototype.slice.call(forms).forEach(function (form) {
				form.addEventListener(
					'submit',
					function (event: { preventDefault: () => void; stopPropagation: () => void }) {
						if (!form.checkValidity()) {
							event.preventDefault();
							event.stopPropagation();
						}

						form.classList.add('was-validated');
					},
					false
				);
			});
		})();

		this._route.params.subscribe((params) => {
			this.id = params['id'];

			this._estudianteService.obtener_estudiante_guest(this.id, this.token).subscribe(
				(response) => {
					//////console.log(response);
					if (response.data == undefined) {
						this.estudiante = undefined;
						this.load_data = false;
					} else {
						this.estudiante = response.data;
						////console.log("estudiante",this.estudiante);
						this.load_data = false;

						this.init_data();
					}
				},
				(error) => {}
			);
		});
	}
	init_data() {
		this.load_todapension = false;
		this._adminService.obtener_config_admin(this.token).subscribe((response) => {
			//////console.log(response);
			this.config = response.data[0];
			//////console.log(this.config);
			this._estudianteService.obtener_pension_estudiante_guest(this.id, this.token).subscribe((response) => {
				this.pensionesestudiante = response.data;
				this.load_todapension = true;
				////console.log("pensionesestudiante",this.pensionesestudiante);
				this.detalle_data(this.pensionesestudiante.length - 1);
			});
		});
	}

	detalle_data(val: any) {
    this.progressBarService.setProgress(this.progressBarService.getProgress()+10);
		this.load_pension = false;

		this.total_pagar = 0;
		this.idexpension = val;
		//console.log(this.estudiante);
		//////console.log(this.estudiante._id);
		////console.log("Pension this.pensionesestudiante[this.idexpension]",this.pensionesestudiante[this.idexpension]);
		var auxmeses=0;
		//////console.log('fecha', this.estudiante.f_desac,'Estado',this.estudiante.estado);
		if (this.estudiante.f_desac != undefined && this.estudiante.estado == 'Desactivado') {
			let mes =
				(new Date(this.estudiante.f_desac).getFullYear() -
					new Date(this.pensionesestudiante[this.idexpension].anio_lectivo).getFullYear()) *
				12;
			mes -= new Date(this.pensionesestudiante[this.idexpension].anio_lectivo).getMonth();
			mes += new Date(this.estudiante.f_desac).getMonth();
			if (mes > 10) {
				auxmeses = 10;
			} else {
				auxmeses = mes + 1;
			}
		} else {
			auxmeses = 10;
		}

		this._adminService
			.obtener_detalles_ordenes_estudiante_abono(this.pensionesestudiante[this.idexpension]._id, this.token)
			.subscribe((response) => {
				////console.log("arr_pagos",response.abonos);
				////console.log("arr_becas",response.becas);
				this.arr_pagos = response.abonos;
				this.arr_becas = response.becas;
        this.progressBarService.setProgress(this.progressBarService.getProgress()+10);
				this._adminService.obtener_detalles_por_estudiante(this.id, this.token).subscribe((response) => {
					//////console.log(response);
					if (response.data != undefined) {
						this.pago = response.data;
						////console.log("pago",this.pago);
						this.detalles = response.detalles;
						////console.log("detalles",this.detalles);
						this.armado(auxmeses);
						//this.load_data = false;
					} //else{
					// this.pago = undefined;
					// this.load_data = false;
					// }
				});
				////console.log(this.arr_etiquetas);
			});

		//////console.log(auxmeses);
	}
	armado(tiempo: any) {
    this.progressBarService.setProgress(this.progressBarService.getProgress()+20);
		//console.log(this.pensionesestudiante[this.idexpension]);
		this.auxbecares = 0;
		this.total_pagar = 0;
		////console.log(this.detalles);
		var f = this.pensionesestudiante[this.idexpension].anio_lectivo;
		if (this.pensionesestudiante[this.idexpension].num_mes_beca != undefined) {
			this.auxbecares = this.pensionesestudiante[this.idexpension].num_mes_beca;
		}
		//console.log(this.auxbecares);
		this.condicion = this.pensionesestudiante[this.idexpension].condicion_beca;
		if (this.detalles != undefined) {
			this.pagopension = [];
			let est;
			let valor=0;
			let idpago: any = [];
			let tipo;
			for (var j = 0; j <= tiempo; j++) {
				est = 'Sin Pago';
				valor = 0;
				idpago = undefined;
				tipo = 'no';
				idpago = [];
				for (let k = 0; k < this.detalles.length; k++) {
					if (
						j == this.detalles[k].tipo &&
						this.detalles[k].idpension == this.pensionesestudiante[this.idexpension]._id
					) {
						est = this.detalles[k].estado;
						valor += this.detalles[k].valor;
						idpago.push(this.detalles[k].pago);
						tipo = this.detalles[k].tipo;
					}
				}
				if (new Date(this.detalles[j])) {
				}

				if (j == 0) {
					if (
						(this.pensionesestudiante[this.idexpension].matricula == 1 && valor != 0) ||
						this.pensionesestudiante[this.idexpension].matricula == 0
					) {
						this.total_pagar = this.total_pagar + this.config.matricula;
					}
					//  ////console.log('Matricula',this.config.matricula);
				} else {
					//  ////console.log('Mes',new Date(new Date(f).setMonth(new Date(f).getMonth()+j-1)).getMonth());
					if (new Date(new Date(f).setMonth(new Date(f).getMonth() + j - 1)).getMonth() == 11 && j != 0) {
						// ////console.log('Pension',this.config.pension);
						this.diciembre = new Date(f).setMonth(new Date(f).getMonth() + j - 1);
						this.total_pagar = this.total_pagar + this.config.pension;
					} else {
						if (this.auxbecares != undefined && j > 0 && j <= this.auxbecares) {
							//  ////console.log('Beca',this.pensionesestudiante[this.idexpension].val_beca);
							this.total_pagar = this.total_pagar + this.pensionesestudiante[this.idexpension].val_beca;
						} else {
							if (j != 0) {
								//  ////console.log('Pension',this.config.pension);
								this.total_pagar = this.total_pagar + this.config.pension;
							}
						}
					}
				}
				this.total_pagar = this.total_pagar - valor;
				// ////console.log(this.total_pagar);

				this.p.push({ pago: idpago, tp: tipo });
				if (j == 0) {
					var porpagar = this.pensionesestudiante[this.idexpension].idanio_lectivo.matricula - valor;
					if (this.pensionesestudiante[this.idexpension].paga_mat == 1) {
						porpagar = 0;
					}
					this.pagopension.push({
						date: 'Matricula',
						estado: est,
						valor: valor,
						pago: idpago,
						tipo: tipo,
						porpagar: porpagar,
					});
				} else {
					var porpagar = this.pensionesestudiante[this.idexpension].idanio_lectivo.pension - valor;
					var beca = 0;
					if (this.pensionesestudiante[this.idexpension].condicion_beca == 'Si') {
						this.arr_becas.forEach((element: any) => {
							if (
								new Date(new Date(f).setMonth(new Date(f).getMonth() + j - 1)).getTime() ==
								new Date(element.titulo).getTime()
							) {
								porpagar = this.pensionesestudiante[this.idexpension].val_beca - valor;
								beca = 1;
							}
						});
					}

					this.pagopension.push({
						date: new Date(f).setMonth(new Date(f).getMonth() + j - 1),
						estado: est,
						valor: valor,
						pago: idpago,
						tipo: tipo,
						porpagar: porpagar,
						beca: beca,
					});
				}
				//this.pension[this.pension.length-1].pago.push(idpago);
			}

			// ////console.log(this.pagopension);
		}
    this.progressBarService.setProgress(this.progressBarService.getProgress()+50);
		this.total_pagar = 0;
		this.pagopension.forEach((element: any) => {
			this.total_pagar += element.porpagar;
		});
    this.progressBarService.setProgress(this.progressBarService.getProgress()+10);
		this.load_pension = true;
    this.progressBarService.setProgress(0);
		//console.log("Pagos Pension",this.pagopension);
	}
	imprimir(){
		let printContents,titulo;
		printContents = document.getElementById('impresion')?.innerHTML;
		titulo= document.getElementById('titulo')?.innerHTML;
		const plantillaHTML =`
		<html>
		  <head>
			<title>` +
					this.estudiante.nombres +
					` ` +
					this.estudiante.apellidos + ` `+this.pensionesestudiante[this.idexpension].curso + this.pensionesestudiante[this.idexpension].paralelo +
					`(` +
					new Date(this.pensionesestudiante[this.idexpension].anio_lectivo).getFullYear() +
					`)</title>
					
		   <style>

		  .nav-link{
			color: #000 !important;
		  }
		  td {
			border:  1px solid;
		  }
		  tr {
			border:  1px solid;
		  }
		  th {
			border:  1px solid;
		  }
		  thead.th {
			border:  1px solid;
		  }
		   </style>
		   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
	
		  </head>
			<body>
		  ${titulo}
	   
			<table style="border-collapse: collapse;text-align:center; margin-top: 7%;margin-right: auto;
			margin-left: auto; max-width: 50%;"  class="table table-bordered">
				${printContents}
			</table>
				
			</body>

		</html>`;
		const popupWin = window.open('', 'Reporte', 'top=0,left=0,height=auto,width=auto');

		if (popupWin&&printContents) { // Comprueba si la ventana emergente se abrió correctamente
		  popupWin.document.open();  
		  popupWin.document.write(plantillaHTML);
	
		  setTimeout(() => {
			// Imprime el contenido en la ventana emergente
			popupWin.print();
			//popupWin.close();
		  }, 1000);	
	
		} else {
		  console.error("No se pudo abrir la ventana emergente.");
		}
	}
}
