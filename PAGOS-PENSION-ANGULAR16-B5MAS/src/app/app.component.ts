import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from './service/admin.service';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.scss'],
})
export class AppComponent {
	public rol: any;
	public estado: any;
	public token = localStorage.getItem('token');
	public geo = localStorage.getItem('geo');

	title = 'admin';
	constructor(private _adminService: AdminService, private _router: Router) {}

	ngOnInit(): void {
		if (localStorage.getItem('token') != null) {
			this._adminService.verificar_token(localStorage.getItem('token')).subscribe(
				(response) => {},
				(error) => {
					localStorage.clear();

					this._router.navigate(['/login']);
				}
			);
		}
		if (this.geo == null) {
			this._adminService.obtener_ip_admin().subscribe((response) => {
				this._adminService.obtener_data_admin(response.ip).subscribe((response) => {
					localStorage.setItem('geo', JSON.stringify(response));
					///  console.log(localStorage.setItem('geo',JSON.stringify(response)));
					window.location.reload();
				});
			});
		}
	}
}
