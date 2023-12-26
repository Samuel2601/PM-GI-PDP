import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import iziToast from 'izitoast';
declare var $: any;

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})



export class ForgotPasswordComponent implements OnInit {
	constructor(private _adminService: AdminService, private _router: Router) {}

	ngOnInit(): void {}
	public userEmail: any = ''; // new FormControl('');
	async onReset() {
		try {
			const email = this.userEmail;
			this._adminService.forgotpassword(this.userEmail).subscribe((response) => {
				////console.log(response);
				window.alert('Email sent, check your inbox!' + response.message);
			});

			this._router.navigate(['/login']);
		} catch (error) {
			//console.log(error);
		}
	}

	login(loginForm: any) {
		if (loginForm.valid) {
			try {
				const email = this.userEmail;
				//console.log(email);
				this._adminService.forgotpassword({ email }).subscribe((response) => {
				//	console.log(response);

					iziToast.show({
						title: 'INFO',
						class: 'iziToast-info',
						position: 'topRight',
						message: response.message,
					});
					this._router.navigate(['/login']);
					// window.alert(response.message);
				});
			} catch (error) {
				console.log(error);
			}
		}
	}
	inicio() {
		this._router.navigate(['/login']);
	}
}
