import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import { EstudianteService } from 'src/app/service/student.service';
import { take, catchError } from 'rxjs/operators';

declare var $: any;
import iziToast from 'izitoast';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-create-payments',
  templateUrl: './create-payments.component.html',
  styleUrls: ['./create-payments.component.scss']
})

export class CreatePaymentsComponent implements OnInit {
	public load_btn = false;
	public documentocreate: any = {};
	public rol: any;
	public valores_pensiones = 0;
	public aux_valor_pension = 0;
	public num_pagos = 0;
	public num_pagado = -1;
	public meses_beca = -1;
	public valor_matricula = 0;
	public matricula_pago = -1;
	public tipo = -1;
	public tok = -1;

	public config: any = {};

	public estudiantes_const: Array<any> = [];
	public load_data = false;
	public token = localStorage.getItem('token');

	public filtro_estudiante = '';
	public estudiantes: Array<any> = [];
	public pageEstudiante = 1;
	public pageSizeEstudiante = 10;
	public load_estudiantes = false;

	public direcciones: Array<any> = [];
	public pageDireccion = 1;
	public pageSizeDireccion = 10;
	public load_direcciones = false;
	public direccion_select: any = {};

	public documento: Array<any> = [];
	public auxabono: Array<any> = [];
	public documento_const: Array<any> = [];
	public pageVariedad = 1;
	public pageSizeVariedad = 10;
	public load_documento = false;
	public documento_select: any = undefined;
	public mes: any;

	public fecha: Array<any> = [];

	public fecha2: Array<any> = [];
	public auxmes: any;
	public auxmes1: any;
	public auxmes2: any;
	public auxmes3: any;
	public auxmes4: any;
	public auxmes5: any;
	public auxmes6: any;
	public auxmes7: any;
	public auxmes8: any;
	public auxmes9: any;
	public auxmes10: any;
	public idpension: any = 0;

	public auxvalordeposito = 0;
	public checkfecha: any;

	public valor: number = 1;

	public valorigualdocumento: number = 0;
	public indexpen = -1;

	public pago: any = {};
	public auxpago: any = {};
	public pension: any = {};

	public dpago: Array<any> = [];

	public total_pagar = 0;
	public auxtotalpago: any = 0.0;
	public envio_input = 0;
	public neto_pagar = 0;
	public filtro_documento = '';
	public descuento = 0;
	public yo = 0;
	
	selec_est: any;
	anio_lentivo: any;

	btnbuscardocumento = document.getElementById('btnbuscardocumento') as HTMLButtonElement | undefined;
	btnnuevodocumento = document.getElementById('btnnuevodocumento') as HTMLButtonElement | undefined;
	btnAgregar = document.getElementById('btnAgregar') as HTMLButtonElement | undefined;

	constructor(
		private _adminService: AdminService,
		private _estudianteService: EstudianteService,
		private _router: Router
	) {}

	ngOnInit(): void {
		let aux = localStorage.getItem('identity');
		this._adminService.obtener_admin(aux, this.token).subscribe((response) => {

			if(response.data){
				this.rol = response.data.rol;
				if (response.data.email == 'samuel.arevalo@espoch.edu.ec') {
					this.yo = 1;
				}
				////console.log(this.rol);
			}else{
				let user= JSON.parse(localStorage.getItem('user_data')!);
				if (user.email == 'samuel.arevalo@espoch.edu.ec') {
					this.yo = 1;
				}
				if(!this.rol){
					this.rol=user.rol;
				}
			}

			this._adminService.obtener_config_admin(this.token).pipe(
				take(1),
				catchError(error => {
				  // Manejar errores aquí, por ejemplo, mostrar un mensaje de error.
				  console.error('Error al obtener la configuración administrativa', error);
				  iziToast.error({
					title:'Error',
					position:'topRight',
					message:'No se pudo conectar con el servidor'
				  });
				  return EMPTY; // Puedes devolver EMPTY u otro observable de fallback.
				})
			  ).subscribe((response) => {
				this.config = response.data[0];
				this.num_pagos = this.config.numpension;
				this.valores_pensiones = parseFloat(this.config.pension.toFixed(2));
				this.aux_valor_pension = parseFloat(this.config.pension.toFixed(2));
				this.valor_matricula = parseFloat(this.config.matricula.toFixed(2));
				this.mes = this.config.anio_lectivo;
				this.auxmes = this.config.anio_lectivo;
			  
				if (this.btnbuscardocumento) {
					this.btnbuscardocumento.disabled = true;
				}
				
				if (this.btnnuevodocumento) {
					this.btnnuevodocumento.disabled = true;
				}
				
				if (this.btnAgregar) {
					this.btnAgregar.disabled = true;
				}
			  
				this.init_estudiante();
				this.init_documentos();
			  });
		});
	}

	init_estudiante() {
		// Establece la bandera de carga a verdadero
		this.load_estudiantes = true;
	
		// Llama al servicio para obtener la lista de estudiantes para el pago
		this._adminService.listar_estudiantes_pago(this.token).subscribe(
			(response) => {
				// En caso de éxito, asigna la lista de estudiantes y restablece la constante
				this.estudiantes = response.data;
				this.estudiantes_const = this.estudiantes;
	
				// Establece la bandera de carga a falso
				this.load_estudiantes = false;
			},
			(error) => {
				// En caso de error, recarga la página (puedes querer manejar el error de otra manera)
				console.error('Error al cargar estudiantes:', error);
				iziToast.error({
					title:'Error',
					position:'topRight',
					message:error
				});
			}
		);
	}
	

	func_filtro_estudiante() {
		if (this.filtro_estudiante) {
			var term = new RegExp(this.filtro_estudiante.toString().trim(), 'i');
			this.estudiantes = this.estudiantes_const.filter(
				(item) =>
					term.test(item.nombres) ||
					term.test(item.nombres + ' ' + item.apellidos) ||
					term.test(item.apellidos) ||
					term.test(item.dni)
			);
		} else {
			this.estudiantes = this.estudiantes_const;
		}
	}

	func_filtro_documento() {
		if (this.filtro_documento) {
			var term = new RegExp(this.filtro_documento.toString().trim(), 'i');
			this.documento = this.documento_const.filter((item) => term.test(item.documento));
		} else {
			this.documento = this.documento_const;
		}
	}

	select_estudiante(item: any) {
		// Desactivar idpension si es necesario, según la lógica de tu aplicación
		this.idpension = false;
	  
		// Asignar el estudiante seleccionado y obtener información de pensión
		this.pago.estudiante = item._id;
		this.selec_est = item;
	  
		this._estudianteService.obtener_pension_estudiante_guest(item._id, this.token).subscribe(
		  (response) => {
			if (response.data) {
				
				this.pension = [...response.data ]; // Copiar propiedades de response.data a this.pension
				console.log(response.data,this.pension);
				$('#modalEstudiante').modal('hide');
				$('#input-estudiante').val(`${item.nombres} ${item.apellidos}`);
		
				// Habilitar los botones al seleccionar un estudiante
				$('#btnbuscardocumento, #btnnuevodocumento').prop('disabled', false);
			}else{
				console.error('Error: No hay datos en la respuesta.');
				iziToast.error({
					title:'Error',
					position:'topRight',
					message:'No hay datos en la respuesta.'
				});
			}
		  },
		  (error) => {
			console.error(error);
			iziToast.error({
				title:'Error',
				position:'topRight',
				message:error
			});
		  }
		);
	  }
	  

public idp=-1
public arr_rubro: { idrubro: string ,descripcion:any,valor:any}[]=[];
public arr_rubro_const=[];

	selecct_pension() {
		if (this.idp >= 0) {
			this.arr_rubro = [];
			if (this.isPensionValid(this.idp)) {
				this.updateRubros(this.idp);
				this.updatePensionDetails(this.idp);
			} else {
				this.resetEstudiante();
			}
		} else {
			iziToast.error({
			title: 'ERROR',
			position: 'topRight',
			message: 'Seleccione un Año lectivo',
			});
		}
	}
	resetEstudiante() {
		console.log(this.pago.estudiante);
		//this.pago.estudiante = '';
		iziToast.error({
			title: 'ERROR',
			position: 'topRight',
			message: 'Este estudiante no tiene más pagos por cobrar',
		});
	}
	isPensionValid(i: number): boolean {
	const isValid = (
		this.pension[i].meses <= 10 ||
		(this.pension[i].matricula !== 1 && this.pension[i].paga_mat === 0) ||
		((this.pension[i].extrapagos === undefined && this.pension[i].idanio_lectivo.extrapagos !== undefined) ||
			(JSON.parse(this.pension[i].idanio_lectivo.extrapagos || '[]').length !==
			JSON.parse(this.pension[i].extrapagos || '[]').length))
		);
		
	
		if (isValid) {
			this.arr_rubro_const = JSON.parse(this.pension[i].idanio_lectivo.extrapagos || '[]');
			this.arr_rubro = JSON.parse(this.pension[i].idanio_lectivo.extrapagos || '[]');

			if (this.pension[i].extrapagos) {
			const auxrubro = JSON.parse(this.pension[i].extrapagos);
		
			auxrubro.forEach((item: any) => {
				this.arr_rubro = this.arr_rubro.filter((element: any) => element.idrubro != item.idrubro);
				this.arr_rubro_const = this.arr_rubro_const.filter((element: any) => element.idrubro != item.idrubro);
			});
			}
		
			this.valores_pensiones = this.aux_valor_pension;
			this.idpension = this.pension[i]._id;
			this.matricula_pago = this.pension[i].matricula;
			this.num_pagado = this.pension[i].meses;
			this.tok = this.num_pagado;
			this.auxmes = this.pension[i].anio_lectivo;
			this.indexpen = i;
			this.anio_lentivo = this.pension[i].idanio_lectivo;
			this.config = this.pension[i].idanio_lectivo;
		
			this.num_pagos = this.pension[i].idanio_lectivo.numpension;
			this.valores_pensiones = parseFloat(this.pension[i].idanio_lectivo.pension.toFixed(2));
			this.aux_valor_pension = parseFloat(this.pension[i].idanio_lectivo.pension.toFixed(2));
			this.valor_matricula = parseFloat(this.pension[i].idanio_lectivo.matricula.toFixed(2));
			this.mes = this.pension[i].idanio_lectivo.anio_lectivo;
			this.auxmes = this.pension[i].idanio_lectivo.anio_lectivo;

			if (this.pension[i].condicion_beca == 'Si') {
				this.valores_pensiones = this.pension[i].val_beca;
				this.meses_beca = this.pension[i].num_mes_res;
			}

			this.fecha2 = [];
			for (let j = 0; j < 10; j++) {
				this.fecha2.push({
				date: new Date(this.pension[i].anio_lectivo).setMonth(
					new Date(this.pension[i].anio_lectivo).getMonth() + j
				),
				});
			}
				this.actualizar_valor();

				if (this.fecha.length > 0) {
					return true;  // Retorna false si hay fechas disponibles
				}
				this.habilitarBotones(false);
		} else {
			this.idpension = false;
			/*iziToast.error({
				title: 'ERROR',
				position: 'topRight',
				message: 'Este estudiante no tiene más pagos por cobrar',
			});*/
			//console.log(this.pago.estudiante);
			//this.pago.estudiante = '';
			this.habilitarBotones(true);
		}
	
	return isValid;
	}

	updateRubros(i: number) {
		if (this.pension[i].idanio_lectivo.extrapagos) {
			this.arr_rubro_const = JSON.parse(this.pension[i].idanio_lectivo.extrapagos);
			this.arr_rubro = JSON.parse(this.pension[i].idanio_lectivo.extrapagos);
		
			if (this.pension[i].extrapagos) {
			const auxrubro = JSON.parse(this.pension[i].extrapagos);
		
			auxrubro.forEach((item: any) => {
				this.arr_rubro = this.arr_rubro.filter((element: any) => element.idrubro != item.idrubro);
				this.arr_rubro_const = this.arr_rubro_const.filter((element: any) => element.idrubro != item.idrubro);
			});
			}
		}
	}
	updatePensionDetails(i: number) {
		this.valores_pensiones = this.aux_valor_pension;
		this.idpension = this.pension[i]._id;
		this.matricula_pago = this.pension[i].matricula;
		this.num_pagado = this.pension[i].meses;
		this.tok = this.num_pagado;
		this.auxmes = this.pension[i].anio_lectivo;
		this.indexpen = i;
		this.anio_lentivo = this.pension[i].idanio_lectivo;
		this.config = this.pension[i].idanio_lectivo;
		
		this.num_pagos = this.pension[i].idanio_lectivo.numpension;
		this.valores_pensiones = parseFloat(this.pension[i].idanio_lectivo.pension.toFixed(2));
		this.aux_valor_pension = parseFloat(this.pension[i].idanio_lectivo.pension.toFixed(2));
		this.valor_matricula = parseFloat(this.pension[i].idanio_lectivo.matricula.toFixed(2));
		
		this.num_pagos = this.pension[i].idanio_lectivo.numpension;
		this.valores_pensiones = parseFloat(this.pension[i].idanio_lectivo.pension.toFixed(2));
		this.valor_matricula = parseFloat(this.pension[i].idanio_lectivo.matricula.toFixed(2));
		this.mes = this.pension[i].idanio_lectivo.anio_lectivo;
		this.auxmes = this.pension[i].idanio_lectivo.anio_lectivo;
		
		if (this.pension[i].condicion_beca == 'Si') {
			this.valores_pensiones = this.pension[i].val_beca;
			this.meses_beca = this.pension[i].num_mes_res;
		}
		
		this.fecha2 = [];
		for (let j = 0; j < 10; j++) {
			this.fecha2.push({
			date: new Date(this.pension[i].anio_lectivo).setMonth(
				new Date(this.pension[i].anio_lectivo).getMonth() + j
			),
			});
		}
		this.actualizar_valor();
		if (this.fecha.length > 0) {
			i = -1;
		}
	}
	  


	actualizar_valor() {
		this._adminService
		  .obtener_detalles_ordenes_estudiante_abono(this.idpension, this.token)
		  .subscribe((response) => {
			this.fecha = [];
			const becas = response?.becas;
			let auxmeses;
	  
			if (
			  this.selec_est.f_desac !== undefined &&
			  this.selec_est.estado === 'Desactivado' &&
			  this.selec_est.anio_desac === this.pension[this.indexpen].anio_lectivo
			) {
			  let mes =
				(new Date(this.selec_est.f_desac).getFullYear() -
				  new Date(this.pension[this.indexpen].anio_lectivo).getFullYear()) *
				12;
			  mes -= new Date(this.pension[this.indexpen].anio_lectivo).getMonth();
			  mes += new Date(this.selec_est.f_desac).getMonth();
	  
			  auxmeses = mes > 10 ? 10 : mes + 1;
			} else {
			  auxmeses = 10;
			}
	  
			for (let j = 0; j < auxmeses; j++) {
			  this.fecha.push({
				date: new Date(this.pension[this.indexpen].anio_lectivo).setMonth(
				  new Date(this.pension[this.indexpen].anio_lectivo).getMonth() + j
				),
				beca: 0,
			  });
			}
	  
			if (becas !== undefined) {
			  becas.forEach((element: any) => {
				const matchingDate = this.fecha.find(
				  (elme) =>
					new Date(elme.date).getTime() == new Date(element.titulo).getTime()
				);
	  
				if (matchingDate) {
				  matchingDate.beca = 1;
				}
	  
				const matchingDate2 = this.fecha2.find(
				  (elme1) =>
					new Date(elme1.date).getTime() == new Date(element.titulo).getTime()
				);
	  
				if (matchingDate2) {
				  matchingDate2.beca = 1;
				}
			  });
			}
	  
			const anioLectivo = new Date(this.pension[this.indexpen].anio_lectivo);
			anioLectivo.setMonth(anioLectivo.getMonth() + this.num_pagos);

			this.checkfecha =
			anioLectivo.getFullYear() === new Date().getFullYear();
			
			if (response.abonos !== undefined) {
			  const data = response.abonos;
	  
			  for (const a of data) {
				const auxa = a.estado;
	  
				if (
				  auxa == 'Pago atrasado' ||
				  auxa == 'Pago a tiempo' ||
				  auxa == 'Pago anticipado'
				) {
				  if (this.fecha[a.tipo - 1]) {
					this.fecha[a.tipo - 1] = '';
				  }
				}
			  }
			}
	  
			for (const y of this.dpago) {
			  const aux = y.estado;
			  const aux1 = aux.includes('Abono');
	  
			  if (!aux1 && this.fecha[y.tipo - 1]) {
				this.fecha[y.tipo - 1] = '';
			  }
			}
			console.log(this.selec_est.estado);
			/*if (this.selec_est.estado === 'Desactivado') {
			  const con = this.fecha.filter((element) => element !== '').length;
	  
			  if (con === 1 && this.dpago.length === 0) {
				console.log(this.pago.estudiante);
				this.pago.estudiante = '';
			  }
			}*/
		  });
	  }
	  
	  registro(registroForm: any) {
		if (registroForm.valid) {
		  this.load_btn = true;
		  this.documentocreate.valor = parseFloat(this.documentocreate.valor);
		  
		  this._adminService.registro_documento_admin(this.documentocreate, this.token).subscribe(
			(response) => {
			  //console.log(response);
			  if (response.data === undefined) {
				iziToast.error({
				  title: 'ERROR',
				  position: 'topRight',
				  message: response.message || 'Error en el servidor.',
				});
				this.load_btn = false;
			  } else {
				let auxdocumento = response.data;
				iziToast.success({
				  title: 'ÉXITO',
				  position: 'topRight',
				  message: 'Se registró correctamente el nuevo documento.',
				});
				
				this.documentocreate = {};
				this.load_btn = false;
				
				this.documento_select = auxdocumento;
				this.auxvalordeposito = this.documento_select.valor;
				this.init_documentos();
		
				$('#modalNuevoDocumento').modal('hide');
				$('#input-documento').val(auxdocumento.documento);
		
				$('#btnbuscardocumento').attr('disabled', false);
				$('#btnnuevodocumento').attr('disabled', false);
				$('#btnAgregar').attr('disabled', false);
			  }
			},
			(error) => {
			  iziToast.error({
				title: 'ERROR',
				position: 'topRight',
				message: 'Hubo un error al intentar registrar el documento.',
			  });
			  this.load_btn = false;
			}
		  );
		} else {
		  iziToast.error({
			title: 'ERROR',
			position: 'topRight',
			message: 'Los datos del formulario no son válidos.',
		  });
		  this.load_btn = false;
		}
	  }
	  

	init_documentos() {
		this.load_documento = true;
		this._adminService.listar_documentos_admin(this.token).subscribe(
		  (response) => {
			if (response.data) {
			  this.documento = response.data.filter((element: any) => element.valor >= 0.01);
			  this.documento_const = this.documento;
			  this.load_documento = false;
			} else {
			  iziToast.error({
				title: 'Error',
				position: 'topRight',
				message: 'Ocurrió algo con el servidor',
			  });
			}
		  },
		  (error) => {
			console.error(error);
			iziToast.error({
				title: 'Error',
				position: 'topRight',
				message: error,
			  });
		  }
		);
	  }
	  

	select_documento(item: any) {
	this.documento_select = item;
	this.auxvalordeposito = this.documento_select.valor;
	$('#modalDocumento').modal('hide');
	$('#input-documento').val(item.documento);
	
	// Habilitar botones al seleccionar un documento
	this.habilitarBotones(false);
	
	}
	
	habilitarBotones(boolean:boolean) {
	$('#btnbuscardocumento').attr('disabled', boolean);
	$('#btnnuevodocumento').attr('disabled', boolean);
	$('#btnAgregar').attr('disabled', boolean);
	}


	addDocumento() {
		this.valor = 0;
		this.valorigualdocumento = 0;
	  
		if (this.documento_select) {
		  this.tipo = parseFloat(this.tipo.toString());
	  
		  if (this.tipo === 0) {
			this.valor = this.valor_matricula;
			this.addDocumento2(this.valor_matricula);
		  } else {
			if (this.tipo > 0 && this.tipo <= 10) {
			  this.actualizar_valor();
			  if (
				this.anio_lentivo.mescompleto !== null &&
				new Date(this.fecha[this.tipo - 1].date).getMonth() ===
				  new Date(this.anio_lentivo.mescompleto).getMonth()
			  ) {
				this.valor = this.aux_valor_pension;
				this.addDocumento2(this.aux_valor_pension);
			  } else {
				if (this.fecha[this.tipo - 1].beca === 1) {
				  this.valor = this.valores_pensiones;
				  this.addDocumento2(this.valores_pensiones);
				} else {
				  this.valor = this.aux_valor_pension;
				  this.addDocumento2(this.aux_valor_pension);
				}
			  }
			} else {
			  this.actualizar();
			  const rubroEncontrado = this.arr_rubro.find(
				(element: any) => element.idrubro === this.tipo
			  );
	  
			  if (rubroEncontrado !== undefined) {
				this.valor = rubroEncontrado.valor;
				this.addDocumento2(rubroEncontrado.valor);
			  } else {
				iziToast.warning({
				  title: 'Peligro',
				  position: 'topRight',
				  message: 'Error, no seleccionó un valor',
				});
			  }
			}
		  }
		} else {
		  iziToast.error({
			title: 'ERROR',
			position: 'topRight',
			message: 'Seleccione el documento',
		  });
		}
	  }
	  

	actualizar() {
		this.valorigualdocumento = 0;
		
		this.dpago.forEach((element: any) => {
			if (this.documento_select.documento === element.titulo_documento) {
			this.valorigualdocumento += parseFloat(element.valor);
			}
		});
	}


	addDocumento2(debe: any) {
		let ab = 0;
		let est = 'NaN';
	  
		if (this.valor >= 0.001) {
		  this.actualizar();
	  
		  if (parseFloat((parseFloat(this.documento_select.valor) - this.valorigualdocumento).toFixed(2)) > 0) {
			this._adminService.obtener_detalles_ordenes_estudiante_abono(this.idpension, this.token)
			  .subscribe((response) => {
				console.log("Fecha",this.checkfecha);
				console.log("tipo",this.tipo);
				console.log("num_pagos",this.num_pagos);
				console.log("arr_rubro",this.arr_rubro);
				if (this.checkfecha) {
				  if (this.tipo < this.num_pagos && this.tipo != 0) {
					est = 'Pago atrasado';
				  } else {
					if (this.tipo == this.num_pagos && this.tipo != 0) {
					  est = 'Pago a tiempo';
					} else if (this.tipo != 0 && this.arr_rubro.find((element: any) => element.idrubro == this.tipo) == undefined) {
					  est = 'Pago anticipado';
					} else if (this.tipo == 0 && this.tipo >= this.num_pagos - 1) {
					  est = 'Pago a tiempo';
					} else if (this.arr_rubro.find((element: any) => element.idrubro == this.tipo) != undefined) {
					  est = '';
					} else {
					  est = 'Pago atrasado';
					}
				  }
				} else {
				  est = 'Pago atrasado';
				}
	  
				this.auxabono = response.abonos;
				let auxb = 0;
	  
				if (this.auxabono != undefined) {
				  for (var x of this.auxabono) {
					if (x.tipo == this.tipo) {
					  auxb = x.valor + auxb;
					}
				  }
				}
	  
				let auxc = 0;
	  
				for (var y of this.dpago) {
				  if (y.tipo == this.tipo) {
					auxc += y.valor;
				  }
				}
	  
				if (parseFloat((parseFloat(this.documento_select.valor) - this.valorigualdocumento).toFixed(2)) > 0 &&
				  debe - (auxb + auxc) > 0) {
					console.log(
						debe - (auxb + auxc), 
						parseFloat((parseFloat(this.documento_select.valor) - this.valorigualdocumento).toFixed(2)),
						debe - (auxb + auxc) <= parseFloat((parseFloat(this.documento_select.valor) - this.valorigualdocumento).toFixed(2)));
				  if (debe - (auxb + auxc) <= parseFloat((parseFloat(this.documento_select.valor) - this.valorigualdocumento).toFixed(2))) {
					this.valor = parseFloat((debe - (auxb + auxc)).toFixed(2));
	  
					if (this.valor != debe) {
					  iziToast.info({
						title: 'INFO',
						position: 'topRight',
						message: 'Tenía un abono dado',
					  });
					}
				  } else {
					iziToast.info({
					  title: 'INFO',
					  position: 'topRight',
					  message: 'Se da como abono',
					});
					est = est + ' ' + 'Abono';
					ab = 1;
					this.valor = parseFloat((parseFloat(this.documento_select.valor) - this.valorigualdocumento).toFixed(2));
					this.habilitarBotones(true);
				  }
	  
				  $('#btnBuscarEstudiante').attr('disabled', true);
	  
				  this.valor = parseFloat(this.valor.toFixed(2));
	  
				} else {
				  this.valor = 0;
				}
	  
				let descripcion = '';
	  
				if (this.tipo >= 0 && this.tipo < 11) {
	  
				} else {
				  var rubro = this.arr_rubro.find((element: any) => element.idrubro == this.tipo) || { descripcion: '', idrubro: '' };
	  
				  if (rubro.descripcion != '' && rubro.idrubro != '') {
					descripcion = rubro.descripcion;
					this.arr_rubro.forEach((element: any, key) => {
					  if (rubro.idrubro == element.idrubro) {
						this.arr_rubro.splice(key, 1);
					  }
					});
				  }
				}
	  
				if (this.valor > 0) {
				  this.dpago.push({
					idpension: this.idpension,
					documento: this.documento_select._id,
					titulo_documento: this.documento_select.documento,
					descripcion: descripcion,
					valor: this.valor,
					tipo: this.tipo,
					estado: est,
					abono: ab,
				  });
	  
				  this.actualizar_valor();
				  this.valorigualdocumento += this.valor;
	  
				  if (this.meses_beca > 0 && this.tipo != 0) {
					this.meses_beca = this.meses_beca - 1;
				  } else {
					if (this.tipo == 0) {
					  this.matricula_pago = 1;
					}
				  }
	  
				  this.total_pagar = parseFloat(this.valor.toString()) + parseFloat(this.auxtotalpago.toString());
				  this.auxtotalpago = this.total_pagar.toFixed(2);
	  
				  if (this.tipo != 0) {
					this.num_pagado = this.num_pagado + 1;
				  }
				  this.tipo = -1;
				} else {
				  iziToast.warning({
					title: 'ERROR',
					position: 'topRight',
					message: 'Error invalido',
				  });
				}
			  });
		  } else {
			iziToast.warning({
			  title: 'ERROR',
			  position: 'topRight',
			  message: 'Sin fondos',
			});
	  
			this.valorigualdocumento = 0;
			this.dpago.forEach((element: any) => {
			  if (this.documento_select.documento == element.titulo_documento) {
				this.valorigualdocumento = parseFloat(element.valor) + this.valorigualdocumento;
			  }
			});
		  }
		} else {
		  iziToast.error({
			title: 'ERROR',
			position: 'topRight',
			message: 'Valor no valido',
		  });
		}
	  }
	  

	  quitar(id: any, valor: any, tipo: any) {
		this.dpago.splice(id, 1);
	  
		if (tipo == 0) {
		  this.matricula_pago = 0;
		} else {
		  if (tipo > 0 && tipo <= 10) {
			if (this.meses_beca !== -1) {
			  this.meses_beca = this.meses_beca + 1;
			}
			this.num_pagado = this.num_pagado - 1;
		  } else {
			var aux = this.arr_rubro_const.find((element: any) => element.idrubro == tipo);
			if (aux) {
			  this.arr_rubro.push(aux);
			}
		  }
		}
	  
		this.actualizar_valor();
	  
		// Habilitar botones
		this.habilitarBotones(false);
	  
		if (this.dpago.length === 0) {
		  $('#btnBuscarEstudiante').attr('disabled', false);
		}
	  
		this.actualizar();
	  
		this.total_pagar = parseFloat(this.auxtotalpago.toString()) - parseFloat(valor.toString());
		this.auxtotalpago = this.total_pagar.toFixed(2);
	  }

	  registrar_pago() {
		let aux = localStorage.getItem('identity');
		
		this._adminService.obtener_admin(aux, this.token).subscribe(
		  (response) => {
			let info = response.data;
	  
			if (info == undefined || info.estado == 'Fuera' || info.estado == 'deshabilitado') {
			  iziToast.error({
				title: 'ERROR',
				position: 'topRight',
				message: 'No puedes crear pagos',
			  });
			} else {
			  this.pago.encargado = info;
			  this.pago.total_pagar = this.total_pagar;
			  this.pago.transaccion = 'PAGOMANUAL';
			  this.pago.detalles = this.dpago;
	  
			  if (!this.pago.estudiante) {
				iziToast.error({
				  title: 'ERROR',
				  position: 'topRight',
				  message: 'Debe seleccionar al estudiante.',
				});
			  } else if (this.dpago.length === 0) {
				iziToast.error({
				  title: 'ERROR',
				  position: 'topRight',
				  message: 'Debe agregar al menos un documento al pago.',
				});
			  } else {
				this.load_btn = true;
				this.pago.nombres_factura = this.selec_est.nombres_factura;
				this.pago.dni_factura = this.selec_est.dni_factura;
				this.pago.tipo_producto = 'S';
				this.pago.tipo_tarifa = 0;
				this.pago.config = this.config;
				console.log(this.pago);
	  
				
				this._adminService.registro_compra_manual_estudiante(this.pago, this.token).subscribe(
				  (response) => {
					console.log(response);
					this.load_btn = false;
	  
					// Crear la URL de la nueva página
					const nuevaPaginaURL = '/pagos/' + response.pago._id;
	  
					// Abrir la nueva página en la misma pestaña
					window.open(nuevaPaginaURL, '_blank');
					location.reload();
				  },
				  (error) => {
					console.error(error);
					this.load_btn = false;
					iziToast.error({
					  title: 'ERROR',
					  position: 'topRight',
					  message: 'Error al registrar el pago. Por favor, intenta nuevamente.',
					});
				  }
				);

			  }
			}
		  },
		  (error) => {
			console.error(error);
		  }
		);
	  }
	  
}
