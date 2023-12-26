import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import { EstudianteService } from 'src/app/service/student.service';
import { GLOBAL } from 'src/app/service/GLOBAL';
import iziToast from 'izitoast';
declare var $: any;

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})

export class NewPasswordComponent implements OnInit {
	public id: any;
	public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';
	public file: any = undefined;
	public token: any = '';
	public config: any;
	public geo = localStorage.getItem('geo');
	public admin: any = {};
	public valido: any;
	constructor(
		private _route: ActivatedRoute,

		private _adminService: AdminService,
		private _estudianteService: EstudianteService,
		private _router: Router
	) {}

	ngOnInit(): void {
		this._route.params.subscribe((params) => {
			this.id = params['id'];
			//console.log(this.id);
			this._adminService.verificar_token(this.id).subscribe(
				(response) => {
					this.valido = 1;
					//console.log(response);
				},
				(error) => {
					this.valido = 0;
					iziToast.show({
						title: 'ERROR',
						class: 'iziToast-danger',
						position: 'topRight',
						message: 'Expiro tu token',
					});
				}
			);
		});
	}

	login(loginForm: any) {
		this.geo = localStorage.getItem('geo');
		////console.log(this.geo);
		if (loginForm.valid && this.geo) {
			let password = loginForm.value.password;
			let passwordaux = loginForm.value.passwordaux;

			if (password != passwordaux || password == '' || passwordaux == '') {
				iziToast.show({
					title: 'ERROR DATA',
					class: 'iziToast-danger',
					position: 'topRight',
					message: 'Todos los campos son requeridos, vuelva a intentar.',
				});
			} else {
				this._adminService.newpassword({ password }, this.id).subscribe((response) => {
					if (response.message == 'Actualizado con exito') {
						iziToast.show({
							title: 'SUCCESS',
							class: 'text-success',
							titleColor: 'green',
							color: 'green',
							position: 'topRight',
							message: response.message,
						});

						this._router.navigate(['/estudiantes']);
					} else {
						iziToast.show({
							title: 'DANGER',
							class: 'text-DANGER',
							titleColor: 'red',
							color: 'red',
							position: 'topRight',
							message: response.message,
						});

						this.ngOnInit();
					}
				});
			}
		} else {
			iziToast.show({
				title: 'ERROR DATA',
				class: 'iziToast-danger',
				position: 'topRight',
				message: 'Complete correctamente el formulario.',
			});
			if (!this.geo) {
				iziToast.show({
					title: 'ERROR DATA',
					class: 'iziToast-danger',
					position: 'topRight',
					message: 'No se te puede ubicar',
				});
			}
		}
	}
}
