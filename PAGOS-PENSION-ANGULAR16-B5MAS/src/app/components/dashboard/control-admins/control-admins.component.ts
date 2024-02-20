import { Component, OnInit} from '@angular/core';
import { AdminService } from 'src/app/service/admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-control-admins',
  templateUrl: './control-admins.component.html',
  styleUrls: ['./control-admins.component.scss']
})
export class ControlAdminsComponent implements OnInit {
  
  constructor(private _adminService: AdminService,private fb: FormBuilder) {}
  public resgistro_arr: any[] =[];
  public resgistro_const: any[] =[];
  public filtro='';
  public page = 1;
  public formulario:any;
	public pageSize = 10;
	public desde: any = new Date();
	public hasta: any = new Date();
  ngOnInit(): void {
    this.filtro='';
	// Restar un mes a la fecha "desde"
	this.desde.setMonth(this.desde.getMonth() - 1);
	this.recarga();
	}
	filtrar_fechas(){
		this.recarga();
	}
	reset_data() {
		this.desde.setMonth(this.desde.getMonth() - 1);
		this.hasta = new Date();;
		this.filtro = '';
		this.recarga();
	}
	recarga(){
		this._adminService.listar_registro(localStorage.getItem('token'),this.desde,this.hasta).subscribe((response) => {

			this.resgistro_const=response.data.map((item:any)=>{
				if(item.admin){
					return{
						admin:{
							apellidos: item.admin.apellidos,
							nombres: item.admin.nombres,
							email: item.admin.email,
						},
						createdAt:item.createdAt,
						descripcion:item.descripcion,
						tipo:item.tipo,
					  _id:item._id,
					}
				}else{
					return{
						createdAt:item.createdAt,
						descripcion:item.descripcion,
						tipo:item.tipo,
					  _id:item._id,
					}
				}
				
			  });

			this.resgistro_arr = Object.assign(this.resgistro_const);
		});
	}
	ver(element:any){
		this.formulario=[];
		try {
			this.formulario.push(JSON.parse(element));
		} catch (error) {
			let jsonString = element; // Tu cadena con los dos objetos JSON
			const pattern = /(\{.*?\})/g;
			const parsedObjects = [];
			let match;
			while ((match = pattern.exec(jsonString)) !== null) {
			parsedObjects.push(JSON.parse(match[0]));
			}
			// Crea el formulario dinámico
			this.formulario = parsedObjects;
		}
	}
	getObjectKeys(obj: any): string[] {
		return Object.keys(obj);
	  }
	isObject(value: any): boolean {
	return typeof value === 'object' && value !== null;
	}
	isObjectArray(value: any): boolean {
		return Array.isArray(value);
	  }	  
  filtrar_documento() {
	this.resgistro_arr = this.resgistro_const;
		if (this.filtro) {
			var term = new RegExp(this.filtro.toString().trim(), 'i');
			this.resgistro_arr = this.resgistro_const.filter(
				(item) => term.test(item.tipo) || term.test(item.createdAt) || term.test(item.admin?.email) || item.descripcion.includes(this.filtro)
			);
		}
	}
}
