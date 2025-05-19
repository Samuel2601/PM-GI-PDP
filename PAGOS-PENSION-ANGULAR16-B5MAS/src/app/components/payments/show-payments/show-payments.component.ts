import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import { EstudianteService } from 'src/app/service/student.service';
import { GLOBAL } from 'src/app/service/GLOBAL';
import { TableUtil, TableUtil2 } from '../show-payments/tableUtil';
import iziToast from 'izitoast';
import {
  firstValueFrom,
  lastValueFrom,
  Observable,
  of,
  Subject,
  Subscription,
  throwError,
} from 'rxjs';
import {
  catchError,
  delay,
  finalize,
  retryWhen,
  take,
  takeUntil,
  tap,
  timeout,
} from 'rxjs/operators';
import { InstitucionServiceService } from 'src/app/service/institucion.service.service';
import { PersonService } from 'src/app/service/confitico/person.service';
import { InventoryService } from 'src/app/service/confitico/inventory.service';
import { CreateProduct } from './producto.interface';
import { DatePipe } from '@angular/common';
import { PRODUCTOS_BASE } from './seedproductos';
import { TransactionService } from 'src/app/service/confitico/transaction.service';
import { Cliente, Cobro, Documento, Vendedor } from './document.interface';
import { BankingService } from 'src/app/service/confitico/banking.service';
import { RetryService } from 'src/app/service/retry.service';
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

  // Estado de carga mejorado
  loading = {
    generacion: false,
    creacion: false,
    emision: false,
    consultaDoc: false,
    dataInitialization: false,
    retrying: false,
  };

  mensajes = {
    generacion: '',
    creacion: '',
    emision: '',
    consultaDoc: '',
    dataInitialization: '',
  };

  // Variables para manejo de reintentos
  private dataInitRetryCount = 0;
  private maxRetries = 5;
  private retryDelay = 2000;
  private destroy$ = new Subject<void>();
  private loadingTimerId: any;

  public rol = '';
  public idp = '';
  public yo = 0;
  public info: any;
  public base: any;
  public apikey: any = undefined;
  public documento_contifico: any = null;
  public habilitar_boton_generar: boolean = false;
  public create_person: boolean = false;
  public id_facturacion: any;
  public loademit: boolean = false;
  private error_constru = '';

  constructor(
    private _route: ActivatedRoute,
    private _adminService: AdminService,
    private _estudianteService: EstudianteService,
    private _router: Router,
    private _institucionService: InstitucionServiceService,
    private _personService: PersonService,
    private _invetarioService: InventoryService,
    private _transactionService: TransactionService,
    private _bankingService: BankingService,
    private datePipe: DatePipe,
    private retryService: RetryService
  ) {
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.loadingTimerId) {
      clearTimeout(this.loadingTimerId);
    }
  }

  consultarDocumento() {
    this._transactionService.getDocuments().subscribe((response: any) => {
      if (response) {
        console.log(response);
      }
    });
  }

  async armadoconifico() {
    const pre_factura = await this.armado_Documento_envio_Contifico(
      this.pago,
      this.detalles
    );
    console.log(pre_factura);
  }

  async armadocnuevo_proveedor() {
    const new_proveedor = await this.armado_Documento_nuevo_proveedor(
      this.pago,
      this.detalles
    );
    console.log('Nuevo proveedor:', new_proveedor);
  }

  // Crear un servicio de caché
  apikey_int: boolean = false;
  async consultar_apikey() {
    try {
      // Primero intentar obtener del localStorage
      const cachedApiKey = localStorage.getItem('cached_api_key');
      const cachedTimestamp = localStorage.getItem('cached_api_key_timestamp');
      const currentTime = new Date().getTime();

      // Si tenemos una clave en caché y no ha expirado (por ejemplo, válida por 1 día)
      if (
        cachedApiKey &&
        cachedTimestamp &&
        currentTime - parseInt(cachedTimestamp) < 24 * 60 * 60 * 1000
      ) {
        console.log('Usando API key desde caché');
        this.apikey = cachedApiKey;
        this.apikey_int = /^\d+$/.test(this.apikey); // Verifica si apikey contiene solo dígitos
        return;
      }

      // Si no hay caché o está expirada, consultar al servidor
      const user_data = JSON.parse(localStorage.getItem('user_data') || '');
      const response = await lastValueFrom(
        this._institucionService.getInstitucionKey(user_data.base).pipe(
          this.retryService.exponentialBackoff(
            3,
            1000,
            2,
            (retryCount, error) => {
              console.log(
                `Reintento ${retryCount}: Error al obtener apikey`,
                error
              );
            }
          )
        )
      );

      if (response) {
        this.apikey = (response as { apiKey: string }).apiKey;

        // Guardar en caché
        localStorage.setItem('cached_api_key', this.apikey);
        localStorage.setItem(
          'cached_api_key_timestamp',
          currentTime.toString()
        );

        console.log(
          'API key obtenida del servidor y almacenada en caché:',
          this.apikey
        );
      }
      if (this.apikey) {
        // Verifica si apikey contiene solo dígitos
        this.apikey_int = /^\d+$/.test(this.apikey);
      }
      console.log('API key:', this.apikey);
      console.log('API key int:', this.apikey_int);
    } catch (error) {
      console.error('Error al consultar API key:', error);

      // En caso de error, intentar usar la última clave en caché aunque esté expirada
      const cachedApiKey = localStorage.getItem('cached_api_key');
      if (cachedApiKey) {
        console.log(
          'Usando API key en caché como fallback después de un error'
        );
        this.apikey = cachedApiKey;

        if (this.apikey) {
          // Verifica si apikey contiene solo dígitos
          this.apikey_int = /^\d+$/.test(this.apikey);
        }
      }
    }
  }
  async consultaTodosProducto() {
    this._invetarioService.getProducts().subscribe({
      next: (response: any) => {
        if (response) {
          console.log(response);
        }
      },
      error: (error: any) => {
        console.error('Error al consultar:', error);
      },
    });
  }

  async consultaProducto(): Promise<void> {
    for (const element of this.detalles) {
      if (element.tipo > 11) {
        continue;
      }

      try {
        console.log('Consultando producto', element.tipo);

        // Handle matrícula type conversion
        const tipoConsulta = element.tipo === 0 ? 11 : element.tipo;

        const response = await this._invetarioService
          .getProductsTipo(tipoConsulta)
          .toPromise();

        if (response?.id) {
          console.log('Producto encontrado:', response);
          element.id_contifico_producto = response.id;
        } else {
          console.log('No se encontró el producto, creando nuevo producto');
          const productoseed = PRODUCTOS_BASE.find(
            (producto) =>
              producto.codigo === 'P' + tipoConsulta.toString().padStart(3, '0')
          );

          if (!productoseed) {
            throw new Error(
              `No se encontró producto base para tipo ${tipoConsulta}`
            );
          }

          const newProduct = await this.crear_producto(productoseed);
          if (newProduct?.id) {
            element.id_contifico_producto = newProduct.id;
          } else {
            throw new Error('Error al crear nuevo producto');
          }

          /*this.showErrorToast(
            `No se encontró el producto: ${element.descripcion}`
          );*/
        }
      } catch (error) {
        console.error('Error al procesar producto:', error);
        this.showErrorToast(
          'Ocurrió un error inesperado. Por favor, revisa los datos e intenta de nuevo.'
        );
      }
    }
  }

  private buildDescripcion(element: any): string {
    const tipoText = element.tipo === 0 ? 'Matricula' : 'Pensión';
    let periodoText = '';

    if (element.tipo >= 1 && element.tipo <= 10) {
      const mes = this.datePipe.transform(
        this.fecha[element.tipo - 1].date,
        'MMMM'
      );
      periodoText = `${element.tipo} ${mes}`;
    } else if (element.tipo > 10) {
      return element.descripcion;
    }

    return [
      tipoText,
      periodoText,
      element.idpension.curso,
      element.idpension.paralelo,
      element.idpension.especialidad,
      `${this.datePipe.transform(element.idpension.anio_lectivo, 'YYYY')}-${
        element.aniosup
      }`,
    ]
      .filter(Boolean)
      .join(' ');
  }

  async crear_producto(producto: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._invetarioService.createProduct(producto).subscribe({
        next: (response: any) => {
          console.log('Producto creado:', response);
          resolve(response);
        },
        error: (error) => {
          console.error('Error al crear producto:', error);
          this.showErrorToast(
            'Error al crear el producto. Por favor, intenta de nuevo.'
          );
          reject(error);
        },
      });
    });
  }

  private showErrorToast(message: string): void {
    iziToast.error({
      title: 'ERROR',
      position: 'topRight',
      message,
      timeout: 5000,
      closeOnClick: true,
    });
  }

  private showSuccessToast(message: string): void {
    iziToast.success({
      title: 'ÉXITO',
      position: 'topRight',
      message,
      timeout: 5000,
      closeOnClick: true,
    });
  }

  private showInfoToast(message: string): void {
    iziToast.info({
      title: 'INFO',
      position: 'topRight',
      message,
      timeout: 5000,
      closeOnClick: true,
    });
  }

  getEcuadorDate = (date?: Date) => {
    const ecuadorOffset = -5; // Zona horaria de Ecuador (GMT-5)
    const localDate = new Date(date || new Date());
    const utcDate = new Date(
      localDate.getTime() + localDate.getTimezoneOffset() * 60000
    );
    const ecuadorDate = new Date(utcDate.getTime() + ecuadorOffset * 3600000);

    const day = String(ecuadorDate.getDate()).padStart(2, '0');
    const month = String(ecuadorDate.getMonth() + 1).padStart(2, '0'); // Meses empiezan desde 0
    const year = ecuadorDate.getFullYear();

    return `${day}/${month}/${year}`;
  };

  async obtener(id: any): Promise<number> {
    try {
      const response = await firstValueFrom(
        this._adminService.obtener_documento_admin(id, this.token)
      );
      console.log(response);

      if (response && response.fact && Array.isArray(response.fact)) {
        // Filtrar el array para excluir la factura actual (this.pago._id)
        const facturasFiltradas = response.fact.filter(
          (factId: string) => factId !== this.pago._id
        );

        return facturasFiltradas.length;
      }
      return 0;
    } catch (error) {
      console.error('Error al obtener documento:', error);
      return 0;
    }
  }

  async armado_Documento_envio_Contifico(
    pago: any,
    detalles: any[]
  ): Promise<Documento> {
    // Componente
    try {
      // Obtener cuentas bancarias
      const accounts = await firstValueFrom(
        this._bankingService.getBankAccounts()
      );
      if (!accounts || accounts.length === 0) {
        iziToast.error({
          title: 'ERROR',
          position: 'topRight',
          message: 'No se encontraron cuentas bancarias',
        });
        throw new Error('No se encontraron cuentas bancarias');
      }

      const account = accounts[0]; // Usar la primera cuenta bancaria disponible
      const cliente: Cliente = {
        cedula: pago.estudiante.dni_factura.substr(0, 10),
        razon_social: pago.estudiante.nombres_factura,
        telefonos: pago.estudiante.telefono,
        direccion: pago.estudiante.direccion,
        tipo: 'N',
        email: pago.estudiante.email_padre,
        es_extranjero: false,
        ruc: null,
      };

      if (pago.estudiante.dni_factura.length > 10) {
        cliente.ruc = pago.estudiante.dni_factura;
      }

      const vendedor: Vendedor = {
        cedula: pago.encargado.dni,
        razon_social: `${pago.encargado.nombres} ${pago.encargado.apellidos}`,
        telefonos: pago.encargado.telefono,
        direccion: '',
        tipo: 'N',
        email: pago.encargado.email,
        es_extranjero: false,
      };

      // Se agrupa por número de comprobante y se acumula el monto
      const cobros: Cobro[] = Object.values(
        detalles.reduce((acc, detalle) => {
          const { documento } = detalle;
          const docKey = documento.documento || 'Sin comprobante';
          console.log(documento);
          if (!acc[docKey]) {
            acc[docKey] = {
              id: documento._id,
              forma_cobro: documento.cuenta === 'Efectivo' ? 'EF' : 'TRA',
              monto: 0,
              numero_comprobante: docKey,
              fecha: this.getEcuadorDate(new Date()),
              cuenta_bancaria_id:
                documento.cuenta === 'Efectivo' ? null : account.id,
              valor_origen: documento.valor_origen || 0,
            };
          }

          // Sumar los valores si el documento ya existe en el acumulador
          acc[docKey].monto +=
            documento.documento === docKey ? detalle.valor : 0;

          return acc;
        }, {})
      );

      // Calcular subtotal y total con redondeo a 2 decimales
      const subtotal = Number(
        detalles.reduce((sum, det) => sum + det.valor, 0).toFixed(2)
      );

      // Procesar cada cobro para verificar discrepancias y aplicar índices
      const cobrosArray = await Promise.all(
        Object.values(cobros).map(async (cobro: any) => {
          // Comprobar si hay discrepancia entre valor_origen y monto acumulado
          if (cobro.valor_origen > 0 && cobro.monto !== cobro.valor_origen) {
            // Obtener cuántas veces se ha asignado este documento
            const asignaciones = await this.obtener(cobro.id);

            // Siempre añadir un índice cuando hay discrepancia
            // Si hay asignaciones previas, usar ese número, si no, comenzar con 1
            const indice = asignaciones > 0 ? asignaciones : 1;
            cobro.numero_comprobante = `${cobro.numero_comprobante}-${
              indice + 1
            }`;
          }

          // Redondear el monto a 2 decimales
          cobro.monto = Number(cobro.monto.toFixed(2));

          // Eliminar propiedades temporales antes de devolver
          const { valor_origen, ...cobroFinal } = cobro;
          return cobroFinal;
        })
      );

      console.log(cobrosArray);

      return {
        //pos: 'ceaa9097-1d76-4eb8-0000-6f412fa0297b', // Token fijo o dinámico
        fecha_emision: this.getEcuadorDate(), // Fecha actual
        tipo_documento: 'FAC',
        electronico: true,
        servicio: 0.0,
        //documento: pago._id,
        estado: 'P',
        //autorizacion: '0123456789',
        caja_id: null,
        cliente: cliente,
        //vendedor: vendedor,
        descripcion: `VENTA DESDE PUNTO DE VENTA`,
        subtotal_12: 0.0,
        subtotal_0: subtotal,
        iva: 0.0,
        ice: 0.0,
        total: subtotal, // Usar el mismo valor redondeado
        adicional1:
          'Estudiante: ' +
          pago.estudiante.nombres +
          ' ' +
          pago.estudiante.apellidos,
        adicional2: detalles
          .reduce(
            (sum, det) => sum + (det.descripcion ? det.descripcion + '/ ' : ''),
            ''
          )
          .slice(0, -2),
        detalles: detalles.map((detalle) => ({
          adicional1: detalle.descripcion + ' ' + detalle.estado,
          producto_id: detalle.id_contifico_producto,
          cantidad: 1.0,
          precio: Number(detalle.valor.toFixed(2)), // Redondear precio a 2 decimales
          porcentaje_iva: 0,
          base_cero: Number(detalle.valor.toFixed(2)), // Redondear base_cero a 2 decimales
          base_gravable: 0.0,
          base_no_gravable: 0.0,
          valor_ice: 0.0,
          porcentaje_ice: 0.0,
          porcentaje_descuento: 0.0,
          tipo: detalle.tipo == 0 ? 11 : detalle.tipo,
        })),
        cobros: cobros,
      };
    } catch (error) {
      console.error('Error al armar documento:', error);
      // Manejo de error
      iziToast.error({
        title: 'ERROR',
        position: 'topRight',
        message: 'Error al armar documento',
      });
      throw new Error('Error al armar documento');
    }
  }

  async crear_documento(documento: Documento) {
    this.loading.creacion = true;
    this.mensajes.creacion = 'Creando documento en el sistema...';

    this._transactionService
      .createDocument(documento, this.pago._id)
      .subscribe({
        next: (response) => {
          if (response) {
            console.log('Documento creado con éxito', response);
            this.mensajes.creacion = 'Documento creado exitosamente';
            this.showSuccessToast('Documento creado con éxito');
            this._adminService.actualizar_pago_id_contifico(
              {
                id: this.pago._id,
                id_contifico: response.id,
              },
              this.token
            );
            /*setTimeout(() => {
              location.reload();
            }, 2500);*/
          } else {
            this.mensajes.creacion = 'Error al crear el documento';
            this.showErrorToast(
              'Error al crear el documento. Por favor, inténtelo nuevamente.'
            );
          }
        },
        error: (error) => {
          console.error('Error en la creación del documento:', error);
          let errorMessage =
            'Ocurrió un error desconocido. Por favor, inténtelo más tarde.';

          if (error?.error?.error?.mensaje) {
            errorMessage = error.error.error.mensaje;
          } else if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }

          this.mensajes.creacion = errorMessage;
          this.showErrorToast(errorMessage);
        },
        complete: () => {
          this.loading.generacion = false;
          this.loading.creacion = false;
        },
      });
  }

  async generarDocumento() {
    this.habilitar_boton_generar = true;
    if (this.apikey && !this.pago.id_contifico && this.apikey_int === false) {
      const pre_factura = await this.armado_Documento_envio_Contifico(
        this.pago,
        this.detalles
      );
      console.log(pre_factura);
      try {
        await this.crear_documento(pre_factura);
      } catch (error) {
        console.error(error);
        this.habilitar_boton_generar = true;
      }
    } else if (this.apikey && !this.pago.id_contifico && this.apikey_int) {
      await this.generarDocumentoNuevoProveedor();
    }
  }

  emitirSRI() {
    this.loading.emision = true;
    this.mensajes.emision = 'Emitiendo documento al SRI...';

    this._transactionService
      .submitDocumentToSRI(this.pago.id_contifico, this.documento_contifico)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.documento_contifico = response;
          this.mensajes.emision = 'Documento emitido exitosamente al SRI';
          /*setTimeout(() => location.reload(), 5000);*/
        },
        error: (error) => {
          this.mensajes.emision = 'Error al emitir al SRI: ' + error.message;
        },
        complete: () => {
          //this.loading.emision = false;
        },
      });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.load_data = true;
      this.loading.dataInitialization = true;
      this.mensajes.dataInitialization = 'Inicializando datos...';

      // Configurar timeout para mostrar mensaje si tarda demasiado
      this.loadingTimerId = setTimeout(() => {
        if (this.loading.dataInitialization) {
          this.mensajes.dataInitialization =
            'La carga está tomando más tiempo de lo esperado. Por favor, espere...';
        }
      }, 5000);

      // Consultar API key primero
      await this.consultar_apikey();

      // Obtener información del admin
      const adminResponse = await lastValueFrom(
        this._adminService.obtener_info_admin(this.token).pipe(
          this.retryService.exponentialBackoff(
            3,
            1000,
            2,
            (retryCount, error) => {
              this.loading.retrying = true;
              this.mensajes.dataInitialization = `Reintentando obtener datos del administrador (${retryCount}/3)...`;
              console.log(
                `Reintento ${retryCount}: Error al obtener datos de admin`,
                error
              );
            }
          ),
          finalize(() => (this.loading.retrying = false))
        )
      );

      if (!(adminResponse as { data?: any })?.data) {
        throw new Error('No se pudo obtener la información del administrador');
      }

      // Establecer información básica
      this.info = (adminResponse as { data: any }).data;
      this.setUserData();

      // Obtener parámetros de la ruta y procesar documento
      await this.procesarRutaYDocumento();
    } catch (error) {
      console.error('Error en la inicialización:', error);
      this.showErrorToast(
        'Error al cargar los datos. Por favor, recargue la página.'
      );
    } finally {
      if (this.loadingTimerId) {
        clearTimeout(this.loadingTimerId);
      }
      this.loading.dataInitialization = false;
      this.load_data = false;
    }
  }

  private setUserData(): void {
    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '');
      if (!userData) throw new Error('No hay datos de usuario');

      this.imagen = userData.portada;
      this.rol = userData.rol;
      this.base = userData.base;
      this.idp = userData._id;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      this.showErrorToast('Error al cargar datos del usuario');
    }
  }

  private async procesarRutaYDocumento(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._route.params.pipe(takeUntil(this.destroy$)).subscribe({
        next: async (params) => {
          try {
            this.id = params['id'];
            await this.init_data();
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => reject(error),
      });
    });
  }

  private async manejarDocumentoContifico(): Promise<void> {
    if (this.apikey_int === true) {
      this.habilitar_boton_generar = true;
      console.log('No hay API key configurada');
      return;
    }

    if (!this.apikey) {
      console.log('No hay API key configurada');
      return;
    }
    console.log('Manejar documento Contifico', this.pago.id_contifico);
    try {
      if (
        this.pago.id_contifico === undefined ||
        this.pago.id_contifico === null
      ) {
        this.habilitar_boton_generar = true;
      } else {
        // Si hay ID Contífico, obtener documento con reintentos
        this.loading.consultaDoc = true;
        this.mensajes.consultaDoc = 'Consultando documento...';

        const response = await lastValueFrom(
          this._transactionService.getDocumentById(this.pago.id_contifico).pipe(
            this.retryService.exponentialBackoff(
              3,
              1000,
              2,
              (retryCount, error) => {
                this.mensajes.consultaDoc = `Reintentando consulta de documento (${retryCount}/3)...`;
                console.log(
                  `Reintento ${retryCount}: Error al consultar documento`,
                  error
                );
              }
            )
          )
        );

        this.documento_contifico = response;
        this.mensajes.consultaDoc = 'Documento consultado exitosamente';
        console.log('Documento consultado:', this.documento_contifico);
      }
    } catch (error) {
      console.error('Error al manejar documento Contífico:', error);
      this.mensajes.consultaDoc = 'Error al consultar documento';
      this.showErrorToast('Error al procesar el documento');
    } finally {
      this.loading.consultaDoc = false;
    }
  }

  async consultar_Cedula(cedula: any): Promise<boolean> {
    try {
      console.log('Consultando cedula', cedula);
      const response: any = await this._personService
        .getPersonByCedula(cedula)
        .toPromise();
      console.log(response);
      if (response.id) {
        this.id_facturacion = response.id;
        const response2: any = await this._estudianteService
          .actualizar_estudiante_admin(
            this.pago.estudiante._id,
            { ...this.pago.estudiante, id_contifico_persona: response.id },
            this.token
          )
          .toPromise();

        if (response2.message === 'Actualizado con exito') {
          this.create_person = false;
          return true;
        }
        return false;
      } else {
        this.create_person = true;
        return false;
      }
    } catch (error) {
      console.error('Error al consultar:', error);
      this.create_person = false;
      return false;
    }
  }

  async verificar_persona() {
    let mensajeError = '';
    try {
      if (this.pago.estudiante.id_contifico_persona) {
        this.id_facturacion = this.pago.estudiante.id_contifico_persona;
        return;
      }
      if (
        !this.pago.estudiante.id_contifico_persona &&
        this.pago.estudiante.dni_factura &&
        this.apikey
      ) {
        if (
          !(await this.consultar_Cedula(this.pago.estudiante.dni_factura)) &&
          this.create_person
        ) {
          console.log('Creando persona');
          const new_person: any = {
            nombre_comercial: this.pago.estudiante.nombres_factura,
            razon_social: this.pago.estudiante.nombres_factura,
            email: this.pago.estudiante.email_padre,
            direccion: this.pago.estudiante.direccion,
            telefonos: this.pago.estudiante.telefono,
            tipo: 'N',
            es_cliente: true,
          };

          if (this.pago.estudiante.dni_factura.length > 10) {
            new_person.ruc = this.pago.estudiante.dni_factura;
          } else {
            new_person.cedula = this.pago.estudiante.dni_factura.substr(0, 10);
          }
          console.log('Nueva Persona', new_person);

          try {
            const response2: any = await this._personService
              .createPerson(new_person)
              .toPromise();

            console.log(response2);

            // Manejo explícito del caso donde no hay un `id` en la respuesta
            if (!response2.id) {
              this.id_facturacion = response2.id;
              mensajeError =
                response2?.error?.error?.mensaje ||
                response2?.message ||
                'Error desconocido al crear la persona';

              iziToast.error({
                title: 'ERROR',
                position: 'topRight',
                message: 'Error en la creación de la persona: ' + mensajeError,
              });
              return;
            }

            const response3: any = await this._estudianteService
              .actualizar_estudiante_admin(
                this.pago.estudiante._id,
                { ...this.pago.estudiante, id_contifico_persona: response2.id },
                this.token
              )
              .toPromise();
            console.log(response3);
          } catch (error) {
            console.error('Error al crear la persona:', error);
            iziToast.error({
              title: 'ERROR',
              position: 'topRight',
              message:
                'Ocurrió un error inesperado al intentar crear la persona.' +
                mensajeError,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error al consultar:', error);
      iziToast.error({
        title: 'ERROR',
        position: 'topRight',
        message:
          'Ocurrió un error inesperado. Por favor, revisa los datos e intenta de nuevo.',
      });
    }
  }

  async init_data() {
    this.dataInitRetryCount = 0;
    return this.attemptInitData();
  }

  private async attemptInitData(): Promise<void> {
    try {
      const loadingMessage =
        this.dataInitRetryCount > 0
          ? `Cargando datos (intento ${this.dataInitRetryCount + 1}/${
              this.maxRetries + 1
            })...`
          : 'Cargando datos del pago...';

      this.mensajes.dataInitialization = loadingMessage;

      // Usamos timeout para manejar respuestas lentas del servidor
      const response = await lastValueFrom(
        this._adminService
          .obtener_detalles_ordenes_estudiante(this.id, this.token)
          .pipe(
            timeout(10000), // 10 segundos de timeout
            catchError((error) => {
              if (this.dataInitRetryCount < this.maxRetries) {
                this.dataInitRetryCount++;
                console.warn(
                  `Reintento ${this.dataInitRetryCount}/${this.maxRetries} para cargar datos: ${error.message}`
                );
                return throwError(
                  () => new Error('Tiempo de espera agotado, reintentando...')
                );
              }
              return throwError(() => error);
            })
          )
      );

      if (response.data != undefined) {
        console.log('Datos cargados exitosamente:', response);
        this.pago = response.data;
        this.detalles = response.detalles;

        this.detalles.forEach((element: any) => {
          element.aniosup = new Date(
            new Date(element.idpension.anio_lectivo).setFullYear(
              new Date(element.idpension.anio_lectivo).getFullYear() + 1
            )
          ).getFullYear();
        });

        await this.detalle_data();
        //await this.armado2();

        this.detalles.forEach((element: any) => {
          element.descripcion = this.buildDescripcion(element);
        });

        await this.manejarDocumentoContifico();
      } else {
        this.pago = undefined;
        if (this.dataInitRetryCount < this.maxRetries) {
          this.dataInitRetryCount++;
          console.warn(
            `Datos no disponibles, reintentando (${this.dataInitRetryCount}/${this.maxRetries})...`
          );
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
          return this.attemptInitData();
        } else {
          console.error(
            'No se pudo cargar los datos después de varios intentos'
          );
        }
      }
    } catch (error) {
      console.error('Error al obtener los detalles:', error);

      if (this.dataInitRetryCount < this.maxRetries) {
        this.dataInitRetryCount++;
        console.warn(
          `Reintentando cargar datos (${this.dataInitRetryCount}/${this.maxRetries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.attemptInitData();
      } else {
        this.showErrorToast(
          `No se pudieron cargar los datos después de ${
            this.maxRetries + 1
          } intentos. Por favor, refresque la página.`
        );
      }
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
          /*setTimeout(() => {
            location.reload();
          }, 1000);*/
        });
    } else {
      iziToast.error({
        title: 'DANGER',
        position: 'topRight',
        message: this.error_constru,
      });
    }
  }
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
      //location.reload();
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
                //location.reload();

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
            // location.reload();
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

  //APARTADO PARA NUEVO PROVEEDOR
  // Función principal para armar el documento en el formato del nuevo proveedor
  async armado_Documento_nuevo_proveedor(
    pago: any,
    detalles: any[]
  ): Promise<any> {
    try {
      // Calcular subtotal y total
      const subtotal = Number(
        detalles.reduce((sum, det) => sum + det.valor, 0).toFixed(2)
      );

      // Crear el documento con el formato del nuevo proveedor
      return {
        codigoComprobante: 'FACT',
        idProveedor: 0,
        Ingreso: true,
        porcentajeDescuentoFacturacion: 0,
        valorFacturaLetras: this.numeroALetras(subtotal),
        Comprobante: {
          GeneroEmpresa: true,
          Identificacion: pago.estudiante.dni_factura,
          NumeroComprobante: 0,
          MontoPagosGeneral: 0,
          CodigoTipoPago: '0',
          SaldoComprobante: subtotal,
          CodigoBanco: '0',
          NumeroCuenta: '0',
          NumeroDocumento: '0',
          Observaciones: '',
          NumeroCuotas: 1,
          ValorXCuota: subtotal,
          DiaPago: 1,
          FechaVcto: this.formatearFechaYYYYMMDD(new Date()),
          PieSubtotal: subtotal,
          PieDescuento: 0,
          PieValorDescuento: 0,
          PieBaseIva0: subtotal,
          PieBaseIVA: 0,
          PieIVA: 0,
          PieTotalVenta: subtotal,
          FechaAfiliacion: this.formatearFechaYYYYMMDD(new Date()),
          FechaVigencia: this.formatearFechaYYYYMMDD(new Date()),
          IdEmpresaCorporativa: 0,
          ValorInscripcionOriginal: 0,
          ValorInscripcion: 0,
          MontoLetras: this.numeroALetras(subtotal),
          Fecha: this.formatearFechaYYYYMMDD(new Date()),
          FormaCobroDoc: '0',
          RegistraCheque: false,
          IncluyeRetencion: 'N',
          NombreCliente: pago.estudiante.nombres_factura,
          DireccionCliente: pago.estudiante.direccion,
          TelefonoCliente: pago.estudiante.telefono,
          MailCliente: pago.estudiante.email_padre,
          IdComprobanteRef: 0,
          Observacion: `Estudiante: ${pago.estudiante.nombres} ${pago.estudiante.apellidos}`,
          LiberaGuias: 'N',
          IdCentralCostos: 0,
          tipoComprobante: 'FACT',
          Referencia1: '0',
          Referencia2: '0',
          CodigoCuentaCajaBanco: '0',
          Operacion: '',
          IdComprobante: 0,
          CodigoAsiento: 0,
          PorcentajeDescuentoFacturacion: 0,
          IdReferencia: 0,
          FechaCheque: this.formatearFechaYYYYMMDD(new Date()),
          AplicaCredito: 'N',
          IdCuota: 0,
          DocumentoConDiferido: 'N',
          IdCentralCostoOrigen: 0,
          IdCentralCostoDestino: 0,
          CodigoVendedor: '0',
          MotivoTraslado: '0',
          IdProveedor: 0,
          Referencia3: '',
          Moneda: 'USD',
          Plazo: 30,
          IdPais: 0,
          TipoSolicitud: 'N',
          SecuencialPagoMasivo: 0,
          CodigoProcesoInicio: '0',
          CodigoProcesoActual: '0',
          IdCentralCostosMPrima: 0,
          Responsable: pago.encargado
            ? `${pago.encargado.nombres} ${pago.encargado.apellidos}`
            : 'RESPONSABLE',
          IdGeneral: 0,
        },
        ComprobanteProducto: this.mapearDetallesProductos(detalles),
        PagosCXC: this.mapearPagos(pago, detalles),
        Sesion: {
          IdInstitucion: 311505,
          IdOficina: 335006,
          CodigoEmpresa: '0891792143001',
          IdPerfilUsuario: 0,
          Identificacion: '0891792143001',
          CodigoPerfil: '0',
          IdUsuario: 3271,
          FechaSistema: this.formatearFechaYYYYMMDD(new Date()),
          NombreCompletoUsuario: '',
          NombreCortoUsuario: '',
          IdTransaccion: 0,
          IPEstacion: '0.00',
          IdEmpresaOperadora: 1655,
        },
      };
    } catch (error) {
      console.error('Error al armar documento para nuevo proveedor:', error);
      this.showErrorToast('Error al armar documento para nuevo proveedor');
      throw new Error('Error al armar documento para nuevo proveedor');
    }
  }

  // Mapear los detalles a productos
  private mapearDetallesProductos(detalles: any[]): any[] {
    return detalles.map((detalle, index) => {
      const codigoProducto =
        detalle.tipo === 0
          ? '13'
          : String(new Date(this.fecha[detalle.tipo - 1].date).getMonth() + 1);
      return {
        IdComprobante: index + 1,
        id: '0',
        newPrice: detalle.valor,
        CodigoProducto: codigoProducto,
        Nombre: this.obtenerDescripcionProducto(detalle),
        Costo: 0,
        CodigoPrecioVenta: 'FINAL',
        PrecioMasImpuestos: detalle.valor,
        PrecioDescuentoImpuesto: 0,
        PorcImpuestos: 0,
        cartCount: 1,
        PrecioSistema: detalle.valor,
        PrecioDescuento: 0,
        PrecioVenta: detalle.valor,
        Total: detalle.valor,
        PorcImpuestoIVA: 0,
        ImpuestoIVA0: true,
        ValorImpuestoIVA: 0,
        CodigoGeneral: '0',
        Parametro1: '',
        Parametro2: '',
        BaseImpuestoIVA0: detalle.valor,
        BaseImpuestoIVA: 0,
        Series: '',
        PorcDescuento: 0,
        IdCentralCostos: 0,
        UltimoPrecioCliente: 0,
        CodigoPrecio: 'FINAL',
        IDENTITYCAMPO: 0,
        UnidadFuncional: 'UN',
        UnidadVenta: 'UN',
        UnidadFraccionNo: 0,
        EsSeries: true,
        IdPuntoVentaDetalle: 0,
        NombreAlmacen: '',
        Parametro3: '',
        Parametro4: codigoProducto,
        IdComprobanteDetalleRef: 0,
        IdPuntoVenta: 2237,
        Descuento: 0,
      };
    });
  }

  // Mapear los pagos con manejo de índices
  private async mapearPagos(pago: any, detalles: any[]): Promise<any[]> {
    // Primero agrupamos los pagos por número de documento
    const pagosMap = new Map<string, any>();

    detalles.forEach((detalle) => {
      if (detalle.documento) {
        const docKey = detalle.documento.documento || 'SIN_DOCUMENTO';

        if (!pagosMap.has(docKey)) {
          pagosMap.set(docKey, {
            Identificacion: pago.estudiante.dni_factura,
            IdSaldosComprobante: '0',
            Fecha: this.formatearFechaYYYYMMDD(
              new Date(detalle.documento.fecha || new Date())
            ),
            MontoPagosGeneral: detalle.valor.toString(),
            CodigoTipoPago:
              detalle.documento.cuenta === 'Efectivo'
                ? 'EFECTIVO'
                : 'TRANSFERENCIA',
            CodigoBanco: '0',
            NumeroCuenta: '0',
            NumeroDocumento: docKey,
            Observaciones: `PAGO ${this.obtenerDescripcionCortaProducto(
              detalle
            )}`,
            MontoLetras: '',
            RegistraCheque: false,
            IncluyeRetencion: 'N',
            CodigoCuentaCajaBanco: '0',
            IdReferencia: '0',
            IdSecuencial: '0',
            IdCabeceraAsiento: '0',
            FechaCheque: '1900-00-00',
            IdCuota: '0',
            DocumentoConDiferido: 'N',
            IDENTITYCAMPO: '0',
            SecuencialPagoMasivo: '0',
            ModalidadPago: '0',
            IdCabeceraPagoLote: '0',
            // Añadimos estos campos para el control de índices
            id: detalle.documento._id,
            valor_origen: detalle.documento.valor_origen || 0,
          });
        } else {
          // Si ya existe el pago, actualizar el monto
          const pagoExistente = pagosMap.get(docKey);
          pagoExistente.MontoPagosGeneral = (
            parseFloat(pagoExistente.MontoPagosGeneral) + detalle.valor
          ).toFixed(2);
        }
      }
    });

    // Procesamos cada pago para verificar discrepancias y aplicar índices
    const pagosArray = await Promise.all(
      Array.from(pagosMap.values()).map(async (pago) => {
        // Comprobar si hay discrepancia entre valor_origen y monto acumulado
        if (
          pago.valor_origen > 0 &&
          parseFloat(pago.MontoPagosGeneral) !== pago.valor_origen
        ) {
          // Obtener cuántas veces se ha asignado este documento
          const asignaciones = await this.obtener(pago.id);

          // Siempre añadir un índice cuando hay discrepancia
          // Si hay asignaciones previas, usar ese número, si no, comenzar con 1
          const indice = asignaciones > 0 ? asignaciones : 1;
          pago.NumeroDocumento = `${pago.NumeroDocumento}-${indice + 1}`;
        }

        // Eliminar propiedades temporales antes de devolver
        const { id, valor_origen, ...pagoFinal } = pago;
        return pagoFinal;
      })
    );

    return pagosArray;
  }

  // Obtener descripción del producto
  private obtenerDescripcionProducto(detalle: any): string {
    if (detalle.tipo === 0) {
      return 'MATRICULA';
    } else if (detalle.tipo > 0 && detalle.tipo <= 12) {
      const mesesNombres = [
        'ENERO',
        'FEBRERO',
        'MARZO',
        'ABRIL',
        'MAYO',
        'JUNIO',
        'JULIO',
        'AGOSTO',
        'SEPTIEMBRE',
        'OCTUBRE',
        'NOVIEMBRE',
        'DICIEMBRE',
      ];
      return `PENSION ${
        mesesNombres[new Date(this.fecha[detalle.tipo - 1].date).getMonth()]
      }`;
    } else {
      return detalle.descripcion || 'OTRO PAGO';
    }
  }

  // Obtener descripción corta
  private obtenerDescripcionCortaProducto(detalle: any): string {
    if (detalle.tipo === 0) {
      return 'MATRICULA';
    } else if (detalle.tipo > 0 && detalle.tipo <= 12) {
      const mesesNombres = [
        'ENERO',
        'FEBRERO',
        'MARZO',
        'ABRIL',
        'MAYO',
        'JUNIO',
        'JULIO',
        'AGOSTO',
        'SEPTIEMBRE',
        'OCTUBRE',
        'NOVIEMBRE',
        'DICIEMBRE',
      ];
      return mesesNombres[detalle.tipo - 1];
    } else {
      return 'OTRO';
    }
  }

  // Formatear fecha en formato YYYY-MM-DD
  private formatearFechaYYYYMMDD(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Convertir número a letras (implementación básica)
  private numeroALetras(numero: number): string {
    const partes = numero.toFixed(2).split('.');
    let entero = parseInt(partes[0]);
    const decimal = parseInt(partes[1]);

    // Esta es una versión simplificada - en producción usa una librería completa
    const unidades = [
      '',
      'UNO',
      'DOS',
      'TRES',
      'CUATRO',
      'CINCO',
      'SEIS',
      'SIETE',
      'OCHO',
      'NUEVE',
    ];
    const especiales = [
      'DIEZ',
      'ONCE',
      'DOCE',
      'TRECE',
      'CATORCE',
      'QUINCE',
      'DIECISEIS',
      'DIECISIETE',
      'DIECIOCHO',
      'DIECINUEVE',
    ];
    const decenas = [
      '',
      'DIEZ',
      'VEINTE',
      'TREINTA',
      'CUARENTA',
      'CINCUENTA',
      'SESENTA',
      'SETENTA',
      'OCHENTA',
      'NOVENTA',
    ];
    const centenas = [
      '',
      'CIENTO',
      'DOSCIENTOS',
      'TRESCIENTOS',
      'CUATROCIENTOS',
      'QUINIENTOS',
      'SEISCIENTOS',
      'SETECIENTOS',
      'OCHOCIENTOS',
      'NOVECIENTOS',
    ];

    let resultado = '';

    if (entero === 0) {
      resultado = 'CERO';
    } else {
      // Manejar centenas
      if (entero >= 100) {
        if (entero === 100) resultado = 'CIEN';
        else resultado = centenas[Math.floor(entero / 100)];
        entero %= 100;
        if (entero > 0) resultado += ' ';
      }

      // Manejar decenas y unidades
      if (entero >= 10 && entero <= 19) {
        resultado += especiales[entero - 10];
      } else {
        if (entero >= 20) {
          resultado += decenas[Math.floor(entero / 10)];
          entero %= 10;
          if (entero > 0) resultado += ' Y ';
        }

        if (entero > 0) {
          resultado += unidades[entero];
        }
      }
    }

    // Agregar decimales
    resultado += ` COMA ${decimal < 10 ? 'CERO' : ''} ${decimal}`;

    return resultado;
  }

  // Función para crear documento con el nuevo proveedor
  async crear_documento_nuevo_proveedor(documento: any) {
    this.loading.creacion = true;
    this.mensajes.creacion = 'Creando documento en el nuevo sistema...';

    this._transactionService.createDocumentNuevoProveedor(documento).subscribe({
      next: async (response) => {
        if (response) {
          console.log(
            'Documento creado con éxito en nuevo proveedor',
            response,
            response.IdComprobante
          );
          this.mensajes.creacion = 'Documento creado exitosamente';
          this.showSuccessToast('Documento creado con éxito');
          const idComprobante = response.IdComprobante;
          if (typeof idComprobante !== 'number') {
            console.error(
              'IdComprobante no es un número válido:',
              idComprobante
            );
          }

          this._adminService
            .actualizar_pago_id_contifico(
              {
                id: this.pago._id,
                id_contifico: idComprobante.toString(),
              },
              this.token
            )
            .subscribe({
              next: (respuesta) => {
                console.log('Respuesta de actualización:', respuesta);
                // aquí puedes mostrar un toast u otra acción
              },
              error: (err) => {
                console.error('Error al actualizar id_contifico:', err);
                // puedes mostrar un mensaje de error aquí también
              },
            });

          setTimeout(() => {
            // location.reload();
          }, 2500);
        } else {
          this.mensajes.creacion =
            'Error al crear el documento' + response.Operation.OperationMessage;
          this.showErrorToast(
            'Error al crear el documento. Por favor, inténtelo nuevamente.' +
              response.Operation.OperationMessage
          );
        }
      },
      error: (error) => {
        console.error('Error en la creación del documento:', error);
        let errorMessage =
          'Ocurrió un error desconocido. Por favor, inténtelo más tarde.';

        if (error?.error?.error?.mensaje) {
          errorMessage = error.error.error.mensaje;
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        this.mensajes.creacion = errorMessage;
        this.showErrorToast(errorMessage);
      },
      complete: () => {
        this.loading.generacion = false;
        this.loading.creacion = false;
      },
    });
  }

  // Función principal para generar documento con nuevo proveedor
  async generarDocumentoNuevoProveedor() {
    this.habilitar_boton_generar = true;

    if (this.apikey && !this.pago.id_nuevo_proveedor) {
      try {
        const pre_factura = await this.armado_Documento_nuevo_proveedor(
          this.pago,
          this.detalles
        );
        console.log('Documento para nuevo proveedor:', pre_factura);

        await this.crear_documento_nuevo_proveedor(pre_factura);
      } catch (error) {
        console.error('Error al generar documento:', error);
        this.habilitar_boton_generar = true;
        this.showErrorToast(
          'Error al generar el documento. Por favor, inténtelo nuevamente.'
        );
      }
    } else {
      this.showInfoToast(
        'El documento ya fue generado anteriormente o falta configurar la API key.'
      );
    }
  }
}
