import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/service/admin.service';
import { ConfigService } from 'src/app/service/config.service';
import { Router } from '@angular/router';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
//import {CompleteParams, FlatfileMethods   } from "@flatfile/angular";
//import{Flatfile} from "@flatfile/sdk";
import * as Papa from 'papaparse';
import { LinkHeaderComponent } from '../../helpers/link-header/link-header.component';
declare var $: any;
import iziToast from 'izitoast';
export interface Estudiante {
  id: number;
  apellidos: string;
  curso: string;
  direccion: string;
  dni: string;
  dni_factura: string;
  dni_padre: string;
  email: string;
  email_padre: string;
  estado: string;
  genero: string;
  nombres: string;
  nombres_factura: string;
  nombres_padre: string;
  paralelo: string;
  telefono: string;
}
@Component({
  selector: 'app-index-students',
  templateUrl: './index-students.component.html',
  styleUrls: ['./index-students.component.scss'],
})
export class IndexStudentsComponent implements OnInit {
  public estudiantes: Array<any> = [];
  public estudiantes_const: Array<any> = [];
  public token = localStorage.getItem('token');
  public rol: any;
  public page = 1;
  public pageSize = 100;
  public filtro = '';
  public load_eliminados = false;
  public load_data_est = true;
  private config_const: any = {};
  private carga: Array<any> = [];
  public subidos = 0;
  public resubido = 0;
  public errorneos = 0;
  public mp = '';
  public total = 0;
  public resubidos = 0;
  public resubidosc = 0;
  public subidoss = 0;
  public errorneoss = 0;
  public errorv = 0;
  public vc = 0;
  constructor(
    private _adminService: AdminService,
    private progressBarService: ConfigService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  public encabezados: any = {};
  public valid: any = [];
  public proveedor: any = {};
  public proveedor_arr: Estudiante[] = [];
  public proveedores: Array<any> = [];
  public proveedores_erro: any = [];
  public selectedPageSize = 8;
  public collectionSize = 0;
  //ID clave de acceso:FF00XR3WS37WD8LQBF6UQ2MIXJMNT4C6RHUU825Q
  //clave de acceso sercreta: evxpkjLuevPv5Q0nXXoBEoqJvy9QF2fwuMUzjj8Y
  //comando de inicio rapido: npx flatfile init --team 50869 --key FF00XR3WS37WD8LQBF6UQ2MIXJMNT4C6RHUU825Q  --secret evxpkjLuevPv5Q0nXXoBEoqJvy9QF2fwuMUzjj8Y  --environment test --name "flatfile-workbook"

  //50869
  //test
  //X-Api-Key: <access key id>+<secret access key>
  ngOnInit(): void {
    $(document).ready(function () {
      $('[data-bs-toggle="tooltip"]').tooltip();
    });

    this.estudiantes_const = [];
    this.estudiantes = [];
    this.load_data_est = true;
    let aux = localStorage.getItem('identity');
    this._adminService
      .obtener_config_admin(this.token)
      .subscribe((response) => {
        if (response.message) {
          this.router.navigate(['/configuracion']);
        } else {
          this.config_const = response.data[0];
          //console.log(this.config_const);
          this._adminService
            .obtener_admin(aux, this.token)
            .subscribe((response) => {
              if (response.data) {
                this.rol = response.data.rol;
                this.recarga();
                ////console.log(this.rol);
              } else {
                let user = JSON.parse(localStorage.getItem('user_data')!);

                if (!this.rol) {
                  this.rol = user.rol;
                  this.recarga();
                }
              }
            });
        }
      });
  }
  recarga() {
    //this.load_data_est=true;
    this.estudiantes_const = [];
    this.estudiantes = [];
    this.progressBarService.setProgress(
      this.progressBarService.getProgress() + 25
    );
    this._adminService
      .listar_estudiantes_tienda(this.token)
      .subscribe((response) => {
        //console.log(response);
        this.estudiantes_const = response.data;
        this.estudiantes = [];
        this.progressBarService.setProgress(
          this.progressBarService.getProgress() + 25
        );

        if (this.load_eliminados) {
          this.estudiantes_const.forEach((element) => {
            const fechaDesactivacion = new Date(element.f_desac);
            const fechaAnioLectivo = new Date(this.config_const.anio_lectivo);

            if (element.estado === 'Desactivado') {
              this.estudiantes.push({ ckechk: 0, element });
            } else {
              console.log('1');
              // Puedes descomentar esto si necesitas depurar
              // console.log(element.estado, fechaDesactivacion.getTime() <= fechaAnioLectivo.getTime());
            }
          });
        } else {
          this.estudiantes = [];
          this.estudiantes_const.forEach((element) => {
            const fechaDesactivacion = new Date(element.f_desac);
            const fechaAnioLectivo = new Date(this.config_const.anio_lectivo);

            if (element.estado !== 'Desactivado') {
              this.estudiantes.push({ ckechk: 0, element });
            } else {
              console.log('2');
              // Puedes descomentar esto si necesitas depurar
              // console.log(element.estado, fechaDesactivacion.getTime() > fechaAnioLectivo.getTime());
            }
          });
        }

        this.progressBarService.setProgress(
          this.progressBarService.getProgress() + 50
        );
        this.load_data_est = false;
        this.progressBarService.setProgress(0);
        /*
		this.estudiantes_const.forEach(element => {

			if(element.estado!='Desactivado'&&element.estado!=undefined){
				//////console.log(element.estado)
				this.estudiantes.push({ckechk:0,element});
			}

		});*/
        //////console.log(this.estudiantes);
        //this.load_data_est = false;
      });
  }
  importdatos() {}
  /*
	importdatos(){

		//console.log("Nien");
		Flatfile.requestDataFromUser({
			//FF00XR3WS37WD8LQBF6UQ2MIXJMNT4C6RHUU825Q --incorp
			//049743df-0983-4d9d-9e83-beb35f411989 --samuel
		embedId:'049743df-0983-4d9d-9e83-beb35f411989',

		onData:(chunk,next)=>{
			//console.log(chunk);
			chunk.records.forEach((element:any) => {
				this.carga.push(element);
			});

			//this.subir=chunk.records;
			//console.log(this.carga);

			if(chunk.totalChunks!=1){
				next();
			}else{
				this.carga.forEach((element:any) => {
					this.subir.push(element.data);
				});
				//console.log(this.subir);
				this.subir_estudiante();
			}

		},
		onInit:({session})=>{
			session.off('close', () => {});
		},
		onComplete:()=>{
			console.log("import completed");
		}
		});
	}
*/

  //N1DDq4BfF8ShhGBbq8zR69euleb7wg32DpstLBtw5JfEUPZgSMq1dnXnJpeNyEfA
  // 2 produccion---- 0SiKfh578fSfDXrlTEtPsAE69La56Jut5LWnxQFtIPgTbw3ACPioIKmcUIhvpUHV
  // 88440965-79d0-4d6e-a58d-3df7053ba6dd
  licenseKey = '88440965-79d0-4d6e-a58d-3df7053ba6dd';

  settings = {
    type: 'estudiantepro',

    fields: [
      {
        label: 'Nombres',
        key: 'nombres',
        validators: [{ validate: 'required', error: 'Obligatorio' }],
      },
      {
        label: 'Apellidos',
        key: 'apellidos',
        validators: [{ validate: 'required', error: 'Obligatorio' }],
      },
      {
        label: 'Dirección',
        key: 'direccion',
        validators: [{ validate: 'required', error: 'Obligatorio' }],
      },
      {
        label: 'Email',
        key: 'email',
        validators: [
          { validate: 'required', error: 'Obligatorio' },
          { validate: 'unique', error: 'Tiene que ser único' },
          {
            validate: 'regex_matches',
            regex:
              "^[-a-z0-9~!$%^&*_=+}{'?]+(.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(.[-a-z0-9_]+)*.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}))(:[0-9]{1,5})?$",
            error: 'solo correos',
          },
        ],
      },
      /*{
				label: "Contraseña",
				key: "password",
				validators: [{ validate: "required", error: "Obligatorio" }]
			},*/
      { label: 'Genero', key: 'genero' },
      {
        label: 'Telefono',
        key: 'telefono',
        validators: [
          { validate: 'required', error: 'Obligatorio' },

          {
            validate: 'regex_matches',
            regex: '^\\d{10,10}$',
            error: 'Debe ingresar 10 números',
          },
        ],
      },

      {
        label: 'Cedula',
        key: 'dni',
        validators: [
          { validate: 'required', error: 'Obligatorio' },
          { validate: 'unique', error: 'Tiene que ser único' },

          {
            validate: 'regex_matches',
            regex: '^\\d{10,10}$',
            error: 'Debe ingresar 10 números',
          },
        ],
      },

      {
        label: 'Curso',
        key: 'curso',
        validators: [{ validate: 'required', error: 'Obligatorio' }],
      },
      {
        label: 'Paralelo',
        key: 'paralelo',
        validators: [{ validate: 'required', error: 'Obligatorio' }],
      },
      {
        label: 'Nombres Padre',
        key: 'nombres_padre',
      },
      {
        label: 'Cedula Padre',
        key: 'dni_padre',
        validators: [
          {
            validate: 'regex_matches',
            regex: '^\\d{10,13}$',
            error: 'Debe ingresar 10 a 13 números',
          },
        ],
      },
      {
        label: 'Email Padre',
        key: 'email_padre',
        validators: [
          {
            validate: 'regex_matches',
            regex:
              "^[-a-z0-9~!$%^&*_=+}{'?]+(.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(.[-a-z0-9_]+)*.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}))(:[0-9]{1,5})?$",
            error: 'solo correos',
          },
        ],
      },
      {
        label: 'Nombres a Facturar',
        key: 'nombres_factura',
        validators: [{ validate: 'required', error: 'Obligatorio' }],
      },
      {
        label: 'Cedula a Facturar',
        key: 'dni_factura',
        validators: [
          { validate: 'required', error: 'Obligatorio' },
          {
            validate: 'regex_matches',
            regex: '^\\d{10,13}$',
            error: 'Debe ingresar 10 a 13 números',
          },
        ],
      },
    ],
  };
  //a5dba8ac-66f7-40b5-9fd0-74935e8fc05f
  // 2 produccion---- 049743df-0983-4d9d-9e83-beb35f411989
  //12345
  customer = { userId: '12345' };
  /*
	onData(results: CompleteParams): Promise<string> {
		let errorState = false;
		console.log(results);
		//console.log(results.validData);

		return new Promise((resolve, rejects) => {
			if (errorState) {
				rejects('reject -this text is controlled by the end-user');
				errorState = false;
			} else {
				console.log(results);
				//this.subir = results.data;
				//console.log(this.subir.length);
				//this.subir_estudiante();
				resolve('Agregados con exito');
			}
		});
	}
*/
  onFileChange(event: any) {
    if (event && event.target && event.target.files) {
      const file = event.target.files[0];
      this.validacion(file);
    } else {
      console.log('ERROR');
    }
  }

  validacion(file: File) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const csvData = reader.result;
      if (csvData) {
        const parsedData = Papa.parse(csvData.toString(), { header: true });
        //console.log(parsedData);
        this.encabezados = parsedData.meta.fields;
        //console.log(this.encabezados)
        this.abrirVentana(parsedData);
      }
    };
  }

  abrirVentana(parsedData: any) {
    // $('#modalAddProvMasivo').modal('hide');
    const modalRef = this.modalService.open(LinkHeaderComponent, {
      container: '#modalAddProvMasivo',
      backdrop: false,
      size: 'xl',
      centered: true,
      fullscreen: 'lg',
    });
    this.proveedor = [
      {
        nombre: 'apellidos',
        label: 'Apellidos',
        validacion: /^[a-zA-ZñÑÁÉÍÓÚáéíóú \s]+$/,
        obligatorio: true,
        mensaje: 'Solo letras',
      },
      {
        nombre: 'curso',
        label: 'Curso',
        obligatorio: true,
        mensaje: 'Obligatorio',
      },
      {
        nombre: 'direccion',
        label: 'Dirección',
        obligatorio: false,
        mensaje: 'Obligatorio',
      },
      {
        nombre: 'dni',
        label: 'Cédula',
        validacion: /^[0-9]{10}$|^[0-9]{13}$|^[A-Z]{2}[0-9]{6}$/,
        obligatorio: true,
        mensaje:
          'Debe ser un número de 10 o 13 dígitos, o un código alfanumérico de 8 caracteres (e.g., EP030107, FJ200685)',
      },

      {
        nombre: 'dni_factura',
        label: 'Cedula a Facturar',
        validacion: /^[0-9]{10}$|^[0-9]{13}$/,
        obligatorio: false,
        mensaje: 'Solo número de 10 a 13 caracteres',
      },
      {
        nombre: 'dni_padre',
        label: 'Cedula Padre',
        validacion: /^[0-9]{10}$|^[0-9]{13}$/,
        obligatorio: false,
        mensaje: 'Solo número de 10 a 13 caracteres',
      },
      {
        nombre: 'email',
        label: 'Email',
        validacion: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        obligatorio: false,
        mensaje: 'Tiene que incluir @ y un . seguido de dos o tres caracteres',
      },
      {
        nombre: 'email_padre',
        label: 'Email Padre',
        validacion: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        obligatorio: false,
        mensaje: 'Tiene que incluir @ y un . seguido de dos o tres caracteres',
      },
      {
        nombre: 'genero',
        label: 'Genero',
        obligatorio: false,
        mensaje: 'Obligatorio',
      },
      {
        nombre: 'nombres',
        label: 'Nombres',
        validacion: /^[a-zA-ZñÑÁÉÍÓÚáéíóú \s]+$/,
        obligatorio: true,
        mensaje: 'Solo letras',
      },
      {
        nombre: 'nombres_factura',
        label: 'Nombres Factura',
        validacion: /^[a-zA-ZñÑÁÉÍÓÚáéíóú \s]+$/,
        obligatorio: false,
        mensaje: 'Solo letras',
      },
      {
        nombre: 'nombres_padre',
        label: 'Nombres Padre',
        validacion: /^[a-zA-ZñÑÁÉÍÓÚáéíóú \s]+$/,
        obligatorio: false,
        mensaje: 'Solo letras',
      },
      {
        nombre: 'paralelo',
        label: 'Paralelo',
        obligatorio: true,
        mensaje: 'Obligatorio',
      },
      {
        nombre: 'telefono',
        label: 'Teléfono',
        validacion: /^[0-9]+$/,
        obligatorio: false,
        mensaje: 'Solo números',
      },
    ];
    this.proveedor = this.proveedor.map((item: any) => ({
      nombre: item.nombre,
      label: item.label,
      validacion: item.validacion,
      obligatorio: item.obligatorio,
      mensaje: item.mensaje,
      encabezado:
        this.encabezados.find(
          (encabezado: any) =>
            encabezado.localeCompare(item.label, 'es', {
              sensitivity: 'accent',
            }) === 0
        ) || '',
    }));

    //console.log(proveedorConEncabezados);
    //this.proveedor=proveedorConEncabezados;
    modalRef.componentInstance.proveedores = this.proveedor;
    modalRef.componentInstance.encabezados = this.encabezados;

    modalRef.result.then(
      (result) => {
        this.valid = result;
        if (this.valid != undefined) {
          //console.log('Modal closed:', this.valid);
          this.valid2(parsedData);
        } else {
          location.reload();
        }
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    );
  }
  updateData(rowIndex: number, columnIndex: number, event: any) {
    // rowIndex y columnIndex indican la posición de la celda que se está editando
    // event.target.textContent contiene el nuevo valor ingresado por el usuario
    const newValue = event.target.textContent.trim();

    // Ahora, puedes actualizar tus datos en proveedores_erro con la nueva información
    this.proveedores_erro[rowIndex].proveedor[columnIndex].value = newValue;
  }

  valid2(parsedData: any) {
    this.proveedores_erro = [];
    this.proveedores = [];
    parsedData.data.forEach((row: any, index: any) => {
      if (index < parsedData.data.length) {
        let save = true;

        const proveedor: { [key: string]: any } = {};
        const errores: any[] = [];

        this.valid.forEach((element: any) => {
          const valorCampo = row[element.encabezado];

          if (
            element.obligatorio &&
            (!valorCampo ||
              (element.validacion && !element.validacion.test(valorCampo)))
          ) {
            errores.push({ campo: element.nombre, mensaje: element.mensaje });
            save = false;
          } else if (
            !element.obligatorio &&
            valorCampo &&
            element.validacion &&
            !element.validacion.test(valorCampo)
          ) {
            errores.push({ campo: element.nombre, mensaje: element.mensaje });
            save = false;
          }
          proveedor[element.nombre] = valorCampo || '';
        });

        if (!save) {
          this.proveedores_erro.push({ proveedor, index, errores });
        } else {
          this.proveedores.push(proveedor);
        }
      }
    });

    $('#modalAddProvMasivo').modal('hide');

    this.collectionSize = this.proveedores.length;

    if (this.proveedores_erro.length > 0) {
      $('#modalRevisionMasivo').modal('show');
    } else {
      $('#modalGuardar').modal('show');
    }

    //console.log("Validos",this.proveedores);
    console.log('Erroneos', this.proveedores_erro);
  }
  cerrar_ventana() {
    $('#modalRevisionMasivo').modal('hide');
    $('#modalGuardar').modal('show');
  }

  seleccionarArchivo() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileDrop(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.validacion(file);
          //console.log(file);
        });
      }
    }
  }
  getErrorMessage(errores: any, campo: string): string | undefined {
    const proveedorErro = errores.find((erro: any) => erro.campo === campo);
    return proveedorErro ? proveedorErro.mensaje : undefined;
  }
  getObjectEntries(obj: any): { key: string; value: any }[] {
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }

  subir_estudiante() {
    this.load_data_est = true;
    this.subidoss = 0;
    this.resubidos = 0;
    this.resubidosc = 0;
    this.errorneoss = 0;
    this.errorv = 0;
    this.progressBarService.setProgress(
      this.progressBarService.getProgress() + 10
    );
    this._adminService
      .registro_estudiante_masivo(this.proveedores, this.token)
      .subscribe((response) => {
        //console.log(response);
        this.subidoss = response.s;
        this.resubidos = response.r;
        this.resubidosc = response.rc;
        this.errorneoss = response.e;
        this.errorv = response.ev;
        this.progressBarService.setProgress(
          this.progressBarService.getProgress() + 50
        );
        if (this.subidoss != 0) {
          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'iziToast-success',
            position: 'topRight',
            message: 'Estudiante agregado con exito (' + this.subidoss + ')',
          });
        }
        if (this.resubidos != 0) {
          iziToast.show({
            title: 'INFO',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'iziToast-primary',
            position: 'topRight',
            message: 'Reactivado (' + this.resubidos + ')',
          });
        }
        if (this.resubidosc != 0) {
          iziToast.show({
            title: 'INFO',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'iziToast-info',
            position: 'topRight',
            message:
              'Reactivado con pension existente(' + this.resubidosc + ')',
          });
        }
        if (this.errorneoss != 0) {
          iziToast.show({
            title: 'ADVERTENCIA',
            titleColor: 'RED',
            color: 'RED',
            class: 'iziToast-warning',
            position: 'topRight',
            message: 'Estudiante ya existente' + '(' + this.errorneoss + ')',
          });
        }
        if (this.errorv != 0) {
          iziToast.show({
            title: 'ERROR',
            titleColor: 'RED',
            color: 'RED',
            class: 'iziToast-dannger',
            position: 'topRight',
            message: 'Fila con campo vacio' + '(' + this.errorv + ')',
          });
        }
        this.progressBarService.setProgress(
          this.progressBarService.getProgress() + 100
        );
        this.load_eliminados = false;
        this.progressBarService.setProgress(0);
        //this.ngOnInit();
        location.reload();
      });
  }
  mostrar_eliminado() {
    this.total = 0;
    this.load_data_est = true;
    this.load_eliminados = true;
    this.estudiantes = [];
    this.estudiantes_const.forEach((element) => {
      if (element.estado == 'Desactivado') {
        //////console.log(element.estado)
        this.estudiantes.push({ ckechk: 0, element });
      }
    });
    this.load_data_est = false;
    this.recarga();
  }
  mostrar_normales() {
    this.total = 0;
    this.load_data_est = true;
    this.load_eliminados = false;
    this.estudiantes = [];
    this.estudiantes_const.forEach((element) => {
      if (element.estado != 'Desactivado' && element.estado != undefined) {
        //////console.log(element.estado)
        this.estudiantes.push({ ckechk: 0, element });
      }
    });
    this.load_data_est = false;
    this.recarga();
  }
  GoogleSuspend(email: string, id: string) {
    this._adminService
      .cambiarEstadoGoogle(this.token, {
        array: [email],
        estado: !this.infouser.suspended,
      })
      .subscribe((response) => {
        if (response.users) {
          $('#suspend-' + id).modal('hide');
          let titulo = 'Reactivado:';
          if (!this.infouser.suspended) {
            titulo = 'Suspendido:';
          }
          iziToast.success({
            title: titulo,
            position: 'topRight',
            message: response.users[0].userEmail,
          });
        }
      });
  }
  infouser: any = {};
  loadinfouser = true;
  Googlefind(email: string, id: string) {
    this.infouser = {};
    this.loadinfouser = true;
    this._adminService
      .consultarEstadoGoogle(this.token, email)
      .subscribe((response) => {
        //console.log(response);
        $('#suspend-' + id).modal('show');
        if (response.users) {
          this.infouser = response.users;
          this.loadinfouser = false;
        }
      });
  }
  filtrar_estudiante() {
    this.load_data_est = true;
    this.estudiantes = [];
    var aux = this.filtro;
    if (this.filtro) {
      if (this.filtro.length <= 2) {
        this.filtro = "'" + this.filtro + "'";
      }
      var term = new RegExp(this.filtro.toString().trim(), 'i');
      if (this.load_eliminados) {
        this.estudiantes_const.forEach((element) => {
          if (element.estado == 'Desactivado') {
            //////console.log(element.estado)
            this.estudiantes.push({ ckechk: 0, element });
          }
        });
      } else {
        this.estudiantes_const.forEach((element) => {
          if (element.estado != 'Desactivado' && element.estado != undefined) {
            //////console.log(element.estado)
            this.estudiantes.push({ ckechk: 0, element });
          }
        });
      }

      this.estudiantes = this.estudiantes.filter(
        (item) =>
          term.test(
            item.element.curso.toString() +
              '-' +
              item.element.paralelo.toString() +
              ' ' +
              item.element.genero
          ) ||
          term.test(
            item.element.curso.toString() +
              '-' +
              item.element.paralelo.toString()
          ) ||
          term.test(item.element.nombres) ||
          term.test("'" + item.element.curso + "'") ||
          term.test("'" + item.element.paralelo + "'") ||
          term.test(item.element.genero) ||
          term.test(item.element.apellidos) ||
          term.test(item.element.email) ||
          term.test(item.element.dni) ||
          term.test(item.element.telefono) ||
          term.test(item.element._id) ||
          term.test(item.element.createdAt) ||
          term.test(item.element.email_padre)
      );
    } else {
      if (this.load_eliminados) {
        this.estudiantes_const.forEach((element) => {
          if (element.estado == 'Desactivado') {
            //////console.log(element.estado)
            this.estudiantes.push({ ckechk: 0, element });
          }
        });
      } else {
        this.estudiantes_const.forEach((element) => {
          if (element.estado != 'Desactivado' && element.estado != undefined) {
            //////console.log(element.estado)
            this.estudiantes.push({ ckechk: 0, element });
          }
        });
      }
    }
    this.filtro = aux;
    this.load_data_est = false;
  }
  eliminar(id: any) {
    this.load_data_est = true;
    //this.load_data_est=true;
    //////console.log(id);
    this._adminService.eliminar_estudiante_admin(id, this.token).subscribe(
      (response) => {
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'iziToast-success',
          position: 'topRight',
          message: response.message,
        });

        $('#delete-' + id).modal('hide');
        $('.modal-backdrop').removeClass('show');

        location.reload();
      },
      (error) => {
        //////console.log(error);
      }
    );
  }
  eliminar_todo() {
    this.load_data_est = true;
    //this.load_data_est=true;
    //////console.log(id);
    var con = 0;
    let ultimo = 0;
    this.estudiantes.forEach((element) => {
      if (element.ckechk == 1) {
        ultimo++;
      }
    });
    ////console.log(ultimo);
    this.estudiantes.forEach((element: any) => {
      if (element.ckechk == 1) {
        this._adminService
          .eliminar_estudiante_admin(element.element._id, this.token)
          .subscribe(
            (response) => {
              con++;
              if (con == ultimo) {
                iziToast.show({
                  title: 'SUCCESS',
                  titleColor: '#1DC74C',
                  color: '#FFF',
                  class: 'iziToast-success',
                  position: 'topRight',
                  message:
                    'Se eliminó correctamente el(los) estudiante.' +
                    '(' +
                    con +
                    ')',
                });
                this.total = 0;
                this.load_eliminados = true;
                this.recarga();
                ////console.log("Fin1");
              }
              //this.recarga();
            },
            (error) => {
              //////console.log(error);
            }
          );
      }
    });
    $('#delete-todo').modal('hide');
    $('.modal-backdrop').removeClass('show');
    location.reload();
  }
  select_todo() {
    if (this.total == 1) {
      this.estudiantes.forEach((element: any) => {
        element.ckechk = 0;
      });
    } else {
      this.estudiantes.forEach((element: any) => {
        element.ckechk = 1;
      });
    }
  }
  activar_todo() {
    this.load_data_est = true;
    //this.load_data_est=true;
    //////console.log(id);
    var con = 0;
    let ultimo = 0;
    this.estudiantes.forEach((element) => {
      if (element.ckechk == 1) {
        ultimo++;
      }
    });
    ////console.log(ultimo);
    this.estudiantes.forEach((element: any) => {
      if (element.ckechk == 1) {
        this._adminService
          .reactivar_estudiante_admin(element.element._id, this.token)
          .subscribe(
            (response) => {
              con++;
              if (con == ultimo) {
              }
              iziToast.show({
                title: 'SUCCESS',
                titleColor: '#1DC74C',
                color: '#FFF',
                class: 'iziToast-success',
                position: 'topRight',
                message:
                  'Se activo correctamente el estudiante.' + '(' + con + ')',
              });
              this.total = 0;
              this.load_eliminados = false;
              this.recarga();
              ////console.log("Fin2");
              //this.recarga();
            },
            (error) => {
              //////console.log(error);
            }
          );
      }
    });
    $('#activar-todo').modal('hide');
    $('.modal-backdrop').removeClass('show');
    location.reload();
  }

  activar(id: any) {
    this.load_data_est = true;
    //this.load_data_est=true;
    //////console.log(id);
    this._adminService.reactivar_estudiante_admin(id, this.token).subscribe(
      (response) => {
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'iziToast-success',
          position: 'topRight',
          message: 'Se activado correctamente el estudiante.',
        });

        $('#delete-' + id).modal('hide');
        $('.modal-backdrop').removeClass('show');
        this.mostrar_normales();
        location.reload();
      },
      (error) => {
        //////console.log(error);
      }
    );
  }
}
