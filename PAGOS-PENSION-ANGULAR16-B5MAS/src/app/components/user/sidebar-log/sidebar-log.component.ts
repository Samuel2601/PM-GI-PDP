import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
declare var $: any;
import iziToast from 'izitoast';
@Component({
  selector: 'app-sidebar-log',
  templateUrl: './sidebar-log.component.html',
  styleUrls: ['./sidebar-log.component.scss']
})
export class SidebarLogComponent implements OnInit{
  constructor(private _adminService: AdminService, private _router: Router) {}
	public pathname='';
	public URLactual:any;
	ngOnInit(): void {
		this.pathname = window.location.pathname;
		this.URLactual = window.location;
		//console.log(this.URLactual);
	}
}
