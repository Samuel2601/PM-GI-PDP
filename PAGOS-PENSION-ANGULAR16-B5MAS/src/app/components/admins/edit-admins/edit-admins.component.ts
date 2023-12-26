import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import { EstudianteService } from 'src/app/service/student.service';
import { GLOBAL } from 'src/app/service/GLOBAL';
import iziToast from 'izitoast';
declare var $: any;

@Component({
  selector: 'app-edit-admins',
  templateUrl: './edit-admins.component.html',
  styleUrls: ['./edit-admins.component.scss']
})


export class EditAdminsComponent implements OnInit {
	public estudiante: any = {};
	public auxadmin: any = {};
	public id: any;
	public config: any = {};
	public valores_pensiones = 0;
	public load_btn = false;
	public load_data = true;
	public token = localStorage.getItem('token');
	public url = GLOBAL.url;
	public rol: any;
	public yo = 0;
	public pension: any = {};
	public idp: any=localStorage.getItem('identity');
	constructor(
		private _route: ActivatedRoute,

		private _adminService: AdminService,
		private _estudianteService: EstudianteService,
		private _router: Router
	) {}

	ngOnInit(): void {
		this._route.params.subscribe((params) => {
			this.id = params['id'];
			this._adminService.obtener_admin(this.id, this.token).subscribe(
				(response) => {
					if (!response.data) {
						this.estudiante = undefined;
						this.load_data = false;
					} else {
						this.estudiante = response.data;
						this.auxadmin = this.estudiante;
						this.auxadmin.password = '';

						this.load_data = false;
						this.estudiante.password = '';
						this.estudiante.auxiliar = '';
					}
				},
				(error) => {}
			);
		});
	}

	actualizar(updateForm: { valid: any }) {
		if (
			this.estudiante.password != this.estudiante.auxiliar ||
			(this.estudiante.password != '' && this.estudiante.password.length < 8)
		) {
			iziToast.error({
				title: 'ERROR',
				position: 'topRight',
				message: 'Contraseña, minimo 8 caracteres',
			});
			this.estudiante.password = '';
			this.estudiante.auxiliar = '';
		} else {
			if (updateForm.valid) {
				this.load_btn = true;
				this._adminService.actualizar_admin(this.id, this.estudiante, this.token).subscribe((response) => {
					if (response.message == 'Actualizado con éxito') {
						iziToast.success({
							title: 'ÉXITOSO',
							position: 'topRight',
							message: response.message,
						});
						this.load_btn = false;
						this._router.navigate(['/estudiantes']);
					} else {
						iziToast.error({
							title: 'ERROR',
							position: 'topRight',
							message: response.message,
						});
						this.load_btn = false;
						this.ngOnInit();
					}
				});
			}
		}
	}
}
