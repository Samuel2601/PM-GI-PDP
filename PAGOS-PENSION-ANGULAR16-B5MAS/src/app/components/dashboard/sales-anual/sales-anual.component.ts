import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/service/admin.service';
import { Chart } from 'chart.js/auto';
import { Colors } from 'chart.js';
import { ConfigService } from 'src/app/service/config.service';
import { GLOBAL } from 'src/app/service/GLOBAL';
Chart.register(Colors);
@Component({
  selector: 'app-sales-anual',
  templateUrl: './sales-anual.component.html',
  styleUrls: ['./sales-anual.component.scss']
})
export class SalesAnualComponent implements OnInit{
  public auxanio: Array<any> = [];
  public anio: Array<any> = [];
  public datosventa = {};
  public ventas: Array<any> = [];
  public totalfactual = 0;
  public pagosmes = 0;
  public totalfaux = 0;
  public factual = new Date();
  public faux = new Date().setFullYear(new Date().getFullYear() - 1);
  public auxfactual =new Date().getMonth();
  public pagos: Array<any> = [];
  public arraymes = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
 ];
 public director=this._configService.getDirector();
 public delegado=this._configService.getDelegado();
 public admin=this._configService.getAdmin();
 public url = GLOBAL.url;

 public token=localStorage.getItem('token');
  public page = 1;
	public pageSize = 10;

	public desde: any = new Date();
	public hasta: any = new Date();
  public info:any;
  constructor(private _adminService: AdminService,private _configService:ConfigService) {}
  private config_sistem=this._configService.getConfig()as { imagen: string, identity: string, token: string , rol:string};
  public imagen=this.config_sistem.imagen;

 imprimir(){
  let printContents, popupWin;
    let aux=document.getElementById('titulo');
    if(aux){
      aux.style.display='';
    }
		printContents = document.getElementById('imprimir')?.innerHTML;
		popupWin = window.open('', '_blank', 'top=0,left=0,height=auto,width=auto');
		popupWin?.document.open();
		popupWin?.document.write(
			`
   <html>
     <head>
       <title>DETALLE ECONOMICO DE PAGOS (` +new Date().getFullYear()
				 +
				`)</title>
       <style>

      td {
        border:  1px solid;
      }
      tr {
        border:  1px solid;
      }
      th {
        border:  1px solid;
      }
      thead.th {
        border:  1px solid;
      }

       </style>
       <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

     </head>
       <body onload="window.print();window.close()">



       ${printContents}



       </body>
       <footer style="margin-top: 10%;margin-right: auto;margin-left: auto;">
       <div style="margin-right: auto;margin-left: auto;">
                          <table id="detalleeconomico" class="table table-sm table-nowrap card-table" style="width: 100%" >

                              <thead style="border:0">
                                <th style="border:0"></th>
                                <th style="border:0">&nbsp&nbsp</th>
                                <th style="border:0"></th>
                                <th style="border:0">&nbsp&nbsp</th>
                                <th style="border:0">  </th>
                              </thead>
                              <tbody>
                                <tr style="border:0;text-align: center;">
                                  <th style="border:0;text-align: center;"><p> ` +
				this.director +
				`</p><p>Director(a)</p></th>
                                  <th style="border:0 ;text-align: center;"></th>
                                  <th style="border:0;text-align: center;"><p> ` +
				this.delegado +
				`</p><p>Delegado del Obispo</p></th>
                                  <th style="border:0;text-align: center;"></th>
                                  <th style="border:0;text-align: center;"><p> ` +
                                  this.admin +
                                  `</p><p>  Responsable </p></th>
                                                           </tr>

                                                         </tbody>

                          </table>
      </div>



      </footer>
   </html>`
		);
    let divimpri=popupWin?.document.getElementById("impresion");
    if(divimpri){
      divimpri.style.display = '';
    }
		popupWin?.document.close();
    if(aux){
      aux.style.display='none';
    }
 }
  ngOnInit(): void {
    this._adminService.obtener_info_admin(this.token).subscribe((responese) => {
      if(responese.data){
        this.info=responese.data;
          // Obtén el año actual
    const añoActual = new Date().getFullYear();

    // Establece la fecha "desde" al 1 de enero del presente año
    this.desde = new Date(añoActual-1, 0, 1);

    // Establece la fecha "hasta" al 31 de diciembre del presente año
    this.hasta = new Date(añoActual, 11, 31);

		this.auxanio = [];
		this.ventas = [];
		this.anio = [];
		this.totalfactual = 0;
		this.pagosmes = 0;
    this._adminService.obtener_pagos_dash(this.token,this.desde,this.hasta).subscribe((response) => {

      if(response.data){
        this.ventas = response.data;
        console.log(this.ventas);
        if (this.ventas != undefined) {
          for (var i = 0; i < this.ventas.length; i++) {
            if (
              new Date(this.ventas[i].createdAt).getFullYear() == new Date(this.faux).getFullYear()
            ) {
              this.totalfaux = this.ventas[i].valor + this.totalfaux;
            } else if (
              new Date(this.ventas[i].createdAt).getFullYear() == new Date(this.factual).getFullYear()
            ) {
              this.totalfactual += this.ventas[i].valor;
            }

            if (
              i == 0 &&
              new Date(this.ventas[i].createdAt).getFullYear() == new Date(this.factual).getFullYear()
            ) {
              this.anio.push({
                label:
                  new Date(this.ventas[i].idpension.anio_lectivo).getFullYear().toString() +
                  ' ' +
                  this.ventas[i].idpension.curso +
                  this.ventas[i].idpension.paralelo+(this.ventas[i].idpension.especialidad||'EGB'),
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(54,162,235,0.2)',
                borderColor: 'rgba(54,162,235,1)',
                borderWidth: 2,
              });
              this.anio[0].data[new Date(this.ventas[i].createdAt).getMonth()] =
                this.anio[0].data[new Date(this.ventas[i].createdAt).getMonth()] + this.ventas[i].valor;
            } else if (
              new Date(this.ventas[i].createdAt).getFullYear() == new Date(this.factual).getFullYear()
            ) {
              let aux =
                new Date(this.ventas[i].idpension.anio_lectivo).getFullYear().toString() +
                ' ' +
                this.ventas[i].idpension.curso +
                this.ventas[i].idpension.paralelo+(this.ventas[i].idpension.especialidad||'EGB');
              let con = -1;
              for (var j = 0; j < this.anio.length; j++) {
                if (this.anio[j].label.toString() == aux) {
                  con = j;
                }
              }
              if (con == -1) {
                var auxcolor1 = Math.random() * 255;
                var auxcolor2 = Math.random() * 255;

                this.anio.push({
                  label:
                    new Date(this.ventas[i].idpension.anio_lectivo).getFullYear().toString() +
                    ' ' +
                    this.ventas[i].idpension.curso +
                    this.ventas[i].idpension.paralelo+(this.ventas[i].idpension.especialidad||'EGB'),
                  data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  backgroundColor: 'rgba(' + auxcolor2 + ',' + auxcolor1 + ',200,0.2)',
                  borderColor: 'rgba(' + auxcolor2 + ',' + auxcolor1 + ',200,1)',
                  borderWidth: 2,
                });
                this.anio[this.anio.length - 1].data[new Date(this.ventas[i].createdAt).getMonth()] =
                  this.anio[this.anio.length - 1].data[new Date(this.ventas[i].createdAt).getMonth()] +
                  this.ventas[i].valor;
              } else {
                this.anio[con].data[new Date(this.ventas[i].createdAt).getMonth()] =
                  this.anio[con].data[new Date(this.ventas[i].createdAt).getMonth()] + this.ventas[i].valor;
              }
            }
          }

          if (document.getElementById('myChart2') != null) {
            this.anio.forEach((element) => {

              //this.myChart.data.datasets.push(element);
              this.auxanio.push(element);

              this.pagosmes += element.data[this.auxfactual];

            });
            this.pagos=[{label:'valores Recaudados',data:{
              'Enero':0,
              'Febrero':0,
              'Marzo':0,'Abril':0,'Mayo':0,'Junio':0,'Julio':0,'Agosto':0,'Septiembre':0,'Octubre':0,'Noviembre':0,'Diciembre':0},backgroundColor
            :"rgba(54,162,235,0.2)",borderColor:"rgba(54,162,235,1)",borderWidth:2}]
            this.anio.forEach((element:any) => {
              element.data.forEach((elementdata:any, index:any) => {
                this.pagos[0].data[this.arraymes[index]]=this.pagos[0].data[this.arraymes[index]]+elementdata
              });
            });

            var canvas = <HTMLCanvasElement>document.getElementById('myChart2');
            var ctx: CanvasRenderingContext2D | any;
            ctx = canvas.getContext('2d');

            var myChart = new Chart(ctx, {
              type: 'bar',
              data: {
                labels:this.arraymes,
                datasets: this.pagos,
              },
              options: {
                plugins: {
                  colors: {
                    forceOverride: true
                  }
                  },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              },
            });

            this.ordenarmes();
          }

        }
      }
    });
      }});


	}
	ordenarmes(eve?:any){

    let auxfactual=this.auxfactual;
    this.auxanio = this.auxanio.sort(function (a, b) {

      if(a.data[auxfactual]<b.data[auxfactual]){
        return 1
      }
      if(a.data[auxfactual]>b.data[auxfactual]){
        return -1
      }
      return 0;

    });

	}
}
