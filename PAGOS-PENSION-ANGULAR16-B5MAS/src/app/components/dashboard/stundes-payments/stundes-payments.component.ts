import { Component, ViewChild, OnInit, AfterViewChecked } from '@angular/core';
import { AdminService } from 'src/app/service/admin.service';
import { ReporPensionComponent } from './repor-pension/repor-pension.component';
import { GLOBAL } from 'src/app/service/GLOBAL';
import { ConfigService } from 'src/app/service/config.service';
import { TableUtil } from '../tableUtil';
import * as XLSX from 'xlsx';
import * as pako from 'pako';
import { saveAs } from 'file-saver';
import * as jspdf from 'jspdf';
import iziToast from 'izitoast';
declare var $: any;

@Component({
 selector: 'app-stundes-payments',
 templateUrl: './stundes-payments.component.html',
 styleUrls: ['./stundes-payments.component.scss'],
})
export class StundesPaymentsComponent implements OnInit, AfterViewChecked {
 @ViewChild('reportComponent') reportComponent!: ReporPensionComponent;

 public config: any = [];
 public contenidoAImprimir!: string;
 public meses = new Array(
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
 );
 public active: any;
 public actualizar_dashest = false;
 public nmt = 0;
 public pdffecha = '';
 public fbeca = '';
 public pagado = 0;
 public porpagar = 0;
 public pagospension: any = [];
 public cursos: any = [];
 public cursos2: any = [];
 public casharray: any = [
  'item',
  'ref1',
  'cedula',
  'modena',
  'valor',
  'ref2',
  'ref3',
  'concepto',
  'ref4',
  'cedula2',
  'alumno',
 ];
 public deteconomico: any = [];
 public pagos_estudiante: Array<any> = [];
 public estudiantes: Array<any> = [];
 public arr_becas: Array<any> = [];
 public penest: any = [];
 public detalles: any = {};
 public pagopension: Array<any> = [];
 public pensionesestudiantearmado: Array<any> = [];
 public auxbecares = 0;
 public total_pagar = 0;
 public paralelo: any = [
  { name: 'Todos', seleccionado: true },
  { name: 'A', seleccionado: false },
  { name: 'B', seleccionado: false },
  { name: 'C', seleccionado: false },
  { name: 'D', seleccionado: false },
  { name: 'E', seleccionado: false },
 ];
 public especialidad: any = [
  { name: 'Todos', seleccionado: true },
  { name: 'Inicial', seleccionado: false },
  { name: 'EGB', seleccionado: false },
  { name: 'UE', seleccionado: false },
 ];
 public page = 1;
 public pageSize = 10;
 public pageSize2 = 10;
 public token = localStorage.getItem('token');
 public tipreport = 'Genero';

 public director = this._configService.getDirector();
 public delegado = this._configService.getDelegado();
 public admin = this._configService.getAdmin();

 constructor(
  private _adminService: AdminService,
  private _configService: ConfigService
 ) {}
 private config_sistem = this._configService.getConfig() as {
  imagen: string;
  identity: string;
  token: string;
  rol: string;
 };
 public imagen = this.config_sistem.imagen;
 public load_data = true;
 public info: any;
 public auxtiprep = 'Genero';
 ngOnInit(): void {
  this.load_data = true;
  this._adminService.obtener_info_admin(this.token).subscribe((responese) => {
   if (responese.data) {
    this.info = responese.data;

    this._configService.setProgress(this._configService.getProgress() + 5);
    try {
     this._adminService
      .obtener_config_admin(this.token)
      .subscribe((responese) => {
       this.config = responese.data.map((item: any) => {
        return {
         anio_lectivo: item.anio_lectivo,
         extrapagos: item.extrapagos,
         matricula: item.matricula,
         mescompleto: item.mescompleto,
         numpension: item.numpension,
         pension: item.pension,
         _id: item._id,
        };
       });

       this.config.forEach((element: any) => {
        element.label =
         this.meses[new Date(element.anio_lectivo).getMonth()] +
         ' ' +
         new Date(element.anio_lectivo).getFullYear() +
         '-' +
         new Date(
          new Date(element.anio_lectivo).setFullYear(
           new Date(element.anio_lectivo).getFullYear() + 1
          )
         ).getFullYear();
       });
       this.active = -1;

       this.detalle_data(0);
      });
    } catch (error) {
     console.log(error);
    }
   }
  });
 }

 cargarContenido(enve: any) {
  $('#loding').modal('show');
  this.tipreport = this.auxtiprep;
  this.ngAfterViewChecked();
 }
 ngAfterViewChecked() {
  setTimeout(() => {
   $('#loding').modal('hide');
  }, 1000);
 }
 actualizar_estudiante() {
  this.load_data = true;
  this._configService.setProgress(5);
  this.actualizar_dashest = true;
  this.active = -1;
  console.log('Actualizar');
  this.detalle_data(0);
 }
 public horaact: any;
 detalle_data(val: any) {
  this.horaact = new Date();
  if (this.active != val) {
   this.active = val;
   this.nmt = 0;
   this.nmt = this.config[val].numpension;
   this.pdffecha = (
    this.meses[new Date(this.config[val].anio_lectivo).getMonth()] +
    ' ' +
    new Date(this.config[val].anio_lectivo).getFullYear() +
    '-' +
    new Date(
     new Date(this.config[val].anio_lectivo).setFullYear(
      new Date(this.config[val].anio_lectivo).getFullYear() + 1
     )
    ).getFullYear()
   ).toString();
   this.fbeca = this.config[val].anio_lectivo;
   this.pagado = 0;
   this.porpagar = 0;
   this.pagospension = [];
   this.cursos = [];
   this.deteconomico = [];
   let costopension = 0;
   let costomatricula = 0;
   let costosextrapagos = 0;
   costopension = this.config[val].pension;
   if (this.config[val].extrapagos) {
    var extrapagos = JSON.parse(this.config[val].extrapagos);
    extrapagos.forEach((element: any) => {
     costosextrapagos += element.valor;
    });
   }

   this.generarMeses();
   costomatricula = this.config[val].matricula;
   if (this.actualizar_dashest == false && this.active == 0) {
    if (
     localStorage.getItem('dia') &&
     JSON.stringify(this.pdffecha) == localStorage.getItem('config')
    ) {
     this._configService.setProgress(this._configService.getProgress() + 10);
     this.horaact = new Date(JSON.parse(localStorage.getItem('dia') || ''));

     if (
      new Date().getTime() - new Date(this.horaact).getTime() < 3600000 &&
      localStorage.getItem('pagos_estudiante_0') &&
      localStorage.getItem('estudiantes_0') &&
      localStorage.getItem('arr_becas_0') &&
      localStorage.getItem('penest_0') &&
      localStorage.getItem('cursos_0') &&
      localStorage.getItem('pagospension_0') &&
      localStorage.getItem('porpagar') &&
      localStorage.getItem('pagado') &&
      localStorage.getItem('cursos2_0') &&
      localStorage.getItem('deteconomico_0')
     ) {
      this.porpagar = JSON.parse(localStorage.getItem('porpagar') || '');
      this.pagado = JSON.parse(localStorage.getItem('pagado') || '');
      var j = 0;
      do {
       if (localStorage.getItem('pagos_estudiante_' + j)) {
        this.pagos_estudiante.push(
         ...JSON.parse(
          pako.inflate(
           new Uint8Array(
            atob(localStorage.getItem('pagos_estudiante_' + j) || '')
             .split('')
             .map((char) => char.charCodeAt(0))
           ),
           { to: 'string' }
          )
         )
        );
       }
       if (localStorage.getItem('estudiantes_' + j)) {
        this.estudiantes.push(
         ...JSON.parse(
          pako.inflate(
           new Uint8Array(
            atob(localStorage.getItem('estudiantes_' + j) || '')
             .split('')
             .map((char) => char.charCodeAt(0))
           ),
           { to: 'string' }
          )
         )
        );
       }
       if (localStorage.getItem('arr_becas_' + j)) {
        this.arr_becas.push(
         ...JSON.parse(
          pako.inflate(
           new Uint8Array(
            atob(localStorage.getItem('arr_becas_' + j) || '')
             .split('')
             .map((char) => char.charCodeAt(0))
           ),
           { to: 'string' }
          )
         )
        );
       }
       if (localStorage.getItem('penest_' + j)) {
        this.penest.push(
         ...JSON.parse(
          pako.inflate(
           new Uint8Array(
            atob(localStorage.getItem('penest_' + j) || '')
             .split('')
             .map((char) => char.charCodeAt(0))
           ),
           { to: 'string' }
          )
         )
        );
       }
       if (localStorage.getItem('cursos_' + j)) {
        this.cursos.push(
         ...JSON.parse(
          pako.inflate(
           new Uint8Array(
            atob(localStorage.getItem('cursos_' + j) || '')
             .split('')
             .map((char) => char.charCodeAt(0))
           ),
           { to: 'string' }
          )
         )
        );
       }
       if (localStorage.getItem('pagospension_' + j)) {
        this.pagospension.push(
         ...JSON.parse(
          pako.inflate(
           new Uint8Array(
            atob(localStorage.getItem('pagospension_' + j) || '')
             .split('')
             .map((char) => char.charCodeAt(0))
           ),
           { to: 'string' }
          )
         )
        );
       }
       if (localStorage.getItem('cursos2_' + j)) {
        this.cursos2.push(
         ...JSON.parse(
          pako.inflate(
           new Uint8Array(
            atob(localStorage.getItem('cursos2_' + j) || '')
             .split('')
             .map((char) => char.charCodeAt(0))
           ),
           { to: 'string' }
          )
         )
        );
       }
       if (localStorage.getItem('deteconomico_' + j)) {
        this.deteconomico.push(
         ...JSON.parse(
          pako.inflate(
           new Uint8Array(
            atob(localStorage.getItem('deteconomico_' + j) || '')
             .split('')
             .map((char) => char.charCodeAt(0))
           ),
           { to: 'string' }
          )
         )
        );
       }
       this._configService.setProgress(this._configService.getProgress() + 5);
       if (
        !localStorage.getItem('pagos_estudiante_' + j) &&
        !localStorage.getItem('estudiantes_' + j) &&
        !localStorage.getItem('arr_becas_' + j) &&
        !localStorage.getItem('penest_' + j) &&
        !localStorage.getItem('cursos_' + j) &&
        !localStorage.getItem('pagospension_' + j) &&
        !localStorage.getItem('cursos2_' + j) &&
        !localStorage.getItem('deteconomico_' + j)
       ) {
        j = -1;
       } else {
        j++;
       }
      } while (j > 0);
      this.cargar_canvas3(costosextrapagos);
     } else {
      this.actualizar_dashest = true;
      this.armado_matriz(val, costosextrapagos, costopension, costomatricula);
     }
    } else {
     this.actualizar_dashest = true;
     this.armado_matriz(val, costosextrapagos, costopension, costomatricula);
    }
   } else {
    this.actualizar_dashest = true;
    this.armado_matriz(val, costosextrapagos, costopension, costomatricula);
   }
  }
 }
 ismeses(numes: any) {
  var aux = new Date(this.config[this.active].anio_lectivo).getMonth();
  aux = aux + numes;

  if (aux == 12) {
   aux = 0;
  } else if (aux > 12) {
   aux = aux - 11;
  }
  return this.meses[aux];
 }
 buscarbeca(id: any, tipo: any) {
  let res = false;

  this.estudiantes.some((element) => {
   if (element.idpension._id == id && element.tipo == tipo) {
    res = true;
    return true;
   }
   return false;
  });

  return res;
 }
 armado_matriz(
  val: any,
  costosextrapagos: any,
  costopension: any,
  costomatricula: any
 ) {
  if (this.actualizar_dashest == true) {
   this._adminService
    .obtener_detallespagos_admin(this.token, this.config[val].anio_lectivo)
    .subscribe((response) => {
     this.estudiantes = response.data.map((item: any) => {
      return {
       abono: item.abono,
       documento: item.documento,
       estado: item.estado,
       estudiante: item.estudiante,
       idpension: {
        anio_lectivo: item.idpension.anio_lectivo,
        condicion_beca: item.idpension.condicion_beca,
        curso: item.idpension.curso,
        extrapagos: item.idpension.extrapagos,
        idanio_lectivo: item.idpension.idanio_lectivo,
        idestudiante: item.idpension.idestudiante,
        matricula: item.idpension.matricula,
        meses: item.idpension.meses,
        paga_mat: item.idpension.paga_mat,
        paralelo: item.idpension.paralelo,
        especialidad: item.idpension.especialidad,
        _id: item.idpension._id,
       },
       pago: {
        estado: item.pago.estado,
        _id: item.pago._id,
       },
       tipo: item.tipo,
       valor: item.valor,
      };
     });
     this._configService.setProgress(this._configService.getProgress() + 5);
     //this.nmt=10;
     this._adminService
      .obtener_becas_conf(this.config[val]._id, this.token)
      .subscribe((response) => {
       this.arr_becas = response.becas.map((item: any) => {
        return {
         etiqueta: item.etiqueta,
         _id: item._id,
         usado: item.usado,
         idpension: {
          _id: item.idpension._id,
         },
        };
       });
       this._configService.setProgress(this._configService.getProgress() + 5);
       this._adminService
        .listar_pensiones_estudiantes_tienda(
         this.token,
         this.config[val].anio_lectivo
        )
        .subscribe((response) => {
         if (response.data) {
          console.log(response.data[0]);
          this.penest = response.data.map((item: any) => {
           //console.log(item);
           return {
            curso: item.curso,
            paralelo: item.paralelo,
            especialidad: item.especialidad,
            anio_lectivo: item.anio_lectivo,
            condicion_beca: item.condicion_beca,
            idestudiante: {
             apellidos: item.idestudiante.apellidos,
             nombres: item.idestudiante.nombres,
             f_desac: item.idestudiante.f_desac,
             estado: item.idestudiante.estado,
             genero: item.idestudiante.genero,
             dni: item.idestudiante.dni,
             _id: item.idestudiante._id,
             anio_desac: item.idestudiante.anio_desac,
             email: item.idestudiante.email,
            },
            _id: item._id,
            val_beca: item.val_beca,
            desc_beca: item.desc_beca,
            paga_mat: item.paga_mat,
            matricula: item.matricula,
            meses: item.meses,
            num_mes_beca: item.num_mes_beca,
            num_mes_res: item.num_mes_res,
           };
          });

          this._configService.setProgress(
           this._configService.getProgress() + 5
          );

          if (this.penest != undefined) {
           this.penest.forEach((element: any) => {
            var con = -1;
            for (var i = 0; i < this.pagospension.length; i++) {
             if (
              this.pagospension[i].curso +
               this.pagospension[i].paralelo +
               this.pagospension[i].especialidad ==
              element.curso + element.paralelo + element.especialidad
             ) {
              con = i;
             }
            }
            if (con == -1) {
             if (!this.cursos.includes(element.curso)) {
              this.cursos.push(element.curso);
             }

             this.pagospension.push({
              curso: element.curso,
              paralelo: element.paralelo,
              especialidad: element.especialidad,
              num: 0,
              data: [0, 0],
              genero: [0, 0, 0],
             });
            }
           });

           this._configService.setProgress(
            this._configService.getProgress() + 5
           );

           this.detalles = this.estudiantes;
           let extrapa: any = [];
           if (this.config[val].extrapagos) {
            extrapa = JSON.parse(this.config[val].extrapagos);
           }
           let lentmeses = extrapa.length + 10;
           this.pagos_estudiante = [];
           this.penest.forEach((elementpent: any) => {
            if (
             elementpent.idestudiante.estado != 'Desactivado' ||
             elementpent.idestudiante.f_desac == undefined
            ) {
             var f = elementpent.anio_lectivo;
             let auxpagos = this.pagospension.find(
              (elementpp: any) =>
               elementpp.curso == elementpent.curso &&
               elementpp.paralelo == elementpent.paralelo &&
               elementpp.especialidad == elementpent.especialidad
             );
             if (auxpagos != undefined) {
              if (elementpent.idestudiante.genero == 'Masculino') {
               auxpagos.genero[0]++;
              } else if (elementpent.idestudiante.genero == 'Femenino') {
               auxpagos.genero[1]++;
              } else {
               auxpagos.genero[2]++;
              }
              auxpagos.num = auxpagos.num + 1;

              this.pagopension = [];
              for (var i = 0; i <= lentmeses; i++) {
               let valor = 0;
               let porpagar = 0;
               let tipo: any;

               if (i == 0) {
                /*
                            if(costosextrapagos>0){
                              porpagar=costosextrapagos;
                              valor = 0;
                              tipo = 'rubro';

                              this.detalles.find((element:any)=>{
                                if(element.tipo>20&&element.idpension._id==elementpent._id){
                                  valor=valor+element.valor
                                  porpagar=porpagar-element.valor
                                }
                              });

                              this.pagopension.push({
                                date: "Rubro",
                                valor: valor,
                                tipo: tipo,
                                porpagar: porpagar,
                              });
                              this.porpagar+=porpagar;
                              this.pagado +=valor;
                              auxpagos.data[1]+=porpagar;
                              auxpagos.data[0]+= valor;
                            }
                            */
                if (
                 elementpent.condicion_beca != 'Si' ||
                 elementpent.paga_mat != 1
                ) {
                 valor = 0;
                 porpagar = this.config[this.active].matricula;
                 tipo = i;
                 this.detalles.find((element: any) => {
                  if (
                   element.tipo == 0 &&
                   element.idpension._id == elementpent._id
                  ) {
                   valor = valor + element.valor;
                   porpagar = porpagar - element.valor;
                  }
                 });
                 this.pagopension.push({
                  date: 'Matricula',
                  valor: this.redondearNumeros(valor, 2),
                  tipo: tipo,
                  porpagar: this.redondearNumeros(porpagar, 2),
                 });
                 this.porpagar += this.redondearNumeros(porpagar, 2);
                 this.pagado += this.redondearNumeros(valor, 2);
                 auxpagos.data[1] += this.redondearNumeros(porpagar, 2);
                 auxpagos.data[0] += this.redondearNumeros(valor, 2);
                } else {
                 porpagar = 0;
                 valor = 0;
                 this.pagopension.push({
                  date: 'Matricula',
                  valor: 0,
                  tipo: 0,
                  porpagar: 0,
                 });
                }
               } else if (i > 0 && i < 11) {
                valor = 0;
                porpagar = 0;
                tipo = i;

                if (elementpent.condicion_beca == 'Si') {
                 if (
                  this.arr_becas.find(
                   (elementbecas) =>
                    elementbecas.idpension._id == elementpent._id &&
                    elementbecas.etiqueta == tipo.toString()
                  ) != undefined
                 ) {
                  porpagar = elementpent.val_beca;
                 } else {
                  porpagar = this.config[this.active].pension;
                 }
                } else {
                 porpagar = this.config[this.active].pension;
                }

                this.detalles.find((element: any) => {
                 if (
                  element.tipo == tipo &&
                  element.idpension._id == elementpent._id
                 ) {
                  valor = valor + element.valor;
                  porpagar = porpagar - element.valor;
                 }
                });
                this.pagopension.push({
                 date: new Date(f).setMonth(new Date(f).getMonth() + i - 1),
                 valor: this.redondearNumeros(valor, 2),
                 tipo: tipo,
                 porpagar: this.redondearNumeros(porpagar, 2),
                });

                this.porpagar += this.redondearNumeros(porpagar, 2);
                this.pagado += this.redondearNumeros(valor, 2);
                auxpagos.data[1] += this.redondearNumeros(porpagar, 2);
                auxpagos.data[0] += this.redondearNumeros(valor, 2);
               } else {
                porpagar = extrapa[i - 11].valor;
                valor = 0;
                tipo = extrapa[i - 11].idrubro;

                this.detalles.find((element: any) => {
                 if (
                  element.tipo == tipo &&
                  element.idpension._id == elementpent._id
                 ) {
                  valor = valor + element.valor;
                  porpagar = porpagar - element.valor;
                 }
                });

                this.pagopension.push({
                 date: extrapa[i - 11].descripcion,
                 valor: this.redondearNumeros(valor, 2),
                 tipo: tipo,
                 porpagar: this.redondearNumeros(porpagar, 2),
                });
                this.porpagar += this.redondearNumeros(porpagar, 2);
                this.pagado += this.redondearNumeros(valor, 2);
                auxpagos.data[1] += this.redondearNumeros(porpagar, 2);
                auxpagos.data[0] += this.redondearNumeros(valor, 2);
               }
              }
              var result = {
               nombres: (
                elementpent.idestudiante.apellidos +
                ' ' +
                elementpent.idestudiante.nombres
               ).toString(),
               curso: elementpent.curso,
               paralelo: elementpent.paralelo,
               especialidad: elementpent.especialidad,
               detalle: this.pagopension.slice(0, 11),
               rubro: this.pagopension.slice(11),
               estado: elementpent.idestudiante.estado,
               dni: elementpent.idestudiante.dni,
               email: elementpent.idestudiante.email,
              };
              // Asegurar la existencia de la estructura jerárquica
              if (!this.pagos_estudiante[elementpent.curso]) {
               this.pagos_estudiante[elementpent.curso] = {};
              }
              if (
               !this.pagos_estudiante[elementpent.curso][elementpent.paralelo]
              ) {
               this.pagos_estudiante[elementpent.curso][elementpent.paralelo] =
                {};
              }
              if (
               !this.pagos_estudiante[elementpent.curso][elementpent.paralelo][
                elementpent.especialidad
               ]
              ) {
               this.pagos_estudiante[elementpent.curso][elementpent.paralelo][
                elementpent.especialidad
               ] = [];
              }

              // Agregar el resultado al arreglo correspondiente
              this.pagos_estudiante[elementpent.curso][elementpent.paralelo][
               elementpent.especialidad
              ].push(result);
              this._configService.setProgress(
               this._configService.getProgress() + 15
              );
             }
            }
           });
           this._configService.setProgress(
            this._configService.getProgress() + 5
           );
           this.cursos = this.cursos.sort(function (a: any, b: any) {
            if (parseInt(a) > parseInt(b)) {
             return 1;
            }
            if (parseInt(a) < parseInt(b)) {
             return -1;
            }
            return 0;
           });
           this.cursos2 = [];
           this.cursos2.push({ name: 'descr', seleccionado: true });
           this.cursos.forEach((element: any) => {
            this.cursos2.push({
             name: element,
             seleccionado: false,
            });
           });
           this._configService.setProgress(
            this._configService.getProgress() + 5
           );
           var datos1: any = [];
           var datos2: any = [];
           var datos3: any = [];
           this.cursos.forEach((element: any) => {
            datos1.push(0);
            datos2.push(0);
            datos3.push(0);
           });
           this.deteconomico.push({
            label: 'N° de Estudiantes',
            data: datos1,
            backgroundColor: 'rgba(0,214,217,0.5)',
            borderColor: 'rgba(0,214,217,1)',
            borderWidth: 2,
           });
           this._configService.setProgress(
            this._configService.getProgress() + 5
           );
           this.deteconomico.push({
            label: 'Valor Recaudado',
            data: datos2,
            backgroundColor: 'rgba(0,217,97,0.5)',
            borderColor: 'rgba(0,217,97,1)',
            borderWidth: 2,
           });
           this.deteconomico.push({
            label: 'Valor por Pagar',
            data: datos3,
            backgroundColor: 'rgba(218,0,16,0.5)',
            borderColor: 'rgba(218,0,16,1)',
            borderWidth: 2,
           });
           this._configService.setProgress(
            this._configService.getProgress() + 10
           );
           this.pagospension.forEach((elementp: any) => {
            for (var i = 0; i < this.cursos.length; i++) {
             if (elementp.curso == this.cursos[i]) {
              this.deteconomico.forEach((elementde: any) => {
               if (elementde.label == 'N° de Estudiantes') {
                elementde.data[i] = elementde.data[i] + elementp.num;
               } else if (elementde.label == 'Valor Recaudado') {
                elementde.data[i] = elementde.data[i] + elementp.data[0];
               } else {
                elementde.data[i] = elementde.data[i] + elementp.data[1];
               }
              });
              i = this.cursos.length;
             }
            }
           });
          }
          let datatotal = [];
          for (var i = 0; i < this.deteconomico[0].data.length; i++) {
           datatotal.push(
            this.deteconomico[1].data[i] + this.deteconomico[2].data[i]
           );
          }
          this.deteconomico.push({
           label: 'Total',
           data: datatotal,
           backgroundColor: 'rgba(0,214,217,0.5)',
           borderColor: 'rgba(0,214,217,1)',
           borderWidth: 2,
          });
          this.cargar_canvas3(costosextrapagos);
         }
        });
      });
    });
  }
 }
 redondearNumeros(numero: number, decimales: number): number {
  const factor = Math.pow(10, decimales);
  let resultadoRedondeado = Math.round(numero * factor) / factor;
  if (Math.abs(resultadoRedondeado) < 1e-15) {
   resultadoRedondeado = 0;
  }
  return resultadoRedondeado;
 }
 cambiarSeleccionTodo(val: any) {
  if (val == 'paralelo') {
   for (let i = 1; i < this.paralelo.length; i++) {
    this.paralelo[i].seleccionado = this.paralelo[0].seleccionado;
   }
  } else {
   for (let i = 1; i < this.cursos2.length; i++) {
    this.cursos2[i].seleccionado = this.cursos2[0].seleccionado;
   }
  }
 }

 imprimir_reporte() {
  this.cursos2.forEach((element: any) => {
   this.paralelo.forEach((element1: any) => {
    if (element.seleccionado == false || element1.seleccionado == false) {
     let off = document.getElementById(
      (element.name + element1.name).toString()
     );
     if (off) {
      off.style.display = 'none';
     }
    }

    if (
     (this.cursos2[0].seleccionado == true || element.seleccionado == true) &&
     (element1.seleccionado == true || this.paralelo[0].seleccionado == true)
    ) {
     let off = document.getElementById(
      (element.name + element1.name).toString()
     );
     if (off) {
      off.style.display = '';
     }
    }
   });
  });

  let tipo = this.tipreport;
  let name = '';
  let fecha = this.pdffecha;

  let table = document.getElementById('impresion')?.innerHTML;
  const plantillaHTML =
   `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
          <title>` +
   tipo +
   ` ` +
   name +
   `(` +
   fecha +
   `)</title>
          <base href="/">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link rel="icon" type="image/x-icon" href="favicon.ico">

          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

          <style>
          /* Estilos CSS para el informe */
          body {
              font-family: Arial, sans-serif;
          }

          .informe {
              width: 80% !import;
              margin: 0 auto;
              padding: 20px;
          }
          .table-1{
                page-break-inside: avoid;
            }

          .encabezado {
              text-align: center;
          }

          .titulo {
              font-size: 24px;
              font-weight: bold;
          }

          .subtitulo {
              font-size: 18px;
          }

          .contenido {
              margin-top: 20px;
          }

          .seccion {
            margin-bottom: 20px;
            padding: 10px;
        }
          .pie-pagina {
              text-align: center;
              margin-top: 20px;
              font-style: italic;
          }

        }

      </style>

        </head>
    <body>
    <div class="card informe">

    ${table}
    </div>


    </body>
    </html>
  `;
  const popupWin = window.open(
   '',
   '_blank',
   'top=0,left=0,height=auto,width=auto'
  );

  if (popupWin && table) {
   popupWin.document.open();
   popupWin.document.write(plantillaHTML);
   let divimpri = popupWin.document.getElementById('impresion');
   if (divimpri) {
    divimpri.style.display = '';
   }
   setTimeout(() => {
    popupWin.print();
    popupWin.document.close();
   }, 1000);
  } else {
   console.error('No se pudo abrir la ventana emergente.');
  }
 }
 cargar_canvas3(costosextrapagos: any) {
  this.director = this._configService.getDirector();
  this.delegado = this._configService.getDelegado();
  this.admin = this._configService.getAdmin();

  if (this.actualizar_dashest == true) {
   this.pagospension = this.pagospension.sort(function (a: any, b: any) {
    if (parseInt(a.curso) > parseInt(b.curso)) {
     return 1;
    } else if (parseInt(a.curso) < parseInt(b.curso)) {
     return -1;
    } else {
     if (a.paralelo < b.paralelo) {
      return -1;
     } else if (a.paralelo > b.paralelo) {
      return 1;
     } else {
      return 0;
     }
    }
   });
  }

  this._configService.setProgress(this._configService.getProgress() + 20);
  this.armado(10, this.active, costosextrapagos);
 }
 isNumber(val: any): boolean {
  return typeof val === 'number';
 }
 armado(tiempo: any, idxconfi: any, costosextrapagos: any) {
  this.detalles = this.estudiantes;
  this.auxbecares = 0;
  this.total_pagar = 0;
  this._configService.setProgress(this._configService.getProgress() + 10);

  console.log(this.pagos_estudiante);

  // Iterar sobre niveles jerárquicos: curso -> paralelo -> especialidad
  Object.keys(this.pagos_estudiante).forEach((cursoKey: any) => {
   const curso = this.pagos_estudiante[cursoKey];
   if (curso) {
    Object.keys(curso).forEach((paraleloKey: any) => {
     const paralelo = curso[paraleloKey];
     Object.keys(paralelo).forEach((especialidadKey: any) => {
      const especialidad = paralelo[especialidadKey];

      // Ordenar el array de estudiantes dentro de cada especialidad
      paralelo[especialidadKey] = especialidad.sort((a: any, b: any) =>
       a.nombres.localeCompare(b.nombres, 'es', { sensitivity: 'base' })
      );
     });
    });
   }
  });

  this._configService.setProgress(this._configService.getProgress() + 20);

  setTimeout(() => {
   this._configService.setProgress(0);
   this._configService.setLabels(this.cursos);
   this._configService.setData([
    this.deteconomico[3],
    this.deteconomico[1],
    this.deteconomico[2],
   ]);
  }, 1000);

  this.load_data = false;
  this._configService.setProgress(100);

  if (this.actualizar_dashest) {
   this.guardardashboard_estudiante();
  }
 }

 public arr_meses: any = [];
 generarMeses() {
  this.arr_meses = [];
  const anioActual = new Date(this.config[this.active].anio_lectivo).getMonth();
  for (let i = 0; i < 10; i++) {
   const mes = new Date(new Date().setMonth(anioActual + i)).getMonth();
   this.arr_meses.push({ numero: i + 1, nombre: this.meses[mes] });
  }
  this._configService.setProgress(this._configService.getProgress() + 5);
 }
 public retirados_arr: any[] = [];
 ordenarPor(columna: string): void {
  if (columna == 'curso') {
   this.retirados_arr.sort((a: any, b: any) => {
    if (parseInt(a[columna]) < parseInt(b[columna])) {
     return -1;
    } else if (parseInt(a[columna]) > parseInt(b[columna])) {
     return 1;
    } else {
     if (a.paralelo < b.paralelo) {
      return -1;
     } else if (a.paralelo > b.paralelo) {
      return 1;
     } else {
      return 0;
     }
    }
   });
  } else if (columna == 'f_desac') {
   this.retirados_arr.sort((a: any, b: any) => {
    if (
     a.idestudiante[columna] != undefined &&
     b.idestudiante[columna] != undefined &&
     new Date(a.idestudiante[columna]).getTime() >
      new Date(b.idestudiante[columna]).getTime()
    ) {
     return 1;
    } else if (
     a.idestudiante[columna] != undefined &&
     b.idestudiante[columna] != undefined &&
     new Date(a.idestudiante[columna]).getTime() <
      new Date(b.idestudiante[columna]).getTime()
    ) {
     return -1;
    } else {
     return 0;
    }
   });
  } else {
   this.retirados_arr.sort((a: any, b: any) => {
    if (
     a.idestudiante[columna] != undefined &&
     b.idestudiante[columna] != undefined &&
     a.idestudiante[columna] > b.idestudiante[columna]
    ) {
     return 1;
    } else if (
     a.idestudiante[columna] != undefined &&
     b.idestudiante[columna] != undefined &&
     a.idestudiante[columna] < b.idestudiante[columna]
    ) {
     return -1;
    } else {
     return 0;
    }
   });
  }
 }
 retirados() {
  this.retirados_arr = [];
  this.penest.forEach((element: any) => {
   if (
    new Date(element.anio_lectivo).getTime() ==
     new Date(this.fbeca).getTime() &&
    element.idestudiante.estado == 'Desactivado' &&
    new Date(element.anio_lectivo).getTime() ==
     new Date(element.idestudiante.anio_desac).getTime()
   ) {
    this.retirados_arr.push(element);
   }
  });
  this.estudiantes.forEach((element: any) => {
   this.retirados_arr.find((element2: any) => {
    if (element2._id === element.idpension._id) {
     let existePago = false;
     if (!element2.pagos) {
      element2.pagos = [];
     } else {
      existePago = element2.pagos.find(
       (pago: any) =>
        pago.valor === element.valor &&
        pago.tipo === element.tipo &&
        pago._id === element.pago._id
      );
     }
     if (!existePago) {
      element2.pagos.push({
       valor: element.valor,
       tipo: element.tipo,
       _id: element.pago._id,
      });
     }
    }
   });
  });
  this.retirados_arr = this.retirados_arr.sort(function (a: any, b: any) {
   if (parseInt(a.curso) > parseInt(b.curso)) {
    return 1;
   } else if (parseInt(a.curso) < parseInt(b.curso)) {
    return -1;
   } else {
    if (a.paralelo < b.paralelo) {
     return -1;
    } else if (a.paralelo > b.paralelo) {
     return 1;
    } else {
     return 0;
    }
   }
  });
  this._configService.setProgress(this._configService.getProgress() + 5);

  this.load_data = false;
  this._configService.setProgress(100);
  setTimeout(() => {
   this._configService.setProgress(0);
   this._configService.setLabels(this.cursos);
   this._configService.setData([
    this.deteconomico[3],
    this.deteconomico[1],
    this.deteconomico[2],
   ]);
  }, 1500);
 }
 colors = ['#ea4335', '#fbbc05', '#34a853', '#4285f4'];
 currentColorIndex = 0;
 dsgoogle = 0;
 contamiento = 0;
 emails: any = [];
 desGooglePlus() {
  const json: any = [];
  //console.log(j,this.pagos_estudiante,);
  this.emails = [];
  this.pagos_estudiante.forEach((element: any) => {
   for (const key in element) {
    if (Object.prototype.hasOwnProperty.call(element, key)) {
     const element3 = element[key];
     element3.forEach((element2: any) => {
      var auxsuma = this.sumardsgoogle(element2.detalle);
      if (auxsuma > this.contamiento && element2.estado != 'Desactivado') {
       let combinedData: any = {
        nombres: element2.nombres,
        curso: element2.curso,
        paralelo: element2.paralelo,
        estado: element2.estado,
        dni: element2.dni,
        email: element2.email,
       };
       // Desglosar los elementos de detalle y rubro en nuevos objetos
       element2.detalle.forEach((detalleItem: any, index: number) => {
        let fecha = '';
        if (this.isDate(detalleItem.date)) {
         fecha = this.meses[new Date(detalleItem.date).getMonth()];
        } else {
         fecha = detalleItem.date;
        }
        //combinedData['date' + index] = fecha;
        combinedData['valor - ' + fecha] = detalleItem.valor;
        //combinedData['tipo' + index] = detalleItem.tipo;
        combinedData['porpagar - ' + fecha] = detalleItem.porpagar;
        // Puedes agregar más propiedades según sea necesario
       });

       element2.rubro.forEach((rubroItem: any, index: number) => {
        const rubroIndex = index + element2.detalle.length;
        //combinedData['date' + rubroIndex] = rubroItem.date;
        combinedData['valor - ' + rubroItem.date] = rubroItem.valor;
        //combinedData['tipo' + rubroIndex] = rubroItem.tipo;
        combinedData['porpagar - ' + rubroItem.date] = rubroItem.porpagar;
        // Puedes agregar más propiedades según sea necesario
       });

       // Agregar los objetos desglosados al array de exportación
       this.emails.push(combinedData);
      }
     });
    }
   }
  });
  //console.log(this.emails);
  const worksheet = XLSX.utils.json_to_sheet(this.emails);
  const workbook = {
   Sheets: { Estudiantes: worksheet },
   SheetNames: ['Estudiantes'],
  };
  const excelBuffer = XLSX.write(workbook, {
   bookType: 'xlsx',
   type: 'array',
  });
  const blob = new Blob([excelBuffer], {
   type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const fileName =
   'Estudiantes' +
   this.meses[new Date().getMonth()] +
   '_' +
   this.pdffecha +
   '(' +
   this.mcash +
   ').xlsx';
  saveAs(blob, fileName);
  $('#modalDesGoogle').modal('hide');
  $('#modalDesGoogleConfir').modal('show');
 }
 desGooglePlusConfir() {
  let auxemail: any = [];
  this.emails.forEach((element: any) => {
   auxemail.push(element.email);
  });
  /*auxemail.forEach((element:any) => {
      this._adminService.consultarEstadoGoogle(this.token,element).subscribe(response=>{
        if(response.users){
          console.log(element,response.users.suspended);
        }
      });
    });*/
  this._adminService
   .cambiarEstadoGoogle(this.token, { array: [auxemail], estado: false })
   .subscribe((response) => {
    if (response.users) {
     iziToast.success({
      title: 'Suspendido:',
      position: 'topRight',
      message: '(' + response.users.length + ') Email',
     });
    }
   });
 }
 sumardsgoogle(valores: any) {
  var suma = 0;
  for (var i = 0; i <= this.dsgoogle; i++) {
   suma = valores[i].porpagar + suma;
  }
  return suma;
 }
 isDate(value: any): boolean {
  if (value instanceof Date && !isNaN(value.getTime())) {
   return true;
  }

  // Si el valor es un número, intentar crear una instancia de Date
  if (typeof value === 'number') {
   const dateObject = new Date(value);
   return !isNaN(dateObject.getTime());
  }

  return false;
 }

 exportarcash(paralelo: any) {
  const json: any = [];
  var j = 1;
  //console.log(j,this.pagos_estudiante,);

  this.pagos_estudiante.forEach((element: any) => {
   for (const key in element) {
    if (Object.prototype.hasOwnProperty.call(element, key)) {
     const element3 = element[key];
     element3.forEach((element2: any) => {
      let con = this.sumarcash(element2.detalle);
      if (con > 0 && element2.estado != 'Desactivado') {
       con = parseFloat(con.toFixed(2)) * 100;
       const studen: any = {
        Item: j,
        Ref: 'CO',
        Cedula: element2.dni,
        Modena: 'USD',
        Valor: con,
        Ref1: 'REC',
        Ref2: '',
        Ref3: '',
        Concepto:
         'PENSION DE ' +
         this.meses[
          new Date(
           new Date(this.fbeca).setMonth(
            new Date(this.fbeca).getMonth() + this.mcash - 1
           )
          ).getMonth()
         ].toUpperCase(),
        Ref4: 'C',
        Cedula2: element2.dni,
        Alumno: element2.nombres,
       };
       if (paralelo) {
        studen.curso = element2.curso;
        studen.paralelo = element2.paralelo;
       }
       json.push(studen);
       j++;
      }
     });
    }
   }
  });

  const worksheet = XLSX.utils.json_to_sheet(json);
  const workbook = { Sheets: { cash: worksheet }, SheetNames: ['cash'] };
  const excelBuffer = XLSX.write(workbook, {
   bookType: 'xlsx',
   type: 'array',
  });
  const blob = new Blob([excelBuffer], {
   type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const fileName =
   'cash_' +
   this.meses[new Date().getMonth()] +
   '_' +
   this.pdffecha +
   '(' +
   this.mcash +
   ').xlsx';
  saveAs(blob, fileName);
  $('#modalGenerarCash').modal('hide');
 }

 public auxdasboarestudiante: any = {};
 guardardashboard_estudiante() {
  var j = 0;
  do {
   if (localStorage.getItem('pagos_estudiante_' + j)) {
    localStorage.removeItem('pagos_estudiante_' + j);
   }
   if (localStorage.getItem('estudiantes_' + j)) {
    localStorage.removeItem('estudiantes_' + j);
   }
   if (localStorage.getItem('arr_becas_' + j)) {
    localStorage.removeItem('arr_becas_' + j);
   }
   if (localStorage.getItem('penest_' + j)) {
    localStorage.removeItem('penest_' + j);
   }
   if (localStorage.getItem('cursos_' + j)) {
    localStorage.removeItem('cursos_' + j);
   }
   if (localStorage.getItem('pagospension_' + j)) {
    localStorage.removeItem('pagospension_' + j);
   }
   if (localStorage.getItem('cursos2_' + j)) {
    localStorage.removeItem('cursos2_' + j);
   }
   if (localStorage.getItem('deteconomico_' + j)) {
    localStorage.removeItem('deteconomico_' + j);
   }
   if (localStorage.getItem('config')) {
    localStorage.removeItem('config');
   }
   this._configService.setProgress(this._configService.getProgress() + 5);
   if (
    !localStorage.getItem('pagos_estudiante_' + j) &&
    !localStorage.getItem('estudiantes_' + j) &&
    !localStorage.getItem('arr_becas_' + j) &&
    !localStorage.getItem('penest_' + j) &&
    !localStorage.getItem('cursos_' + j) &&
    !localStorage.getItem('pagospension_' + j) &&
    !localStorage.getItem('cursos2_' + j) &&
    !localStorage.getItem('deteconomico_' + j)
   ) {
    j = -1;
   } else {
    j++;
   }
  } while (j > 0);

  this._configService.setProgress(10);

  this.auxdasboarestudiante.dia = new Date();
  this.auxdasboarestudiante.config = this.pdffecha;
  this.auxdasboarestudiante.pagos_estudiante = this.pagos_estudiante;

  this.auxdasboarestudiante.estudiantes = this.estudiantes;
  this.auxdasboarestudiante.arr_becas = this.arr_becas;
  this.auxdasboarestudiante.penest = this.penest;
  this.auxdasboarestudiante.cursos = this.cursos;
  this.auxdasboarestudiante.pagospension = this.pagospension;
  this.auxdasboarestudiante.porpagar = this.porpagar;
  this.auxdasboarestudiante.pagado = this.pagado;
  this.auxdasboarestudiante.cursos2 = this.cursos2;
  this.auxdasboarestudiante.paralelo = this.paralelo;
  this.auxdasboarestudiante.deteconomico = this.deteconomico;

  let fileContent = JSON.stringify(this.auxdasboarestudiante);

  this._configService.setProgress(this._configService.getProgress() + 10);

  for (const key in this.auxdasboarestudiante) {
   if (Object.prototype.hasOwnProperty.call(this.auxdasboarestudiante, key)) {
    const element = this.auxdasboarestudiante[key];
    if (Array.isArray(element)) {
     const chunkSize = 1500;
     var j = 0;
     for (let i = 0; i < element.length; i += chunkSize) {
      const chunk = element.slice(i, i + chunkSize);
      localStorage.setItem(
       key + '_' + j,
       btoa(
        String.fromCharCode.apply(
         null,
         Array.from(pako.deflate(JSON.stringify(chunk)))
        )
       )
      );
      this._configService.setProgress(this._configService.getProgress() + 5);
      j++;
     }
    } else {
     localStorage.setItem(key, JSON.stringify(element));
     this._configService.setProgress(this._configService.getProgress() + 5);
    }
   }
  }
  this._configService.setProgress(100);
  setTimeout(() => {
   this._configService.setProgress(0);
  }, 1500);
 }
 public url = GLOBAL.url;
 public mostar = 1;
 exportTabletotal(val: any) {
  let admtitulo = '';

  if (this.config_sistem.rol == 'admin') {
   admtitulo = 'Administrador(a)';
  } else if (this.config_sistem.rol == 'direc') {
   admtitulo = 'Director(a)';
  } else if (this.config_sistem.rol == 'delegado') {
   admtitulo = 'Delegado';
  } else {
   admtitulo = 'Colectora(a)';
  }
  this.mostar = 0;
  setTimeout(() => {
   this.cursos.forEach((element: any) => {
    var btn1 = document.getElementById('btncursos' + element);
    if (btn1) {
     btn1.style.display = 'none';
    }
    var btn2 = document.getElementById(element);
    if (btn2) {
     btn2.style.borderCollapse = 'collapse';
     btn2.style.width = '100%';
     btn2.style.textAlign = 'center';
    }
   });

   var btn1 = document.getElementById('btncvs');
   var btn2 = document.getElementById('btnxlsx');
   var btn3 = document.getElementById('btnpdf');
   var btn4 = document.getElementById('btncash');
   var btn5 = document.getElementById('modalGenerarCash');
   var btn6 = document.getElementById('detalleeconomico');
   if (btn1) {
    btn1.style.display = 'none';
   }
   if (btn2) {
    btn2.style.display = 'none';
   }
   if (btn3) {
    btn3.style.display = 'none';
   }
   if (btn4) {
    btn4.style.display = 'none';
   }
   if (btn5) {
    btn5.style.display = 'none';
   }
   if (btn6) {
    btn6.style.borderCollapse = 'collapse';
    btn6.style.width = '100%';
   }

   TableUtil.exportToPdftotal(
    val.toString(),
    this.pdffecha.toString(),
    this.director,
    this.delegado,
    this.admin,
    new Intl.DateTimeFormat('es-US', { month: 'long' }).format(new Date()),
    (this.url + 'obtener_portada/' + this.config_sistem.imagen).toString(),
    admtitulo,
    this.info
   );
  }, 100);
  setTimeout(() => {
   this.mostar = 1;
   this.cursos.forEach((element: any) => {
    var btn1 = document.getElementById('btncursos' + element);
    if (btn1) {
     btn1.style.display = '';
    }
    var btn2 = document.getElementById(element);
    if (btn2) {
     btn2.style.borderCollapse = '';
     btn2.style.tableLayout = '';
     btn2.style.marginLeft = '';
    }
   });
   var btn1 = document.getElementById('btncvs');
   var btn2 = document.getElementById('btnxlsx');
   var btn3 = document.getElementById('btnpdf');
   var btn4 = document.getElementById('btncash');
   var btn5 = document.getElementById('modalGenerarCash');
   var btn6 = document.getElementById('detalleeconomico');
   if (btn1) {
    btn1.style.display = '';
   }
   if (btn2) {
    btn2.style.display = '';
   }
   if (btn3) {
    btn3.style.display = '';
   }
   if (btn4) {
    btn4.style.display = '';
   }
   if (btn5) {
    btn5.style.display = '';
   }
   if (btn6) {
    btn6.style.borderCollapse = '';
    btn6.style.tableLayout = '';
   }
  }, 100);
 }
 exportTable(val: any, genero?: any) {
  let admtitulo = '';

  if (this.config_sistem.rol == 'admin') {
   admtitulo = 'Administrador(a)';
  } else if (this.config_sistem.rol == 'direc') {
   admtitulo = 'Director(a)';
  } else if (this.config_sistem.rol == 'delegado') {
   admtitulo = 'Delegado';
  } else {
   admtitulo = 'Colectora(a)';
  }

  if (val == 'detalleeconomico') {
   let genero = { 0: 0, 1: 0, 2: 0 };
   this.pagospension.forEach((element: any) => {
    genero[0] = genero[0] + element.genero[0];
    genero[1] = genero[1] + element.genero[1];
    genero[2] = genero[2] + element.genero[2];
   });
   this.mostar = 0;
   this.pagospension.forEach((element: any) => {
    $('#' + element.label).hide();
    var btn = document.getElementById(element.label);
    if (btn) {
     btn.style.display = 'none';
    }
   });

   TableUtil.exportToPdf(
    val.toString(),
    this.pdffecha.toString(),
    'Detalle Economico de pensiones',
    this.director,
    this.delegado,
    this.admin,
    new Intl.DateTimeFormat('es-US', { month: 'long' }).format(new Date()),
    (this.url + 'obtener_portada/' + this.config_sistem.imagen).toString(),
    admtitulo,
    genero,
    this.info
   );
   this.pagospension.forEach((element: any) => {
    $('#' + element.curso + element.paralelo).show();
    var btn = document.getElementById(element.curso + element.paralelo);
    if (btn) {
     btn.style.display = 'block';
    }
   });
  } else {
   if (val == 'becados') {
    let genero = { 0: 0, 1: 0, 2: 0 };
    this.penest.forEach((element: any) => {
     if (element.condicion_beca == 'Si') {
      if (element.idestudiante.genero == 'Masculino') {
       genero[0]++;
      } else if (element.idestudiante.genero == 'Femenino') {
       genero[1]++;
      } else {
       genero[2]++;
      }
     }
    });
    TableUtil.exportToPdf(
     val.toString(),
     this.pdffecha.toString(),
     'Becados: ' + this.pdffecha,
     this.director,
     this.delegado,
     this.admin,
     new Intl.DateTimeFormat('es-US', { month: 'long' }).format(new Date()),
     (this.url + 'obtener_portada/' + this.config_sistem.imagen).toString(),
     admtitulo,
     genero,
     this.info
    );
   } else if (val == 'eliminados') {
    let genero = { 0: 0, 1: 0, 2: 0 };
    this.retirados_arr.forEach((element: any) => {
     if (element.idestudiante.genero == 'Masculino') {
      genero[0]++;
     } else if (element.idestudiante.genero == 'Femenino') {
      genero[1]++;
     } else {
      genero[2]++;
     }
    });
    TableUtil.exportToPdf(
     val.toString(),
     this.pdffecha.toString(),
     'Estudiantes Retirados: ' + this.pdffecha,
     this.director,
     this.delegado,
     this.admin,
     new Intl.DateTimeFormat('es-US', { month: 'long' }).format(new Date()),
     (this.url + 'obtener_portada/' + this.config_sistem.imagen).toString(),
     admtitulo,
     genero,
     this.info
    );
   } else {
    if (
     val.includes('A') ||
     val.includes('B') ||
     val.includes('C') ||
     val.includes('D') ||
     val.includes('E') ||
     val.includes('F')
    ) {
     $('#btncursos' + val).hide();
     TableUtil.exportToPdf(
      val.toString(),
      this.pdffecha.toString(),
      'Curso: ' + val,
      this.director,
      this.delegado,
      this.admin,
      new Intl.DateTimeFormat('es-US', { month: 'long' }).format(new Date()),
      (this.url + 'obtener_portada/' + this.config_sistem.imagen).toString(),
      admtitulo,
      genero,
      this.info
     );
     $('#btncursos' + val).show();
    } else {
     this.mostar = 0;
     $('#btncursos' + val).hide();
     genero = { 0: 0, 1: 0, 2: 0 };
     this.pagospension.forEach((element: any) => {
      if (
       element.curso + element.paralelo == val + 'A' ||
       element.curso + element.paralelo == val + 'B' ||
       element.curso + element.paralelo == val + 'C' ||
       element.curso + element.paralelo == val + 'D' ||
       element.curso + element.paralelo == val + 'E' ||
       element.curso + element.paralelo == val + 'F'
      ) {
       genero[0] = genero[0] + element.genero[0];
       genero[1] = genero[1] + element.genero[1];
       genero[2] = genero[2] + element.genero[2];
      }
     });
     setTimeout(() => {
      TableUtil.exportToPdf(
       val.toString(),
       this.pdffecha.toString(),
       'Curso: ' + val,
       this.director,
       this.delegado,
       this.admin,
       new Intl.DateTimeFormat('es-US', { month: 'long' }).format(new Date()),
       (this.url + 'obtener_portada/' + this.config_sistem.imagen).toString(),
       admtitulo,
       genero,
       this.info
      );
     }, 100);

     setTimeout(() => {
      $('#btncursos' + val).show();
      this.mostar = 1;
     }, 100);
    }
   }
  }
 }
 getCount(name: any, name2?: any, name3?: any) {
  try {
   var aux = Object.assign(this.pagos_estudiante[name][name2][name3]);

   return aux.filter((o: any) => o.detalle[0].porpagar == 0).length;
  } catch (error) {}
 }
 getCountno(name: any, name2?: any, name3?: any) {
  try {
   var aux = Object.assign(this.pagos_estudiante[name][name2][name3]);
   return aux.filter((o: any) => o.detalle[0].porpagar != 0).length;
  } catch (error) {}
 }
 getCountTotal(name: any) {
  var suma = 0;

  for (const key in this.pagos_estudiante[name]) {
   for (const key2 in this.pagos_estudiante[name][key]) {
    if (
     Object.prototype.hasOwnProperty.call(
      this.pagos_estudiante[name][key],
      key2
     )
    ) {
     const element = this.pagos_estudiante[name][key][key2];
     suma =
      suma + element.filter((o: any) => o.detalle[0].porpagar == 0).length;
    }
   }
  }
  return suma;
 }

 getCountnoTotal(name: any) {
  var suma = 0;

  for (const key in this.pagos_estudiante[name]) {
   for (const key2 in this.pagos_estudiante[name][key]) {
    if (
     Object.prototype.hasOwnProperty.call(
      this.pagos_estudiante[name][key],
      key2
     )
    ) {
     const element = this.pagos_estudiante[name][key][key2];
     suma =
      suma + element.filter((o: any) => o.detalle[0].porpagar != 0).length;
    }
   }
  }

  return suma;
 }
 sumarvalores(valores: any, tip: any) {
  var suma = 0;
  valores.forEach((element: any) => {
   if (this.isNumber(element[tip])) {
    suma = element[tip] + suma;
   }
  });
  return suma;
 }
 sumarvaloresdetalle(valores: any) {
  var suma = 0;
  valores.forEach((element: any) => {
   if (this.isNumber(element)) {
    suma = element + suma;
   }
  });
  return suma;
 }
 public mcash = 0;
 sumarcash(valores: any) {
  var suma = 0;
  for (var i = 0; i <= this.mcash; i++) {
   suma = valores[i].porpagar + suma;
  }
  return suma;
 }
 onCash(paralelo: boolean): void {
  this.mcash = Number(this.mcash);
  this.exportarcash(paralelo);
 }
 sumarrecuadado(arr: any, tip: any, indice: any, curso: any, paralelo: any) {
  var suma = 0;
  var aux = Object.assign(this.pagos_estudiante[curso][paralelo]);

  if (indice < this.pagos_estudiante[curso][paralelo][0][arr].length) {
   aux.forEach((element: any) => {
    if (element[arr][indice] && element[arr][indice][tip] >= 0) {
     suma = element[arr][indice][tip] + suma;
    }
   });
  } else {
   aux.forEach((element: any) => {
    element[arr].forEach((elementdt: any, indice: any) => {
     if (tip == 'porpagar') {
      suma = elementdt[tip] + suma;
     } else {
      suma = elementdt[tip] + suma;
     }
    });
   });
  }

  return suma;
 }
}
