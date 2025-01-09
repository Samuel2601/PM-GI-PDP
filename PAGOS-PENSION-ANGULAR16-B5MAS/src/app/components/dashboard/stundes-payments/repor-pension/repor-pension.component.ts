import {
 Component,
 ElementRef,
 ViewChild,
 ViewContainerRef,
 TemplateRef,
 OnInit,
} from '@angular/core';
import { ConfigService } from 'src/app/service/config.service';
import { AdminService } from 'src/app/service/admin.service';
import { GLOBAL } from 'src/app/service/GLOBAL';
import * as pako from 'pako';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
 selector: 'app-repor-pension',
 templateUrl: './repor-pension.component.html',
 styleUrls: ['./repor-pension.component.scss'],
})
export class ReporPensionComponent implements OnInit {
 @ViewChild('contentTemplate', { static: true })
 contentTemplate!: TemplateRef<any>;
 @ViewChild('container', { read: ViewContainerRef })
 container!: ViewContainerRef;

 public url = GLOBAL.url;
 public horaact: any;
 public pdffecha: any;
 public tipreport: any;
 public cursos: any[] = [];
 public pagospension: any = [];
 public pagos_estudiante: Array<any> = [];
 public director = this._configService.getDirector();
 public delegado = this._configService.getDelegado();
 public admin = this._configService.getAdmin();
 public paralelo: any = [
  { name: 'Todos', seleccionado: true },
  { name: 'A', seleccionado: true },
  { name: 'B', seleccionado: true },
  { name: 'C', seleccionado: true },
  { name: 'D', seleccionado: true },
  { name: 'E', seleccionado: true },
 ];
 public especialidad: any = [
  { name: 'Todos', seleccionado: true },
  { name: 'Inicial', seleccionado: true },
  { name: 'EGB', seleccionado: true },
  { name: 'BGU', seleccionado: true },
 ];
 public cursos2: any = [];
 public estudiantes: Array<any> = [];
 public pensionesestudiantearmado: Array<any> = [];
 public penest: any = [];
 public retirados_arr: any[] = [];
 public info: any;
 public token = localStorage.getItem('token');
 constructor(
  private _adminService: AdminService,
  private _route: ActivatedRoute,
  private _router: Router,
  private el: ElementRef,
  private viewContainerRef: ViewContainerRef,
  private _configService: ConfigService
 ) {}
 private config_sistem = this._configService.getConfig() as {
  imagen: string;
  identity: string;
  token: string;
  rol: string;
 };
 public imagen = this.config_sistem.imagen;
 ngOnInit(): void {
  this._adminService.obtener_info_admin(this.token).subscribe((responese) => {
   if (responese.data) {
    this.info = responese.data;
    //Obtención de director y delegado
    if (
     this._configService.getDirector() == '' ||
     this._configService.getDelegado() == ''
    ) {
     this._adminService
      .listar_admin(this.config_sistem.token)
      .subscribe((response) => {
       let respon = response.data;
       respon.forEach((element: any) => {
        if (element.rol == 'direc') {
         this.director = element.nombres + ' ' + element.apellidos;
        }
        if (element.rol == 'delegado') {
         this.delegado = element.nombres + ' ' + element.apellidos;
        }
       });
      });
    }
    //Año lectivo y tipo de reporte
    this._route.params.subscribe((params) => {
     let id = params['id'];

     // Dividir la frase en palabras
     let palabras = id.split(' ');

     // Asignar la primera palabra a tipreport
     this.tipreport = palabras[0];

     // Asignar el resto de las palabras a pdffecha
     this.pdffecha = palabras.slice(1).join(' ');
     /*if (JSON.stringify(this.pdffecha) != localStorage.getItem('config')) {
      this._router.navigate(['/dashboard']);
     }*/
    });

    if (localStorage.getItem('dia')) {
     this._configService.setProgress(this._configService.getProgress() + 10);
     this.horaact = new Date(JSON.parse(localStorage.getItem('dia') || ''));

     if (this.tipreport == 'Retirados') {
      this.llamarRetirado();
     } else if (this.tipreport == 'Becado') {
      this.llamarBecado();
     } else {
      this.reportPension();
     }
    } else {
     //this._router.navigate(['/dashboard']);
     //this.actualizar_dashest=true;
     //this.armado_matriz(val,costosextrapagos,costopension,costomatricula);
    }
   }
  });
 }
 llamarRetirado() {
  if (
   new Date().getTime() - new Date(this.horaact).getTime() < 3600000 &&
   localStorage.getItem('penest_0') &&
   localStorage.getItem('estudiantes_0')
  ) {
   var j = 0;
   do {
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
    if (
     !localStorage.getItem('penest_' + j) &&
     !localStorage.getItem('estudiantes_' + j)
    ) {
     j = -1;
    } else {
     j++;
    }
   } while (j > 0);
   this.reporteRetirado();
  } else {
  // this._router.navigate(['/dashboard']);
  }
 }
 llamarBecado() {
  if (
   new Date().getTime() - new Date(this.horaact).getTime() < 3600000 &&
   localStorage.getItem('penest_0')
  ) {
   var j = 0;
   do {
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
    this._configService.setProgress(this._configService.getProgress() + 5);
    if (!localStorage.getItem('penest_' + j)) {
     j = -1;
    } else {
     j++;
    }
   } while (j > 0);
   this.reporteBeca();
  } else {
   //this._router.navigate(['/dashboard']);
  }
 }
 reporteRetirado() {
  this.retirados_arr = [];
  this.penest.forEach((element: any) => {
   if (
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
     return -1; // a debe aparecer antes que b
    } else if (a.paralelo > b.paralelo) {
     return 1; // b debe aparecer antes que a
    } else {
     return 0; // a y b son iguales
    }
   }
  });
  //this.imprimir();
 }
 reporteBeca() {
  this.pensionesestudiantearmado = [];
  this.penest.forEach((element: any) => {
   if (element.condicion_beca == 'Si') {
    this.pensionesestudiantearmado.push(element);
   }
  });
  this.pensionesestudiantearmado = this.pensionesestudiantearmado.sort(
   function (a: any, b: any) {
    if (parseInt(a.curso) > parseInt(b.curso)) {
     return 1;
    } else if (parseInt(a.curso) < parseInt(b.curso)) {
     return -1;
    } else {
     if (a.paralelo < b.paralelo) {
      return -1; // a debe aparecer antes que b
     } else if (a.paralelo > b.paralelo) {
      return 1; // b debe aparecer antes que a
     } else {
      return 0; // a y b son iguales
     }
    }
   }
  );
  //this.imprimir();
 }

 reportPension() {
  if (
   new Date().getTime() - new Date(this.horaact).getTime() < 3600000 &&
   localStorage.getItem('pagos_estudiante_0') &&
   localStorage.getItem('cursos_0') &&
   localStorage.getItem('pagospension_0') &&
   localStorage.getItem('cursos2_0')
  ) {
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
    console.log(localStorage.getItem('cursos_' + j));
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
    this._configService.setProgress(this._configService.getProgress() + 5);
    if (
     !localStorage.getItem('pagos_estudiante_' + j) &&
     !localStorage.getItem('cursos_' + j) &&
     !localStorage.getItem('pagospension_' + j) &&
     !localStorage.getItem('cursos2_' + j)
    ) {
     j = -1;
    } else {
     j++;
    }
   } while (j > 0);
   console.log(this.pagos_estudiante);
   // this.cargar_canvas3(costosextrapagos);
  } else {
   //this._router.navigate(['/dashboard']);
   //this.actualizar_dashest=true;
   // this.armado_matriz(val,costosextrapagos,costopension,costomatricula);
  }
 }

 cambiarSeleccionTodo2(val: any) {
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

 cambiarSeleccionTodo(val: any) {
  if (val == 'paralelo') {
   let off = true;
   for (let i = 1; i < this.paralelo.length; i++) {
    if (this.paralelo[i].seleccionado == false) {
     off = false;

     break; // Puedes salir del bucle tan pronto como encuentres un elemento no seleccionado
    }
   }
   this.paralelo[0].seleccionado = off;
   // Establecer el valor de seleccionado del primer elemento en consecuencia
  } else {
   let off = true;
   for (let i = 1; i < this.cursos2.length; i++) {
    if (this.cursos2[i].seleccionado == false) {
     off = false;

     break; // Puedes salir del bucle tan pronto como encuentres un elemento no seleccionado
    }
   }
   this.cursos2[0].seleccionado = off;
   // Establecer el valor de seleccionado del primer elemento en consecuencia
  }
 }

 imprimir() {
  let off = document.getElementById('impresion');
  if (off) {
   off.style.display = '';
  }
  if (
   this.tipreport == 'Pension' ||
   this.tipreport == 'Rubro' ||
   this.tipreport == 'PensionRubro'
  ) {
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
  }

  if (this.tipreport == 'Becado' || this.tipreport == 'Retirados') {
   setTimeout(() => {
    this.llamarimprimir();
   }, 1000);
  } else {
   this.llamarimprimir();
  }
 }
 llamarimprimir() {
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
      ${table}
      </body>
      </html>
    `;
  const popupWin = window.open(
   '',
   'Reporte',
   'top=0,left=0,height=auto,width=auto'
  );

  if (popupWin && table) {
   // Comprueba si la ventana emergente se abrió correctamente
   popupWin.document.open();
   popupWin.document.write(plantillaHTML);
   let divimpri = popupWin.document.getElementById('impresion');
   if (divimpri) {
    divimpri.style.display = '';
   }
   setTimeout(() => {
    // Imprime el contenido en la ventana emergente
    popupWin.print();
    popupWin.document.close();
   }, 1000);
  } else {
   console.error('No se pudo abrir la ventana emergente.');
  }
 }

 generarInforme(
  cursos: any,
  pagospension: any,
  imagen: any,
  pagos_estudiante: any,
  director: any,
  delegado: any,
  admin: any,
  pdffecha: any,
  tipreport: any
 ): string {
  this.cursos = cursos;
  this.pagospension = pagospension;
  this.imagen = imagen;
  this.pagos_estudiante = pagos_estudiante;

  this.director = director;
  this.delegado = delegado;
  this.admin = admin;
  this.pdffecha = pdffecha;
  this.tipreport = tipreport;
  console.log('recibido');

  // Obtén el HTML del informe generado
  const view = this.viewContainerRef.createEmbeddedView(this.contentTemplate);
  const content = this.el.nativeElement.innerHTML;
  this.viewContainerRef.clear();

  return content;
 }

 sumarrecuadado(arr: any, tip: any, indice: any, curso: any, paralelo: any, especialidad?:any|'EGB') {
  var suma = 0;
  var aux = Object.assign(this.pagos_estudiante[curso][paralelo][especialidad]);

  if (indice < this.pagos_estudiante[curso][paralelo][especialidad][0][arr].length) {
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
 isNumber(val: any): boolean {
  return typeof val === 'number';
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
 buscarbeca(id: any, tipo: any) {
  let res = false; // Inicializamos res como false

  // Usamos some() en lugar de forEach para detener la búsqueda una vez que se encuentra una coincidencia
  this.estudiantes.some((element) => {
   if (element.idpension._id == id && element.tipo == tipo) {
    res = true; // Establecemos res en true cuando encontramos una coincidencia
    return true; // Detenemos la búsqueda
   }
   return false; // Continuamos la búsqueda
  });

  return res; // Devolvemos el valor de res
 }
}
