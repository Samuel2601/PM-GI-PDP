
import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/service/admin.service';
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
declare var $: any;
declare var jQuery: any;

@Component({
  selector: 'app-index-admins',
  templateUrl: './index-admins.component.html',
  styleUrls: ['./index-admins.component.scss']
})





export class IndexAdminsComponent implements OnInit {
	public estudiantes: Array<any> = [];
	public estudiantes_const: Array<any> = [];
	public token = localStorage.getItem('token');
	public rol: any;
	public yo = 0;
	public page = 1;
	public pageSize = 10;
	public filtro = '';
	public idadmin = '';
	public config = {
		licenciacvs: '',
	};
	constructor(private _adminService: AdminService) {}

	ngOnInit(): void {
		let aux = JSON.parse(localStorage.getItem('user_data')!);
		if (aux.email == 'samuel.arevalo@espoch.edu.ec') {
			this.yo = 1;
			this.idadmin = aux._id;
				this.rol = aux.rol;
		}else{
			this._adminService.obtener_admin(aux._id, this.token).subscribe((response) => {
				this.idadmin = response.data._id;
				this.rol = response.data.rol;
			});
		}

		

		this._adminService.listar_admin(this.token).subscribe((response) => {
			this.estudiantes_const = response.data;
			this.estudiantes = this.estudiantes_const;
		});
		this._adminService.obtener_config_admin(this.token).subscribe((response) => {
			this.config = response.data[0];
		});
	}

	filtrar_estudiante() {
		if (this.filtro) {
			var term = new RegExp(this.filtro.toString().trim(), 'i');
			this.estudiantes = this.estudiantes_const.filter(
				(item) =>
					term.test(item.nombres) ||
					term.test(item.apellidos) ||
					term.test(item.email) ||
					term.test(item.dni) ||
					term.test(item.telefono) ||
					term.test(item._id)
			);
		} else {
			this.estudiantes = this.estudiantes_const;
		}
	}
	eliminar(id: any) {
		this._adminService.eliminar_admin(id, this.token).subscribe(
			(response) => {
				iziToast.show({
					title: 'SUCCESS',
					titleColor: '#1DC74C',
					color: '#FFF',
					class: 'text-success',
					position: 'topRight',
					message: 'Se eliminó correctamente el cliente.',
				});

				$('#delete-' + id).modal('hide');
				$('.modal-backdrop').removeClass('show');

				this.ngOnInit();
			},
			(error) => {
				console.log(error);
			}
		);
	}
}
