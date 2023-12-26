import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/service/admin.service';
import { Chart } from 'chart.js/auto';
import { Colors } from 'chart.js';
Chart.register(Colors);
//Chart.register(LinearScale);
@Component({
  selector: 'app-control-document',
  templateUrl: './control-document.component.html',
  styleUrls: ['./control-document.component.scss']
})
export class ControlDocumentComponent implements OnInit{
  	public documentos: Array<any> = [];
	public documentos_const: Array<any> = [];
  	public documento_arr: Array<any> = [];  	
  	public sobrante = 0;
	public page = 1;
	public pageSize = 10;
  constructor(private _adminService: AdminService) {}

  ngOnInit(): void {
    this._adminService.listar_documentos_admin(localStorage.getItem('token')).subscribe((response) => {
			let lb: Array<any> = [];
			this.documentos_const = response.data;
			this.documentos = this.documentos_const;
      
			if (this.documentos != undefined) {
				for (var i = 0; i < this.documentos.length; i++) {
					if (i == 0 && new Date(this.documentos[i].f_deposito).getFullYear() == new Date().getFullYear()) {
						lb.push(this.documentos[i].cuenta);
					} else if (lb.indexOf(this.documentos[i].cuenta) == -1) {
						lb.push(this.documentos[i].cuenta);
					}
				}

				/*var data: Array<any> = [];
				for (var k = 0; k < lb.length; k++) {
					data.push(0);
				}*/
				//let data=0;
				for (var i = 0; i < this.documentos.length; i++) {
					if (new Date(this.documentos[i].f_deposito).getFullYear() == new Date().getFullYear()) {
						if (i == 0) {
							this.documento_arr.push({
								label:
									new Date(this.documentos[i].createdAt).getFullYear().toString() +
									' ' +
									this.documentos[i].cuenta,
								data: this.documentos[i].valor,
								//backgroundColor: this.getRandomColor(),
								//borderColor:this.getRandomColor(),
								borderWidth: 2,
							});
						} else {
							let aux =
								new Date(this.documentos[i].createdAt).getFullYear().toString() +
								' ' +
								this.documentos[i].cuenta;
							let con = -1;
							con = this.documento_arr.indexOf(aux);
							for (var j = 0; j < this.documento_arr.length; j++) {
								if (this.documento_arr[j].label.toString() == aux) {
									con = j;
								}
							}
							if (con == -1) {
								var auxcolor1 = Math.random() * 130;
								this.documento_arr.push({
									label:
										new Date(this.documentos[i].createdAt).getFullYear().toString() +
										' ' +
										this.documentos[i].cuenta,
									data: this.documentos[i].valor,
									//backgroundColor: this.getRandomColor(),
									//borderColor: this.getRandomColor(),
									borderWidth: 2,
								});
							} else {
								this.documento_arr[con].data =
									this.documento_arr[con].data + parseFloat(this.documentos[i].valor);
							}
						}
					}
				}

				for (let item of this.documento_arr) {
					var fech: string = item.label;
					if (fech.includes(new Date().getFullYear().toString())) {
						this.sobrante += parseFloat(item.data);
					}
				}
				for (let itm of this.documento_arr) {
					var aux = [];
					for (var k = 0; k < lb.length; k++) {
						aux.push(0);
					}
					var aux1 = itm.label;
					var palabrasProhibidas = [
						new Date().getFullYear().toString() + ' ',
						'tonto',
						'palabra-vulgar-1',
						'palabra-vulgar-2',
					];
					var numeroPalabrasProhibidas = palabrasProhibidas.length;

					while (numeroPalabrasProhibidas--) {
						if (aux1.indexOf(palabrasProhibidas[numeroPalabrasProhibidas]) != -1) {
							aux1 = aux1.replace(new RegExp(palabrasProhibidas[numeroPalabrasProhibidas], 'ig'), '');
						}
					}

					var aux2 = lb.indexOf(aux1);
					aux[aux2] = itm.data;
					itm.data = aux;
				}
				
				var canvas = <HTMLCanvasElement>document.getElementById('myChart2');
				var ctx: CanvasRenderingContext2D | any;
				ctx = canvas.getContext('2d');

				var myChart2 = new Chart(ctx, {
					type: 'bar',
					data: {
						labels: lb,
						datasets: this.documento_arr,
					},
					options: {
						plugins: {
						colors: {
							forceOverride: true
						}
						},
						scales: {
							y: {
								beginAtZero: true
							},
						},
					},
				});
				this.documentos=this.documentos.filter(o=>o.valor>0.01);
				this.documentos = this.documentos.sort(function (a, b) {

					if(a.valor<b.valor){
						return 1
					}
					if(a.valor>b.valor){
						return -1
					}

					return 0;
		
				});

			}
		});
  }
}
