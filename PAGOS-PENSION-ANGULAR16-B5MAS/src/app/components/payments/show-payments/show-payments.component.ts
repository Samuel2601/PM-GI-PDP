import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import { EstudianteService } from 'src/app/service/student.service';
import { GLOBAL } from 'src/app/service/GLOBAL';
import { TableUtil, TableUtil2 } from '../show-payments/tableUtil';
//import {createClient} from 'soap';
import iziToast from 'izitoast';
import { lastValueFrom } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-show-payments',
  templateUrl: './show-payments.component.html',
  styleUrls: ['./show-payments.component.scss'],
})
export class ShowPaymentsComponent implements OnInit {
  public pago: any = {};
  public id = '';
  public token = localStorage.getItem('token');
  public load = false;
  public link = '';
  public url = GLOBAL.url;
  public detalles: Array<any> = [];
  public load_data = true;

  public totalstar = 5;

  public review: any = {};
  public load_send = false;
  public load_conf_pago = false;
  public load_final = false;
  public load_del = false;
  public tracking = '';
  public mes: any;
  public auxmes: any;
  public auxmes1: any;
  public auxmes2: any;
  public auxmes3: any;
  public auxmes4: any;
  public auxmes5: any;
  public auxmes6: any;
  public auxmes7: any;
  public auxmes8: any;
  public auxmes9: any;
  public auxmes10: any;
  public idpension: any;
  public registro: any = {};
  public xmlItems: any;
  private auxp = 0;
  private mesespdf = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Setiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  public imagen: any;
  public fecha: Array<any> = [];
  public pension: any = {};
  public linkfact = '';
  constructor(
    private _route: ActivatedRoute,
    private _adminService: AdminService,

    private _estudianteService: EstudianteService,
    private _router: Router
  ) {
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
  }
  public rol = '';
  public idp = '';
  public yo = 0;
  public info: any;
  public base: any;
  ngOnInit(): void {
    this._adminService.obtener_info_admin(this.token).subscribe((responese) => {
      if (responese.data) {
        this.info = responese.data;
        this.imagen = JSON.parse(
          localStorage.getItem('user_data') || ''
        )?.portada;
        this._route.params.subscribe(async (params) => {
          this.id = params['id'];
          let aux = JSON.parse(localStorage.getItem('user_data')!);
          this.rol = aux.rol;
          this.base = aux.base;
          this.idp = aux._id;
          await this.init_data();
        });
      }
    });
  }

  async init_data() {
    try {
      const response = await lastValueFrom(
        this._adminService.obtener_detalles_ordenes_estudiante(
          this.id,
          this.token
        )
      );

      if (response.data != undefined) {
        this.pago = response.data;
        console.log(response);
        this.detalles = response.detalles;

        this.detalles.forEach((element: any) => {
          element.aniosup = new Date(
            new Date(element.idpension.anio_lectivo).setFullYear(
              new Date(element.idpension.anio_lectivo).getFullYear() + 1
            )
          ).getFullYear();
        });

        this.load_data = false;

        await this.detalle_data(); // Espera que termine

        await this.armado2();

        //await this.armado(); // Luego espera este
      } else {
        this.pago = undefined;
        this.load_data = false;
      }
    } catch (error) {
      console.error('Error al obtener los detalles:', error);
      this.load_data = false;
    }
  }
  exportTable() {
    TableUtil.exportToPdf(
      this.mesespdf[new Date(this.auxmes).getMonth()].toString() +
        ' ' +
        new Date(this.auxmes).getFullYear().toString() +
        '-' +
        (new Date(this.auxmes).getFullYear() + 1).toString(),
      (this.url + 'obtener_portada/' + this.imagen).toString(),
      this.info
    );
  }
  exportTable2() {
    TableUtil2.exportToPdf(
      this.mesespdf[new Date(this.auxmes).getMonth()].toString() +
        ' ' +
        new Date(this.auxmes).getFullYear().toString() +
        '-' +
        (new Date(this.auxmes).getFullYear() + 1).toString(),
      (this.url + 'obtener_portada/' + this.imagen).toString(),
      this.info
    );
  }
  async detalle_data() {
    try {
      const response = await lastValueFrom(
        this._estudianteService.obtener_pension_estudiante_guest(
          this.pago.estudiante._id,
          this.token
        )
      );

      this.pension = response.data;

      for (let i = 0; i < this.pension.length; i++) {
        if (this.pension[i]._id === this.detalles[0].idpension._id) {
          this.idpension = this.pension[i]._id;
          this.auxp = i;
          this.auxmes = this.pension[i].anio_lectivo;
          this.fecha = [];

          for (let j = 0; j < 10; j++) {
            this.fecha.push({
              date: new Date(this.pension[i].anio_lectivo).setMonth(
                new Date(this.pension[i].anio_lectivo).getMonth() + j
              ),
            });
          }

          if (
            this.pago.estado === 'Registrado' &&
            this.pension[i].idanio_lectivo.facturacion != null
          ) {
            this.linkfact = this.pension[i].facturacion;
          }

          break; // Salimos del bucle, ya encontramos el elemento
        }
      }
    } catch (error) {
      console.error('Error al obtener los datos de la pensión:', error);
    }
  }

  //public  = require('soap');
  /*
	fsoap() {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open('POST', 'https://somesoapurl.com/', true);

		// build SOAP request
		var sr =
			'<?xml version="1.0" encoding="utf-8"?>' +
			'<soapenv:Envelope ' +
				'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
				'xmlns:api="http://127.0.0.1/Integrics/Enswitch/API" ' +
				'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
				'xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">' +
				'<soapenv:Body>' +
					'<api:some_api_call soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
						'<username xsi:type="xsd:string">login_username</username>' +
						'<password xsi:type="xsd:string">password</password>' +
					'</api:some_api_call>' +
				'</soapenv:Body>' +
			'</soapenv:Envelope>';

		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 200) {
					alert(xmlhttp.responseText);
					// alert('done. use firebug/console to see network response');
				}
			}
		}
		// Send the POST request
		xmlhttp.setRequestHeader('Content-Type', 'text/xml');
		xmlhttp.send(sr);
		// send request
		// ...
	}
*/

  factura_electronica_soap() {
    this.armado();
    //console.log(this.registro);
    if (this.error_constru == '' && JSON.stringify(this.registro) != '{}') {
      this._adminService
        .marcar_finalizado_orden(this.pago._id, this.registro, this.token)
        .subscribe((response) => {
          //console.log(response);
          if (response.message) {
            iziToast.info({
              title: 'RESP API:',
              position: 'topRight',
              message: response.message,
            });
          } else {
            iziToast.error({
              title: 'ERROR',
              position: 'topRight',
              message: 'Algo Salio mal',
            });
          }
          setTimeout(() => {
            location.reload();
          }, 1000);
        });
    } else {
      iziToast.error({
        title: 'DANGER',
        position: 'topRight',
        message: this.error_constru,
      });
    }
  }
  private error_constru = '';
  public loademit: boolean = false;
  async armado() {
    //console.log(this.pension[this.auxp]);
    //if(this.linkfact!=''){
    ////console.log(this._adminService.ejemplo(1112,this.token));
    //console.log("this.pago",this.pago);

    //console.log("this.detalles",this.detalles);
    //console.log("this.pension[this.auxp]",this.pension[this.auxp]);

    this.registro.cedulaEstudiante = this.pago.estudiante.dni.toString();
    this.registro.nombreEstudiante = (
      this.pago.estudiante.apellidos +
      ' ' +
      this.pago.estudiante.nombres
    ).toString();
    this.registro.direccionEstudiante =
      this.pago.estudiante.direccion.toString();
    if (this.pago.estudiante.telefono) {
      this.registro.telefonoEstudiante =
        (this.pago.estudiante?.telefono).toString();
    } else {
      this.registro.telefonoEstudiante = '9999999999';
    }

    this.registro.emailEstudiante = this.pago.estudiante.email.toString();

    this.registro.cedulaPadre = this.pago.estudiante.dni_padre.toString();
    this.registro.nombrePadre = this.pago.estudiante.nombres_padre.toString();
    this.registro.facturarA = this.pago.estudiante.dni_factura.toString();
    this.registro.codigoTipocomprobante = parseInt(this.pago.tipo_documento);
    this.registro.subtotal = 0; //parseFloat(this.pago.total_pagar.toFixed(2));
    this.registro.tarifaCero = parseFloat(this.pago.total_pagar.toFixed(2));
    this.registro.tarifaDoce = parseFloat('0');
    this.registro.valorIva = parseFloat('0');
    this.registro.totalFactura = parseFloat(this.pago.total_pagar.toFixed(2));
    this.registro.codigoTipopagosri = parseInt('20');

    //this.registro.emailPadre=(this.pago.estudiante.email_padre).toString();

    //console.log(this.detalles.length);
    this.registro.detalleFactura = '';
    let detalle_aux = this.detalles; //.filter((element)=>element.tipo<11);
    //console.log("Detalles filstrados",detalle_aux);
    for (var k = 0; k < detalle_aux.length; k++) {
      let dtll = detalle_aux[k];
      //console.log(dtll);
      let aux: any = {};
      aux[0] = 0; //0
      aux[1] = 0; //0
      aux[2] = 0; //0
      aux[3] = k + 1; //numero de Item
      aux[4] = 0; //0
      aux[5] = 1; //1
      if (dtll.tipo == 0) {
        aux[6] = 99; //Codigo de Producto
      } else {
        aux[6] = dtll.tipo; //Codigo de Producto
      }

      aux[7] = this.pago.tipo_tarifa; //Tipo Tarifa
      aux[8] = 0; //0
      aux[9] = 2; //Tipo producto
      //aux[10]='0'; 		//Descripción
      if (dtll.tipo == 0) {
        aux[10] = 'Matricula';
        //aux[12] = parseFloat(parseFloat(this.pension[this.auxp].idanio_lectivo.matricula).toFixed(2)); //Precio Unitario
      } else if (dtll.tipo > 0 && dtll.tipo <= 11) {
        for (var i = 0; i < this.fecha.length; i++) {
          if (i + 1 == dtll.tipo) {
            var date = new Date(this.fecha[i].date);
            let month = date.toLocaleString('default', { month: 'long' });
            ////console.log(month+' '+new Date (this.fecha[i].date).getFullYear());
            aux[10] = (
              'Pensión ' +
              month +
              ' ' +
              new Date(this.fecha[i].date).getFullYear()
            ).toString();
          }
        }
        //aux[12] = parseFloat(parseFloat(this.pension[this.auxp].idanio_lectivo.pension).toFixed(2)); //Precio Unitario
      } else if (dtll.descripcion) {
        //aux[12] = parseFloat(parseFloat(this.pension[this.auxp].idanio_lectivo.pension).toFixed(2)); //Precio Unitario
        aux[10] = dtll.descripcion;
      } else {
        this.error_constru = 'Sin descripción, no se puede emitir';
      }

      aux[11] = dtll.estado; //Observación

      aux[13] = 0; //0
      aux[14] = 0; //0
      aux[15] = 1; //cantidad
      aux[16] = 0; //medida1
      aux[17] = 0; //0
      aux[18] = "''"; //''
      if (
        this.pension[this.auxp].condicion_beca == 'Si' &&
        dtll.tipo > 0 &&
        dtll.tipo <= 10 &&
        dtll.valor == parseFloat(this.pension[this.auxp].val_beca).toFixed(2) &&
        dtll.abono == 0
      ) {
        aux[19] = parseFloat(
          (
            this.pension[this.auxp].idanio_lectivo.pension -
            this.pension[this.auxp].val_beca
          ).toFixed(2)
        );
        /*
				parseFloat((parseFloat ( parseFloat(this.pension[this.auxp].idanio_lectivo.pension).toFixed(2)) -parseFloat(
					(
						(parseFloat(parseFloat(this.pension[this.auxp].idanio_lectivo.pension).toFixed(2)) *
							parseFloat(parseFloat(this.pension[this.auxp].desc_beca).toFixed(2))) /
						100
					).toFixed(2)
				) ).toFixed(2));*/ //descuento

        aux[20] = parseFloat(
          parseFloat(this.pension[this.auxp].idanio_lectivo.pension).toFixed(2)
        ); //ValorParcialsinDescuento
        aux[21] = parseFloat(
          parseFloat(this.pension[this.auxp].val_beca).toFixed(2)
        ); //valorParcialcondescuento
        aux[12] = parseFloat(
          parseFloat(this.pension[this.auxp].idanio_lectivo.pension).toFixed(2)
        );
      } else {
        aux[19] = 0; //descuento
        aux[20] = dtll.valor; //ValorParcialsinDescuento
        aux[21] = dtll.valor; //valorParcialcondescuento
        aux[12] = dtll.valor;
      }
      this.registro.subtotal = this.registro.subtotal + aux[15] * aux[20];
      aux[22] = 0; //0
      aux[23] = 1; //1
      aux[24] = 0; //0
      //console.log(aux);
      for (var j = 0; j < 25; j++) {
        ////console.log("J:",j,"valor",aux[j]);
        if (j == 0) {
          if (this.registro.detalleFactura == undefined) {
            this.registro.detalleFactura = '(' + aux[j];
          } else {
            this.registro.detalleFactura =
              this.registro.detalleFactura + '(' + aux[j];
          }
        } else {
          ////console.log(typeof aux[j]==='string');
          if (typeof aux[j] === 'string' && j != 18) {
            this.registro.detalleFactura =
              this.registro.detalleFactura + ",'" + aux[j] + "'";
          } else {
            if (j == 18) {
              this.registro.detalleFactura =
                this.registro.detalleFactura + ',' + aux[j];
            } else {
              this.registro.detalleFactura =
                this.registro.detalleFactura + ',' + aux[j];
            }
          }
        }
        if (j == 24) {
          //console.log('K',k);
          if (k == detalle_aux.length - 1) {
            this.registro.detalleFactura = this.registro.detalleFactura + ')';
          } else {
            this.registro.detalleFactura = this.registro.detalleFactura + '),';
          }
        }
      }
      //console.log(this.registro.detalleFactura);
      /*
				if(registro.detalleFactura==undefined){
					registro.detalleFactura=JSON.stringify(aux);
				}else{
					registro.detalleFactura=registro.detalleFactura+','+JSON.stringify(aux);
				}
				*/
      ////console.log(aux);
    }
    /*}else{
			console.log("sin link");
		}*/
    //console.log('registro', this.registro);
    console.log(this.registro);
  }

  async armado2() {
    try {
      // Validate required data before processing
      if (!this.pago?.estudiante) {
        throw new Error('Invalid payment or student data');
      }

      // Check if all required billing information is available
      const missingBillingData = [
        this.pago.estudiante.dni,
        this.pago.estudiante.apellidos,
        this.pago.estudiante.nombres,
        this.pago.estudiante.direccion,
        this.pago.estudiante.telefono,
        this.pago.estudiante.email,
        this.pago.estudiante.dni_padre,
        this.pago.estudiante.nombres_padre,
        this.pago.estudiante.dni_factura,
        this.pago.tipo_documento,
      ].some((field) => field === null || field === undefined || field === '');

      if (missingBillingData) {
        // Create a list of missing billing data
        const missingFields = [
          !this.pago.estudiante.dni && 'Cédula del estudiante',
          !this.pago.estudiante.apellidos && 'Apellidos del estudiante',
          !this.pago.estudiante.nombres && 'Nombres del estudiante',
          !this.pago.estudiante.direccion && 'Dirección del estudiante',
          !this.pago.estudiante.telefono && 'Teléfono del estudiante',
          !this.pago.estudiante.email && 'Email del estudiante',
          !this.pago.estudiante.dni_padre && 'Cédula del padre',
          !this.pago.estudiante.nombres_padre && 'Nombres del padre',
          !this.pago.estudiante.dni_factura && 'Cédula de facturación',
          !this.pago.tipo_documento && 'Tipo de documento',
        ].filter(Boolean); // Filter out the null/undefined values

        // Create the message with missing fields
        const missingFieldsMessage = missingFields.length
          ? `Faltan los siguientes datos de facturación: ${missingFields.join(
              ', '
            )}.`
          : 'Faltan datos de facturación del estudiante.';

        // Display the error message with a longer duration
        iziToast.error({
          title: 'ERROR',
          position: 'topRight',
          message: missingFieldsMessage,
          timeout: 10000, // 10 seconds duration
        });

        return; // Exit early if billing data is incomplete
      }

      // Extract student data with optional chaining and default values
      this.registro = {
        cedulaEstudiante: this.pago.estudiante.dni?.toString() ?? '',
        nombreEstudiante: `${this.pago.estudiante.apellidos ?? ''} ${
          this.pago.estudiante.nombres ?? ''
        }`.trim(),
        direccionEstudiante: this.pago.estudiante.direccion?.toString() ?? '',
        telefonoEstudiante:
          this.pago.estudiante.telefono?.toString() ?? '9999999999',
        emailEstudiante: this.pago.estudiante.email?.toString() ?? '',
        cedulaPadre: this.pago.estudiante.dni_padre.toString() ?? '',
        nombrePadre: this.pago.estudiante.nombres_padre.toString() ?? '' ?? '',
        facturarA: this.pago.estudiante.dni_factura.toString() ?? '',
        codigoTipocomprobante: parseInt(this.pago.tipo_documento),
        subtotal: 0, //parseFloat(this.pago.total_pagar.toFixed(2));
        tarifaCero: parseFloat(this.pago.total_pagar.toFixed(2)),
        tarifaDoce: parseFloat('0'),
        valorIva: parseFloat('0'),
        totalFactura: parseFloat(this.pago.total_pagar.toFixed(2)),
        codigoTipopagosri: parseInt('20'),
      };

      // Process details with more robust logic
      this.registro.detalleFactura = this.processDetalles(this.detalles);

      console.log(this.registro);
      this.loademit = true;
    } catch (error) {
      console.error('Error in armado method:', error);
      // Handle error appropriately (e.g., show user notification)
      iziToast.error({
        title: 'ERROR',
        position: 'topRight',
        message:
          error instanceof Error
            ? error.message
            : String(error || 'An unexpected error occurred'),
      });
    }
  }

  private processDetalles(detalles: any[]): string {
    if (!detalles || detalles.length === 0) {
      return '';
    }

    return detalles
      .map((dtll, index) => {
        const aux = this.createDetalleItem(dtll, index + 1);
        return this.formatDetalleItem(aux);
      })
      .join(',');
  }

  private createDetalleItem(dtll: any, itemNumber: number): any[] {
    const aux = new Array(25).fill(0);

    aux[3] = itemNumber;
    aux[5] = 1;
    aux[6] = dtll.tipo === 0 ? 99 : dtll.tipo;
    aux[7] = this.pago.tipo_tarifa;
    aux[9] = 2;

    // Descriptive logic for item description
    aux[10] = this.getItemDescription(dtll);
    aux[11] = dtll.estado ?? '';
    // Pricing and discount logic
    const [discount, totalValue, discountedValue] = this.calculatePricing(dtll);

    aux[12] = totalValue;
    aux[15] = 1; //cantidad
    aux[18] = "''"; //''
    aux[19] = discount;
    aux[20] = totalValue;
    aux[21] = discountedValue;
    aux[23] = 1;
    this.registro.subtotal = this.registro.subtotal + aux[15] * aux[20];
    return aux;
  }

  private getItemDescription(dtll: any): string {
    if (dtll.tipo === 0) return 'Matricula';

    if (dtll.tipo > 0 && dtll.tipo <= 11) {
      const monthDate = this.fecha[dtll.tipo - 1];
      const date = new Date(monthDate.date);
      return `Pensión ${date.toLocaleString('default', {
        month: 'long',
      })} ${date.getFullYear()}`;
    }

    return dtll.descripcion || 'Sin descripción';
  }

  private calculatePricing(dtll: any): [number, number, number] {
    const pension = this.pension[this.auxp];

    if (
      pension.condicion_beca === 'Si' &&
      dtll.tipo > 0 &&
      dtll.tipo <= 10 &&
      dtll.valor === parseFloat(pension.val_beca).toFixed(2) &&
      dtll.abono === 0
    ) {
      const fullValue = parseFloat(pension.idanio_lectivo.pension);
      const discountValue = pension.val_beca;

      return [
        fullValue - discountValue, // discount
        fullValue, // total value
        discountValue, // discounted value
      ];
    }

    return [0, dtll.valor, dtll.valor];
  }

  private formatDetalleItem(aux: any[]): string {
    return (
      aux
        .map((value, index) => {
          // Special handling for different types of values
          if (index === 0) {
            return `(${value}`;
          }

          if (typeof value === 'string' && index !== 18) {
            return `,'${value}'`;
          }

          return `,${value}`;
        })
        .join('') + ')'
    );
  }

  facturar_electronica() {
    try {
      if (this.linkfact != '') {
        ////console.log(this._adminService.ejemplo(1112,this.token));
        ////console.log(this.pago);

        ////console.log(this.detalles);
        //console.log(this.pension[this.auxp]);
        let registro: any = {
          //detalleFactura:[]
        };
        this.registro.cedulaEstudiante = this.pago.estudiante.dni.toString();
        this.registro.nombreEstudiante = (
          this.pago.estudiante.apellidos +
          ' ' +
          this.pago.estudiante.nombres
        ).toString();
        this.registro.direccionEstudiante =
          this.pago.estudiante.direccion.toString();
        if (this.pago.estudiante.telefono) {
          this.registro.telefonoEstudiante =
            (this.pago.estudiante?.telefono).toString();
        } else {
          this.registro.telefonoEstudiante = '9999999999';
        }

        this.registro.emailEstudiante = this.pago.estudiante.email.toString();

        this.registro.cedulaPadre = this.pago.estudiante.dni_padre.toString();
        this.registro.nombrePadre =
          this.pago.estudiante.nombres_padre.toString();
        this.registro.facturarA = this.pago.estudiante.dni_factura.toString();
        this.registro.codigoTipocomprobante = parseInt(
          this.pago.tipo_documento
        );
        this.registro.subtotal = parseFloat(this.pago.total_pagar);
        this.registro.tarifaCero = parseFloat(this.pago.total_pagar);
        this.registro.tarifaDoce = parseFloat('0');
        this.registro.valorIva = parseFloat('0');
        this.registro.totalFactura = parseFloat(this.pago.total_pagar);
        this.registro.codigoTipopagosri = parseInt('20');

        //this.registro.emailPadre=(this.pago.estudiante.email_padre).toString();

        //console.log(this.detalles.length);
        this.registro.detalleFactura = '';
        for (var k = 0; k < this.detalles.length; k++) {
          let dtll = this.detalles[k];
          ////console.log(dtll);
          let aux: any = {};
          aux[0] = 0; //0
          aux[1] = 0; //0
          aux[2] = 0; //0
          aux[3] = k + 1; //numero de Item
          aux[4] = 0; //0
          aux[5] = 1; //1
          if (dtll.tipo == 0) {
            aux[6] = 99; //Codigo de Producto
          } else {
            aux[6] = dtll.tipo; //Codigo de Producto
          }

          aux[7] = this.pago.tipo_tarifa; //Tipo Tarifa
          aux[8] = 0; //0
          aux[9] = this.pago.tipo_producto; //Tipo producto
          //aux[10]='0'; 		//Descripción
          if (dtll.tipo == 0) {
            aux[10] = 'Matricula';
          } else if (dtll.tipo > 0 && dtll.tipo <= 11) {
            for (var i = 0; i < this.fecha.length; i++) {
              if (i + 1 == dtll.tipo) {
                var date = new Date(this.fecha[i].date);
                let month = date.toLocaleString('default', { month: 'long' });
                ////console.log(month+' '+new Date (this.fecha[i].date).getFullYear());
                aux[10] = (
                  'Pensión ' +
                  month +
                  ' ' +
                  new Date(this.fecha[i].date).getFullYear()
                ).toString();
              }
            }
          } else {
            aux[10] = dtll.descripcion;
          }

          aux[11] = dtll.estado; //Observación
          aux[12] = dtll.valor; //Precio Unitario
          aux[13] = 0; //0
          aux[14] = 0; //0
          aux[15] = 1; //cantidad
          aux[16] = 0; //medida1
          aux[17] = 0; //0
          aux[18] = "''"; //''
          if (
            (this.pension[this.auxp].condicion_beca != 'No' &&
              dtll.tipo > 0 &&
              dtll.tipo <= this.pension[this.auxp].meses) ||
            (dtll.tipo == 0 && this.pension[this.auxp].paga_mat == 1)
          ) {
            aux[19] = this.pension[this.auxp].desc_beca; //descuento
            aux[21] = this.pension[this.auxp].val_beca; //valorParcialcondescuento
            aux[20] =
              this.pension[this.auxp].val_beca *
              (100 / this.pension[this.auxp].desc_beca); //ValorParcialsinDescuento
          } else {
            aux[19] = 0; //descuento
            aux[20] = dtll.valor; //ValorParcialsinDescuento
            aux[21] = dtll.valor; //valorParcialcondescuento
          }

          aux[22] = 0; //0
          aux[23] = 1; //1
          aux[24] = 0; //0
          //console.log(aux);
          for (var j = 0; j < 25; j++) {
            ////console.log("J:",j,"valor",aux[j]);
            if (j == 0) {
              if (this.registro.detalleFactura == undefined) {
                this.registro.detalleFactura = '(' + aux[j];
              } else {
                this.registro.detalleFactura =
                  this.registro.detalleFactura + '(' + aux[j];
              }
            } else {
              ////console.log(typeof aux[j]==='string');
              if (typeof aux[j] === 'string' && j != 18) {
                this.registro.detalleFactura =
                  this.registro.detalleFactura + ",'" + aux[j] + "'";
              } else {
                if (j == 18) {
                  this.registro.detalleFactura =
                    this.registro.detalleFactura + ',' + aux[j];
                } else {
                  this.registro.detalleFactura =
                    this.registro.detalleFactura + ',' + aux[j];
                }
              }
            }
            if (j == 24) {
              //console.log('K',k);
              if (k == this.detalles.length - 1) {
                this.registro.detalleFactura =
                  this.registro.detalleFactura + ')';
              } else {
                this.registro.detalleFactura =
                  this.registro.detalleFactura + '),';
              }
            }
          }
          //console.log(this.registro.detalleFactura);
          /*
			if(registro.detalleFactura==undefined){
				registro.detalleFactura=JSON.stringify(aux);
			}else{
				registro.detalleFactura=registro.detalleFactura+','+JSON.stringify(aux);
			}
			*/
          ////console.log(aux);
        }
        //var a=1;
        //this.registro.soapenv='Envelope';
        //this.registro.xmlns="soapenv='http://schemas.xmlsoap.org/soap/envelope/'";

        ////console.log(this.registro);
        let b,
          c = '';
        for (var value in this.registro) {
          if (value != 'detalleFactura') {
            if (b == undefined && c == undefined) {
              if (
                value == 'cedulaEstudiante' ||
                value == 'nombresEstudiante' ||
                value == 'cedulaPadre' ||
                value == 'nombrePadre' ||
                value == 'facturarA'
              ) {
                c = value + '=' + this.registro[value];
              } else {
                c = value + '=' + this.registro[value];
              }

              b = '<' + value + '>' + this.registro[value] + '</' + value + '>';
            } else {
              if (
                value == 'cedulaEstudiante' ||
                value == 'emailEstudiante' ||
                value == 'direccionEstudiante' ||
                value == 'nombresEstudiante' ||
                value == 'cedulaPadre' ||
                value == 'nombrePadre' ||
                value == 'facturarA' ||
                value == 'telefonoEstudiante'
              ) {
                c = c + '&&' + value + '=' + this.registro[value];
              } else {
                c = c + '&&' + value + '=' + this.registro[value];
              }

              b =
                b +
                '<' +
                value +
                '>' +
                this.registro[value] +
                '</' +
                value +
                '>';
            }
          }
        }
        c = c + '&&detalleFactura=' + this.registro.detalleFactura;

        c = 'numeroIdPago=' + this.pago._id + c;
        //c=c+"&&token="+this.token.toString();

        //console.log(c);

        //this.toXML(c);
        //this.loadXML();
      }
    } catch (error) {
      location.reload();
    }
  }
  eliminar_factura() {
    this.armado();
    //console.log('registro', this.registro);

    if (this.error_constru == '' && JSON.stringify(this.registro) != '{}') {
      this.registro.codigoTipocomprobante = 35;
      this._adminService
        .marcar_finalizado_orden(this.pago._id, this.registro, this.token)
        .subscribe((response) => {
          //console.log(response);
          if (response.message) {
            iziToast.info({
              title: 'RESP API:',
              position: 'topRight',
              message: response.message,
            });
            this._adminService
              .eliminar_finalizado_orden(
                this.pago._id,
                this.registro,
                this.token
              )
              .subscribe((response) => {
                iziToast.success({
                  title: 'ÉXITOSO',
                  position: 'topRight',
                  message: 'El pago fue registrado correctamente.',
                });
                location.reload();

                //wind.close();
              });
          } else {
            iziToast.error({
              title: 'DANGER',
              position: 'topRight',
              message: 'Algo Salio mal',
            });
          }
          setTimeout(() => {
            location.reload();
          }, 1000);
        });
    } else {
      iziToast.error({
        title: 'DANGER',
        position: 'topRight',
        message: this.error_constru,
      });
    }
  }
}
