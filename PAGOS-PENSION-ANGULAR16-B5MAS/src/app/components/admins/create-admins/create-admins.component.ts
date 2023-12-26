
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import { EstudianteService } from 'src/app/service/student.service';
import iziToast from 'izitoast';

@Component({
  selector: 'app-create-admins',
  templateUrl: './create-admins.component.html',
  styleUrls: ['./create-admins.component.scss']
})

export class CreateAdminsComponent implements OnInit {
	public estudiante: any = {};
	public rol: any;
	public token;
	public load_btn = false;
	public load_beca: any;
	public valores_pensiones = 0;

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
			}else{
				let user= JSON.parse(localStorage.getItem('user_data')!);

				if(!this.rol){
					this.rol=user.rol;
				}
			}
			
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
	}

	registro(registroForm: { valid: any }) {
		if (this.estudiante.password != this.estudiante.auxiliar) {
			iziToast.error({
				title: 'ERROR',
				position: 'topRight',
				message: 'Las contraseñas no coinciden',
			});
		} else {
			if (registroForm.valid) {
				this.load_btn = true;
				let aux = JSON.parse(localStorage.getItem('user_data')||'');
				this.estudiante.base = aux.base;
				this.estudiante.portada = aux.portada;
				this._adminService.registro_admin(this.estudiante, this.token).subscribe(
					(response) => {
						if (response.message == 'Registrado con exito') {
							iziToast.success({
								title: 'ÉXITOSO',
								position: 'topRight',
								message: response.message,
							});

							this.load_btn = false;

							this._router.navigate(['/administrativo']);
						} else {
							iziToast.error({
								title: 'ERROR',
								position: 'topRight',
								message: response.message,
							});
							this.load_btn = false;
						}
					},
					(error) => {
						console.log(error);
					}
				);
			} else {
				iziToast.error({
					title: 'ERROR',
					position: 'topRight',
					message: 'Los datos del formulario no son validos',
				});
				this.load_btn = false;
			}
		}
	}
}
