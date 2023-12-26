import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import { EstudianteService } from 'src/app/service/student.service';

declare var iziToast: {
	show: (arg0: {
		title: string;
		titleColor: string;
		color: string;
		class: string;
		position: string;
		message: string;
	}) => void;
};

@Component({
  selector: 'app-create-students',
  templateUrl: './create-students.component.html',
  styleUrls: ['./create-students.component.scss']
})

export class CreateStudentsComponent implements OnInit {
	public estudiante: any = {
		genero: 'No definido',
		//password: "1234"
	};
	public arr_etiquetas: Array<any> = [];
	public etiquetas: Array<any> = [];
	public new_etiqueta = '';
	public config: Array<any> = [];
	public config_const: Array<any> = [];
	public estudiante_pension: Array<any> = [];
	public token;
	public load_btn = false;
	public load_beca: any;
	public valores_pensiones = 0;
	public rol = undefined;
	public yo = 0;
	public ch_r = 'repre';
	public ch_c = 'dni';
	public ch_co = 'dni';
	public vc = 0;
	constructor(
		private _estudianteService: EstudianteService,
		private _adminService: AdminService,
		private _router: Router
	) {
		this.token = localStorage.getItem('token');
	}

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
			this._adminService.obtener_config_admin(this.token).subscribe((response)=>{
				this.config=response.data;
				//this.config_const=response.data;
				
				//console.log(this.config);
			});
			
		});

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
		this._adminService.obtener_config_admin(this.token).subscribe((response) => {
			if (response.data) {
				//console.log(response.data);
				this.vc = 1;
				this.valores_pensiones = response.data[0].pension.toFixed(2);
				//console.log(new Date(response.data.mescompleto).getMonth());
				//console.log(new Date (response.data.anio_lectivo).setMonth(new Date (response.data.anio_lectivo).getMonth()+i));
/*
				for (var i = 0; i < 10; i++) {
					//console.log(new Date (new Date (this.pension.anio_lectivo).setMonth(new Date (this.pension.anio_lectivo).getMonth()+i)).getMonth() );
					//console.log( new Date (this.pension.anio_lectivo).setMonth(new Date (this.pension.anio_lectivo).getMonth()+i) );
					if (
						new Date(response.data[0].mescompleto).getMonth() !=
						new Date(
							new Date(response.data[0].anio_lectivo).setMonth(
								new Date(response.data[0].anio_lectivo).getMonth() + i
							)
						).getMonth()
					) {
						this.etiquetas.push({
							etiqueta: i + 1,
							titulo: new Date(
								new Date(response.data[0].anio_lectivo).setMonth(
									new Date(response.data[0].anio_lectivo).getMonth() + i
								)
							),
							idpension: response.data[0]._id,
						});
					}
				}

				*/
			}
		});
	}
	quitar_fechas(event:any){
		this.etiquetas=[];
	}
	crear_fechas(){
		this.etiquetas=[];
		//console.log(this.idet);
		for (var i = 0; i < 10; i++) {
			//console.log(new Date (new Date (this.pension.anio_lectivo).setMonth(new Date (this.pension.anio_lectivo).getMonth()+i)).getMonth() );
			//console.log( new Date (this.pension.anio_lectivo).setMonth(new Date (this.pension.anio_lectivo).getMonth()+i) );
			if (
				new Date(this.estudiante_pension[this.idet].anio_lectivo.mescompleto).getMonth() !=
				new Date(
					new Date(this.estudiante_pension[this.idet].anio_lectivo.anio_lectivo).setMonth(
						new Date(this.estudiante_pension[this.idet].anio_lectivo.anio_lectivo).getMonth() + i
					)
				).getMonth()
			) {
				this.etiquetas.push({
					etiqueta: i + 1,
					titulo: new Date(
						new Date(this.estudiante_pension[this.idet].anio_lectivo.anio_lectivo).setMonth(
							new Date(this.estudiante_pension[this.idet].anio_lectivo.anio_lectivo).getMonth() + i
						)
					),
					idpension: this.estudiante_pension[this.idet].anio_lectivo._id,
				});
			}
		}
	}
	public idp=-1;
	public auxidp=-1;
	selecct_pension(){
		let bal=0;
		if(this.estudiante_pension.length==0){
			this.auxidp=this.idp;
		}else{
			this.estudiante_pension.forEach(element => {
				if(element.aux==this.idp){
					bal=1;
				}
			});

		}
		//console.log(parseInt(this.estudiante.curso)+(this.auxidp-this.idp));
		if(parseInt(this.estudiante.curso)+(this.auxidp-this.idp)<=10&&bal==0){
			this.estudiante.curso=(parseInt(this.estudiante.curso)+(this.auxidp-this.idp)).toString();
			this.auxidp=this.idp;
		}
		
		if(this.idp>=0&&bal==0&&this.estudiante.curso>0){
			this.estudiante_pension.push({anio_lectivo:this.config[this.idp],
			curso:this.estudiante.curso,
			paralelo:this.estudiante.paralelo,
			aux:this.idp
		});
			

			//this.config.splice(this.idp, 1);
			
			this.idp=-1;
		}
		this.estudiante_pension.sort(function (a, b) {
			if (new Date(a.anio_lectivo.anio_lectivo).getTime() > new Date(b.anio_lectivo.anio_lectivo).getTime()) {
			  return 1;
			}
			if (new Date(a.anio_lectivo.anio_lectivo).getTime() < new Date(b.anio_lectivo.anio_lectivo).getTime()) {
			  return -1;
			}
			// a must be equal to b
			return 0;
		  });
		//console.log(this.estudiante_pension);
	}
	eliminar_pension(val:any){
		//this.config.push(this.config_const[this.estudiante_pension[val].aux]);
		this.estudiante_pension.splice(val, 1);
	}
	descuento_valor(id:any) {
		this.valores_pensiones=this.estudiante_pension[this.idet].anio_lectivo.pension;
		if (
			this.estudiante_pension[this.idet].desc_beca != undefined &&
			this.estudiante_pension[this.idet].desc_beca > 0 &&
			this.estudiante_pension[this.idet].desc_beca <= 100
		) {
			this.estudiante_pension[this.idet].val_beca = parseFloat(
				(this.valores_pensiones - (this.valores_pensiones * this.estudiante_pension[this.idet].desc_beca) / 100).toFixed(2)
			).toFixed(2);
			//this.pension.val_beca = this.estudiante_pension[this.idet].val_beca;
		} else {
			iziToast.show({
				title: 'Warinng',
				titleColor: 'red',
				color: 'red',
				class: 'text-warning',
				position: 'topRight',
				message: 'Descuento Invalido',
			});

			this.estudiante_pension[this.idet].desc_beca = '';
			this.estudiante_pension[this.idet].val_beca = '';
		}
	}
	valor_descuento(id:any) {
		this.valores_pensiones=this.estudiante_pension[this.idet].anio_lectivo.pension;
		if (
			this.estudiante_pension[this.idet].val_beca != undefined &&
			this.estudiante_pension[this.idet].val_beca <= this.valores_pensiones &&
			this.estudiante_pension[this.idet].val_beca >= 0
		) {
			this.estudiante_pension[this.idet].desc_beca = (100-(this.estudiante_pension[this.idet].val_beca * 100) / this.valores_pensiones).toFixed(2);
			//this.pension.desc_beca = this.estudiante.desc_beca;
		} else {
			iziToast.show({
				title: 'Warinng',
				titleColor: 'red',
				color: 'red',
				class: 'text-warning',
				position: 'topRight',
				message: 'Valor Invalido',
			});

			this.estudiante_pension[this.idet].val_beca = '';
			this.estudiante_pension[this.idet].desc_beca = '';
		}
	}
	public idet=-1;
	agregar_etiqueta() {
		let arr_label = this.new_etiqueta.split('_');
		var ir: any = arr_label[3];
		if(!this.estudiante_pension[this.idet].arr_etiquetas){
			this.estudiante_pension[this.idet].arr_etiquetas=[];
		}
		if (this.idet!=-1&& this.estudiante_pension[this.idet].arr_etiquetas.find(( etiqueta:any ) => etiqueta === arr_label[0]) == undefined) {
			
			this.estudiante_pension[this.idet].arr_etiquetas.push({
				etiqueta: arr_label[0],
				titulo: arr_label[1],
				idpension: arr_label[2],
			});
			
			//this.etiquetas.splice(ir,1)
			this.new_etiqueta = '';
		}
		//console.log(this.estudiante_pension);
	}
	eliminar_etiqueta(idx: any) {
		this.estudiante_pension[this.idet].arr_etiquetas.splice(idx, 1);
	}

	registro(registroForm: { valid: any }) {
		let conf = 0;
		//console.log(this.estudiante_pension);
		//console.log(this.estudiante_pension.length>0);
		if(this.estudiante_pension.length>0){

			this.estudiante_pension.forEach((element:any) => {
				if(!element.condicion_beca){
					element.condicion_beca='No'
				}

				if(element.condicion_beca=='Si'){
					if(!(element.desc_beca&&element.val_beca&&element.arr_etiquetas.length>0)){
						conf=1;
						iziToast.show({
							title: 'ERROR',
							titleColor: '#FF0000',
							color: '#FFF',
							class: 'text-danger',
							position: 'topRight',
							message: 'Tienes que proporcionarnos las fechas con beca y el valor de la beca: '+element.curso+element.paralelo+'-'+new Date(element.anio_lectivo.anio_lectivo).getFullYear(),
						});
					}
				}
			});
			if(conf==0){
				if (registroForm.valid) {
					
					this.load_btn = true;
					if (this.ch_r == 'repre') {
						this.estudiante.nombres_factura = this.estudiante.nombres_padre;
						this.estudiante.dni_factura = this.estudiante.dni_padre;
					}
					this.estudiante.pensiones=this.estudiante_pension;
					//console.log(this.estudiante);
					
					this._adminService.registro_estudiante(this.estudiante, this.token).subscribe(
						(response) => {
							//////console.log(response);
							if (response.message == 'Estudiante agregado con exito') {
								iziToast.show({
									title: 'SUCCESS',
									titleColor: '#1DC74C',
									color: '#FFF',
									class: 'text-success',
									position: 'topRight',
									message: response.message,
								});
								this.estudiante = {
									genero: '',
									nombres: '',
									apellidos: '',
									f_nacimiento: '',
									telefono: '',
									dni: '',
									email: '',
								};
								this._router.navigate(['/estudiantes']);
							} else {
								iziToast.show({
									title: 'DANGER',
									titleColor: 'red',
									color: 'red',
									class: 'text-danger',
									position: 'topRight',
									message: response.message,
								});
							}

							this.load_btn = false;
						},
						(error) => {
							//////console.log(error);
						}
					);
					
				} else {
					iziToast.show({
						title: 'ERROR',
						titleColor: '#FF0000',
						color: '#FFF',
						class: 'text-danger',
						position: 'topRight',
						message: 'Los datos del formulario no son validos',
					});
					this.load_btn = false;
				}

			}
		}else{
			iziToast.show({
				title: 'ERROR',
				titleColor: '#FF0000',
				color: '#FFF',
				class: 'text-danger',
				position: 'topRight',
				message: 'Indica a que año lectivo pertenece',
			});
		}
		
		
		
	}
}
