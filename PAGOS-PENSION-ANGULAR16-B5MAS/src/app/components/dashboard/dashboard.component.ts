import { Component,OnInit } from '@angular/core';
import { AdminService } from 'src/app/service/admin.service';
import { ConfigService } from 'src/app/service/config.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  

  constructor(private _configService:ConfigService,private _adminService:AdminService) {
  }

  private config=this._configService.getConfig()as { imagen: string, identity: string, token: string , rol:string};
  public rol=this.config.rol;
  ngOnInit(): void {
    if(this._configService.getDirector()==''||this._configService.getDelegado()==''){
      this._adminService.listar_admin(this.config.token).subscribe((response) => {
        let respon = response.data;
        respon.forEach((element:any) => {
          if (element.rol == 'direc') {
            this._configService.setDirector(element.nombres + ' ' + element.apellidos);
          }
          if (element.rol == 'delegado') {
            this._configService.setDelegado(element.nombres + ' ' + element.apellidos);
          }
        });
      });
    }    
	}
}
