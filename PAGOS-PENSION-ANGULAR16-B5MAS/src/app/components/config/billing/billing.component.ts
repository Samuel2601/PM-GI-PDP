import { Component,OnInit } from '@angular/core';
import { ConfigService } from 'src/app/service/config.service';
declare var $: any;
import iziToast from 'izitoast';
@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {
  constructor(private _configservie: ConfigService) {
  }
  public config:any={
	ruc:'',
	
  }
  public sri:any={};
  public token = localStorage.getItem('token');
  public file:any;
  ngOnInit(): void {
    this._configservie.getsri().subscribe(response=>{      
      if(response){
        this.sri=response;
		//console.log(response);
		this._configservie.get_conf_facturacion(this.token).subscribe(response=>{      
			if(response){			  
			  //console.log(response);
			  this.config=response.data
			  this.config.password='';
			  this.config.correo_password='';
			  this.file=undefined
			  $('#input-portada').text(this.config.archivo);
			}
		  });
      }
    });
  }
  actualizar(actualizarForm: any) {
    if(actualizarForm.valid){
		//console.log(this.config);
		
		this._configservie.actualizar_conf_facturacion(this.config,this.file,this.token).subscribe(response=>{
			//console.log(response);
			if(response.message){
				iziToast.info({
					title: 'RES',
					position: 'topRight',
					message: response.message,
				});
			}
		});
	}else{
		iziToast.warning({
			title: 'Peligro',
			position: 'topRight',
			message: 'Hay valores vacios',
		});
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
				message: 'No hay un archivo.p12 de envio',
			});
		}

		if (file.size <= 4000000) {
      		if (file.type == 'application/x-pkcs12' || file.type == 'application/octet-stream') {

				const archivoName = file.name.replace(/ /g, '_');
				this.config.archivo_name = archivoName;
				$('#input-portada').text(archivoName);
				
				this.file = file;
			} else {
				iziToast.error({
					title: 'ERROR',
					position: 'topRight',
					message: 'El archivo debe ser un archivo tipo .p12',
				});
				$('#input-portada').text('Seleccionar imagen');
				//this.imgSelect = 'assets/img/01.jpg';
				this.file = undefined;
			}
		} else {
			iziToast.error({
				title: 'ERROR',
				position: 'topRight',
				message: 'La imagen no puede superar los 4MB',
			});
			$('#input-portada').text('Seleccionar imagen');
			this.file = undefined;
		}
	}


  view_password(label:any) {
		let type = $('#'+label).attr('type');

		if (type == 'text') {
			$('#'+label).attr('type', 'password');
		} else if (type == 'password') {
			$('#'+label).attr('type', 'text');
		}
	}

}
