
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';

declare var $: any;
import iziToast from 'izitoast';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
	public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';
	public file: any = undefined;
	public token: any = '';
	public config: any;
	public geo = localStorage.getItem('geo');
	public inicio = 1;

	public admin: any = {};
	/* = {
		email: "",
		password: ""
	};*/

	constructor(private _adminService: AdminService, private _router: Router) {
		this.token = localStorage.getItem('token');
	}

	ngOnInit(): void {
		$('body').addClass('align-items-center');
		if (this.token) {
			this._router.navigate(['/estudiantes']);
		} else {
			//MANTENER EN EL COMPONENTE
		}
	}
	FormRegistro(valor: any) {
		this._router.navigate(['/registrate']);
	}
	Recuperar() {
		this._router.navigate(['/forgot-password']);
	}

	login(loginForm: any) {
		this.geo = localStorage.getItem('geo');
		//console.log(this.geo);
		if (loginForm.valid) {
			let email = loginForm.value.email;
			let password = loginForm.value.password;

			if (email == '' && password == '') {
				iziToast.error({
					title: 'ERROR DATA',
					position: 'topRight',
					message: 'Todos los campos son requeridos, vuelva a intentar.',
				});
			} else {
				this._adminService.login_admin({ email, password }).subscribe(
					(response) => {
						//console.log(response);

						if (response.data != null) {
							if (response.data.estado == 'Fuera' || response.data.estado == 'deshabilitado') {
								iziToast.error({
									title: 'ERROR USER',
									position: 'topRight',
									message: 'Cuenta Suspendida',
								});
							} else {
								this.token = response.token;
								//console.log(this.token);
								localStorage.setItem('token', response.token);
								localStorage.setItem('identity', response.data._id);
								localStorage.setItem('user_data', JSON.stringify(response.data));
								if (email == 'samuel.arevalo@espoch.edu.ec') {
									this._router.navigate(['/control']);
								} else {
									this._adminService.obtener_config_admin(this.token).subscribe((response) => {
										if (response.data != undefined) {
											this.config = response.data[0];
											//console.log(this.config);
											var toke = localStorage.getItem('token');
											this._adminService.actualizar_config_admin(this.config, this.token).subscribe(
												(response) => {
													//console.log(response);
													this._router.navigate(['/estudiantes']);
												},
												(error) => {
													console.log(error);
												}
											);
										} else {
											this._router.navigate(['/configuraciones']);
										}
									});
								}
							}
						} else {
							iziToast.error({
								title: 'ERROR USER',
								position: 'topRight',
								message: response.message,
							});
						}
					},
					(error) => {
						iziToast.error({
							title: 'ERROR SERVER',
							position: 'topRight',
							message: 'Ocurrió un error en el servidor, intente mas nuevamente.',
						});
					}
				);
			}
		} else {
			iziToast.error({
				title: 'ERROR DATA',
				position: 'topRight',
				message: 'Complete correctamente el formulario.',
			});
			if (!this.geo) {
				iziToast.error({
					title: 'ERROR DATA',
					position: 'topRight',
					message: 'No se te puede ubicar',
				});
			}
		}
	}

	fileChangeEvent(event: any): void {
		var file: any;
		if (event.target.files && event.target.files[0]) {
			file = <File>event.target.files[0];
		} else {
			iziToast.error({
				title: 'ERROR',
				position: 'topRight',
				message: 'No hay un imagen de envio',
			});
		}

		if (file.size <= 4000000) {
			if (file.type == 'image/png') {
				const reader = new FileReader();
				reader.onload = (e) => (this.imgSelect = reader.result);
				// console.log(this.imgSelect);

				reader.readAsDataURL(file);

				$('#input-portada').text(file.name);
				this.file = file;
			} else {
				iziToast.error({
					title: 'ERROR',
					position: 'topRight',
					message: 'El archivo debe ser una imagen png',
				});
				$('#input-portada').text('Seleccionar imagen');
				this.imgSelect = 'assets/img/01.jpg';
				this.file = undefined;
			}
		} else {
			iziToast.error({
				title: 'ERROR',
				position: 'topRight',
				message: 'La imagen no puede superar los 4MB',
			});
			$('#input-portada').text('Seleccionar imagen');
			this.imgSelect = 'assets/img/01.jpg';
			this.file = undefined;
		}

		// console.log(this.file);
	}

	registrate(registroForm: any) {
		if (registroForm.valid) {
			if (this.file) {
				this.admin.portada = this.file;
				if (this.admin.passwordadmin != this.admin.auxiliar) {
					//document.getElementById('auxiliar').style.borderColor = 'Red';
					iziToast.error({
						title: 'ERROR',
						position: 'topRight',
						message: 'No coincide las contraseñas',
					});
				} else {
					this._adminService.registrar_admin(this.admin, this.file).subscribe((response) => {
						if (response.message == 'Registrado con exito') {
							iziToast.success({
								title: 'APROBADO',
								position: 'topRight',
								message: response.message,
							});
							window.location.reload();
						} else {
							iziToast.error({
								title: 'ERROR USER',
								position: 'topRight',
								message: response.message,
							});
						}
					});
				}
			} else {
				iziToast.error({
					title: 'ERROR',
					position: 'topRight',
					message: 'Debe subir una portada para registrar',
				});
				$('#input-portada').text('Seleccionar imagen');
				this.imgSelect = 'assets/img/01.jpg';
				this.file = undefined;
			}
		}
	}
	view_password() {
		let type = $('#password').attr('type');

		if (type == 'text') {
			$('#password').attr('type', 'password');
		} else if (type == 'password') {
			$('#password').attr('type', 'text');
		}
	}
	view_passworda() {
		let type = $('#auxiliar').attr('type');

		if (type == 'text') {
			$('#auxiliar').attr('type', 'password');
		} else if (type == 'password') {
			$('#auxiliar').attr('type', 'text');
		}
	}
}
