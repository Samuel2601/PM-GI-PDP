import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/service/admin.service';
import { ConfigService } from 'src/app/service/config.service';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import iziToast from 'izitoast';
declare var $: any;

@Component({
  selector: 'app-school-year-config',
  templateUrl: './school-year-config.component.html',
  styleUrls: ['./school-year-config.component.scss']
})

export class SchoolYearConfigComponent implements OnInit {
	public config: any = {};
	public config_const: any = {};
	public load_btn = true;
	public token = localStorage.getItem('token');
	public load_data = true;
	public rol = '';
	public auxdate = '';
	public auxmescompleto:string = 'ninguno';
	
	public bol:string='';
	public arr_meses: Array<any> = [];
	public tip_conf=1;
	public institucion:any=[];
	public rubro = {
		idrubro:'',
		descripcion:'',
		valor:''
	};
	public arr_rubro: Array<any> = [];
	public arr_rubro_const: Array<any> = [];

	public uniqueArray=true;



	configForm: FormGroup;

  	constructor(private _adminService: AdminService, private _configService: ConfigService,private fb: FormBuilder) {
		// Inicializar el formulario con validaciones si es necesario
		this.configForm = this.fb.group({
			cursos: this.fb.array([]),
			modulosUnicos: this.fb.array([]),
			conexionSistemas: this.fb.group({
				url: ['', Validators.required]
				// Otros campos de conexionSistemasSchema según sea necesario
			}),
			configSMTP: this.fb.group({
				correo: ['', [Validators.required, Validators.email]],
				token: ['', Validators.required]
				// Otros campos de configSMTPSchema según sea necesario
			}),
			configEncabezadoPie: this.fb.group({
				encabezado: [''],
				piePagina: ['']
				// Otros campos de configEncabezadoPieSchema según sea necesario
			})
		});
	}

	ngOnInit(): void {
		let aux = this._configService.getConfig()as { imagen: string, identity: string, token: string , rol:string};
    	this.rol = aux.rol||'';
		this.init_data();
	}
	init_data() {
		this.load_data = true;
		this.select_nav(3);
	}
	select_nav(val:any){
		if(val!=this.tip_conf){
			this.tip_conf=val;
			if(this.tip_conf==1){
				this.call_lectivo();
			}else if(this.tip_conf==2){
				this.call_insti();
			}else{
				this.call_config();
			}
		}
	}
	guardarCambios() {
		// Lógica para guardar los cambios, por ejemplo, enviar a un servicio o API
		console.log('Cambios guardados:', this.institucion);
		// Puedes implementar aquí la lógica de llamada a tu servicio o API para guardar los cambios
	  }
	call_lectivo(){
		
		this._adminService.obtener_config_admin(this.token).subscribe((response) => {
			if (response.message) {
				this.bol = response.message;
				
				this.load_btn = false;
				this.load_data = false;
			} else {
				
				this.config_const = response.data;
				this.select_config(0);
				if(this.config){
					this._adminService.actualizar_config_admin(this.config, this.token).subscribe(
						(response) => {
							iziToast.success({
								title: 'ÉXITOSO',
								position: 'topRight',
								message: 'Se encuentra actualiza correctamente las configuraciones.',
							});
						},
						(error) => {
							this.load_btn = false;
						}
					);
				}				
			}

			if (this.config.numpension >= 10) {
				this.load_btn = false;
			}
		});
	}
	call_config(){

	}
	call_insti(){
		this._adminService.obtener_info_admin(this.token).subscribe((response)=>{
			console.log(response);
			this.institucion=response.data;
		});
	}
	select_config(val:any){
		this.config=this.config_const[val];
		if(this.config.extrapagos){
			this.arr_rubro_const=Object.assign(JSON.parse(this.config.extrapagos));
			this.arr_rubro= Object.assign(JSON.parse(this.config.extrapagos));
			
		}else{
			this.arr_rubro_const=[];
			this.arr_rubro=[];
		}
		this.auxdate = this.config.anio_lectivo;
		this.auxmescompleto = this.config.mescompleto;
		this.config.mescompleto='';
		this.load_data = false;
		this.fechas(1);
	}

	cerrar_add_rubro(){
		$('#modalNuevoRubro').modal('hide');
	}
	fechas(id:any) {
		this.arr_meses = [];
		for (var i = 0; i < 10; i++) {
			this.arr_meses.push({
				date: new Date(this.config.anio_lectivo).setMonth(new Date(this.config.anio_lectivo).getMonth() + i),
			});
		}
	}
	addarr_rubro(addrubroForm: any){
		
		if(addrubroForm.valid){
			
			if(this.arr_rubro.find(element=>element.idrubro==this.rubro.idrubro)==undefined){
				this.arr_rubro.push(this.rubro);
				this.uniqueArray=JSON.stringify(this.arr_rubro) === JSON.stringify(this.arr_rubro_const);

				this.rubro={idrubro:'',
				descripcion:'',
				valor:''};
				$('#modalNuevoRubro').modal('hide');
			}else{
				iziToast.error({
					title: 'DANGER',
					position: 'topRight',
					message: 'Ya existe ese código de rubro',
				});
			}
		}
		
	}
	eliminarrubro(val:any){
		this._adminService.obtener_detalles_ordenes_rubro(this.arr_rubro[val].idrubro,this.token).subscribe((response)=>{

			if(response.pagos.length==0){
				this.arr_rubro.splice(val, 1);
				this.uniqueArray=JSON.stringify(this.arr_rubro) === JSON.stringify(this.arr_rubro_const);

			}else{
				iziToast.error({
					title: 'DANGER',
					position: 'topRight',
					message: 'Hay pagos bajo este rubro',
				});
			}
		});
		
	}

	addrubro(){
		if(this.arr_rubro.length>=0){
			this.config=this.config_const;
			this.config.extrapagos=JSON.stringify(this.arr_rubro);
			this._adminService.actualizar_config_admin(this.config, this.token).subscribe(
				(response) => {
					$('#modalRubro').modal('hide');
					iziToast.success({
						title: 'ÉXITOSO',
						position: 'topRight',
						message: 'Se encuentra actualiza correctamente las configuraciones.',
					});
					location.reload();
				},
				(error) => {
					this.load_btn = false;
				}
			);
		}
	}
	actualizar(actualizarForm: any) {


		if (actualizarForm.valid) {
			this.load_btn = true;
			this.config.nuevo=1;
			if (
				(this.bol == '' &&
					this.config.numpension >= 10 &&
					new Date(new Date(this.auxdate).setMonth(new Date(this.auxdate).getMonth() + 10)).getTime() <
						new Date(this.config[0].anio_lectivo).getTime()) ||
				this.bol != ''
			) {
				this._adminService.actualizar_config_admin(this.config, this.token).subscribe(
					(response) => {
						if (response.message == undefined) {
							iziToast.success({
								title: 'ÉXITOSO',
								position: 'topRight',
								message: 'Se actualizó correctamente las configuraciones.',
							});
						} else {
							iziToast.error({
								title: 'PELIGRO',
								position: 'topRight',
								message: response.message,
							});
						}

						this.load_btn = false;

						//this.ngOnInit();
						$('#modalConfirmar').modal('hide');
						location.reload();
					},
					(error) => {
						this.load_btn = false;
					}
				);
				
			} else {
				$('#modalConfirmar').modal('hide');
				this.load_btn = false;
				iziToast.error({
					title: 'PELIGRO',
					position: 'topRight',
					message:'No se puede añadir un nuevo perido si es menor o igual al actual y ya hayan pasado los 10 meses ',
				});
			}
		} else {
			iziToast.error({
				title: 'ERROR',
				position: 'topRight',
				message: 'Los datos del formulario no son validos',
			});
		}
	}

	get cursos(): FormArray {
		return this.configForm.get('cursos') as FormArray;
	}	
	get modulosUnicos(): FormArray {
	return this.configForm.get('modulosUnicos') as FormArray;
	}
	
	paralelosArray(cursoIndex: number): FormArray {
		const curso = this.cursos.controls[cursoIndex] as FormGroup;
		return curso.get('paralelos') as FormArray;
	  }
	  
	  

	  getParalelosArray(curso: AbstractControl): FormArray {
		return curso.get('paralelos') as FormArray;
	  }
	  
	  


	// Función para agregar un nuevo curso al formulario
	agregarCurso(): void {
		this.cursos.push(this.fb.group({
		  nombre: [''],
		  paralelos: this.fb.array([])
		  // Otros campos de CursoSchema según sea necesario
		}));
	  }
	  
	
	  // Función para agregar un nuevo módulo único al formulario
	  agregarModuloUnico(): void {
		this.modulosUnicos.push(this.fb.group({
		  nombre: ['']
		  // Otros campos de ModuloUnicoSchema según sea necesario
		}));
	  }
	  agregarParalelo(cursoIndex: number): void {
		const paralelos = (this.cursos.controls[cursoIndex].get('paralelos') as FormArray);
		
		paralelos.push(this.fb.group({
			nombre: ['']
			// Otros campos de ModuloUnicoSchema según sea necesario
		  }));
		console.log('Nuevo paralelo añadido:', paralelos.value);
	  } 
	  
	
	  // Función para enviar el formulario al backend (simulado)
	  guardarConfiguracion() {
		if (this.configForm.valid) {
		  const configuracion = this.configForm.value;
		  console.log('Enviando configuración al backend:', configuracion);
		  // Aquí podrías llamar a tu servicio o API para enviar la configuración al backend
		} else {
		  console.error('El formulario no es válido. Por favor, completa los campos obligatorios.',this.configForm,this.configForm.valid);
		}
	  }
}
