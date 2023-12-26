import { Component,OnInit } from '@angular/core';
import { ConfigService } from 'src/app/service/config.service';
@Component({
  selector: 'app-menu-dashboard',
  templateUrl: './menu-dashboard.component.html',
  styleUrls: ['./menu-dashboard.component.scss']
})
export class MenuDashboardComponent implements OnInit{
  
  public load_estudiantes=false;
  public load_ventas=false;  
  public load_documentos=false;
  public load_administrativo=false;
  constructor(private _configService:ConfigService) {
  }

  private config=this._configService.getConfig()as { imagen: string, identity: string, token: string , rol:string};
  public rol:any;
  ngOnInit(): void {
    this.rol=this.config.rol;
    this.estadoestudiante();
	}
  
  estadoestudiante(){
    this.load_estudiantes=false;
    this.load_ventas=false;  
    this.load_documentos=false;
    this.load_administrativo=false;

    this.load_estudiantes=true;
  }
  estadoventas(){
    this.load_estudiantes=false;
    this.load_ventas=false;  
    this.load_documentos=false;
    this.load_administrativo=false;
    this.load_ventas=true;
  }
  estadodocumento(){
    this.load_estudiantes=false;
    this.load_ventas=false;  
    this.load_documentos=false;
    this.load_administrativo=false;
    this.load_documentos=true;
  }
  estadoadministrativo(){
    this.load_estudiantes=false;
    this.load_ventas=false;  
    this.load_documentos=false;
    this.load_administrativo=false;
    this.load_administrativo=true;
  }

}
