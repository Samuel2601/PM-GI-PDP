import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import { EstudianteService } from 'src/app/service/student.service';
import { Observable, of, Subject } from 'rxjs';
import { take, catchError, takeUntil, finalize, tap } from 'rxjs/operators';
import { NgForm } from '@angular/forms';

declare var $: any;
import iziToast from 'izitoast';
import { EMPTY } from 'rxjs';

// Interface definitions to improve type safety
interface Estudiante {
  _id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  nombres_factura: string;
  dni_factura: string;
  estado: string;
  f_desac?: Date;
  anio_desac?: string;
}

interface Documento {
  _id: string;
  documento: string;
  valor: number;
  contenido?: string;
  f_deposito?: Date;
  cuenta?: string;
}

interface Rubro {
  idrubro: string;
  descripcion: string;
  valor: number;
}

interface FechaPension {
  date: any;
  beca?: number;
}

@Component({
  selector: 'app-create-payments',
  templateUrl: './create-payments.component.html',
  styleUrls: ['./create-payments.component.scss'],
})
export class CreatePaymentsComponent implements OnInit, OnDestroy {
  // Component state
  public load_btn = false;
  public rol: string = '';
  public yo = 0;

  // Payment configuration
  public valores_pensiones = 0;
  public aux_valor_pension = 0;
  public num_pagos = 0;
  public num_pagado = -1;
  public meses_beca = -1;
  public valor_matricula = 0;
  public matricula_pago = -1;
  public tipo = -1;
  public tok = -1;
  public config: any = {};

  // Student data
  public estudiantes_const: Array<Estudiante> = [];
  public estudiantes: Array<Estudiante> = [];
  public filtro_estudiante = '';
  public pageEstudiante = 1;
  public pageSizeEstudiante = 10;
  public load_estudiantes = false;
  public selec_est: Estudiante = {
    _id: '',
    nombres: '',
    apellidos: '',
    dni: '',
    nombres_factura: '',
    dni_factura: '',
    estado: '',
  };

  // Document data
  public documento: Array<Documento> = [];
  public auxabono: Array<any> = [];
  public documento_const: Array<Documento> = [];
  public pageVariedad = 1;
  public pageSizeVariedad = 10;
  public load_documento = false;
  public documento_select: Documento = {
    _id: '',
    documento: '',
    valor: 0,
  };
  public documentocreate: Partial<Documento> = {};
  public filtro_documento = '';

  // Pension data
  public fecha: Array<FechaPension> = [];
  public fecha2: Array<FechaPension> = [];
  public idpension: any = 0;
  public pension: any = [];
  public idp = -1;
  public arr_rubro: Rubro[] = [];
  public arr_rubro_const: Rubro[] = [];
  public mes: any;
  public auxmes: any;
  public checkfecha: boolean = true;
  public anio_lentivo: any;
  public indexpen = -1;

  // Payment processing
  public valor: number = 1;
  public valorigualdocumento: number = 0;
  public auxvalordeposito = 0;
  public pago: any = {};
  public dpago: Array<any> = [];
  public total_pagar = 0;
  public auxtotalpago: any = 0.0;

  // Auth
  private token = localStorage.getItem('token');

  // Subscription management
  private destroy$ = new Subject<void>();

  constructor(
    private _adminService: AdminService,
    private _estudianteService: EstudianteService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize component data and configuration
   */
  private initializeComponent(): void {
    const aux = localStorage.getItem('identity');

    this._adminService
      .obtener_admin(aux, this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        if (response.data) {
          this.rol = response.data.rol;
          this.yo =
            response.data.email === 'samuel.arevalo@espoch.edu.ec' ? 1 : 0;
        } else {
          const user = JSON.parse(localStorage.getItem('user_data') || '{}');
          this.yo = user.email === 'samuel.arevalo@espoch.edu.ec' ? 1 : 0;
          this.rol = user.rol || this.rol;
        }

        this.loadConfig();
      });
  }

  /**
   * Load application configuration
   */
  private loadConfig(): void {
    this._adminService
      .obtener_config_admin(this.token)
      .pipe(
        take(1),
        catchError((error) => {
          console.error(
            'Error al obtener la configuración administrativa',
            error
          );
          this.showErrorToast('No se pudo conectar con el servidor');
          return EMPTY;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.config = response.data[0];
        this.num_pagos = this.config.numpension;
        this.valores_pensiones = parseFloat(this.config.pension.toFixed(2));
        this.aux_valor_pension = parseFloat(this.config.pension.toFixed(2));
        this.valor_matricula = parseFloat(this.config.matricula.toFixed(2));
        this.mes = this.config.anio_lectivo;
        this.auxmes = this.config.anio_lectivo;

        this.disableActionButtons();
        this.loadEstudiantes();
        this.loadDocumentos();
      });
  }

  /**
   * Load student data
   */
  loadEstudiantes(): void {
    this.load_estudiantes = true;

    this._adminService
      .listar_estudiantes_pago(this.token)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.load_estudiantes = false))
      )
      .subscribe(
        (response) => {
          if (response.data) {
            this.estudiantes = response.data;
            this.estudiantes_const = [...this.estudiantes];
          } else {
            this.showErrorToast('Ocurrió un error al cargar los estudiantes');
          }
        },
        (error) => {
          console.error('Error al cargar estudiantes:', error);
          this.showErrorToast(error);
        }
      );
  }

  /**
   * Filter students based on search term
   */
  func_filtro_estudiante(): void {
    if (this.filtro_estudiante) {
      const term = new RegExp(this.filtro_estudiante.toString().trim(), 'i');
      this.estudiantes = this.estudiantes_const.filter(
        (item) =>
          term.test(item.nombres) ||
          term.test(item.nombres + ' ' + item.apellidos) ||
          term.test(item.apellidos) ||
          term.test(item.dni)
      );
    } else {
      this.estudiantes = [...this.estudiantes_const];
    }
  }

  /**
   * Load document data
   */
  loadDocumentos(): void {
    this.load_documento = true;

    this._adminService
      .listar_documentos_admin(this.token)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.load_documento = false))
      )
      .subscribe(
        (response) => {
          if (response.data) {
            this.documento = response.data.filter(
              (element: any) => element.valor >= 0.01
            );
            this.documento_const = [...this.documento];
          } else {
            this.showErrorToast('Ocurrió algo con el servidor');
          }
        },
        (error) => {
          console.error('Error al cargar documentos:', error);
          this.showErrorToast(error);
        }
      );
  }

  /**
   * Filter documents based on search term
   */
  func_filtro_documento(): void {
    if (this.filtro_documento) {
      const term = new RegExp(this.filtro_documento.toString().trim(), 'i');
      this.documento = this.documento_const.filter((item) =>
        term.test(item.documento)
      );
    } else {
      this.documento = [...this.documento_const];
    }
  }

  /**
   * Handle student selection
   */
  select_estudiante(item: Estudiante): void {
    this.idpension = false;
    this.pago.estudiante = item._id;
    this.selec_est = item;
    // Invalidar caché al cambiar de estudiante
    this.invalidarCache();

    this._estudianteService
      .obtener_pension_estudiante_guest(item._id, this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          if (response.data && response.data.length > 0) {
            this.pension = [...response.data];

            $('#modalEstudiante').modal('hide');
            $('#input-estudiante').val(`${item.nombres} ${item.apellidos}`);

            this.enableDocumentButtons();
          } else {
            this.showErrorToast('No hay datos de pensión para este estudiante');
          }
        },
        (error) => {
          console.error(error);
          this.showErrorToast(error);
        }
      );
  }

  /**
   * Handle selection of pension year
   */
  selecct_pension(): void {
    // Invalidar caché al cambiar de pensión
    this.invalidarCache();
    if (this.idp >= 0) {
      this.arr_rubro = [];

      if (this.isPensionValid(this.idp)) {
        this.updateRubros(this.idp);
        this.updatePensionDetails(this.idp);
      } else {
        this.showErrorToast('Este estudiante no tiene más pagos por cobrar');
      }
    } else {
      this.showErrorToast('Seleccione un Año lectivo');
    }
  }

  /**
   * Check if pension is valid for payment
   */
  isPensionValid(i: number): boolean {
    // Simplified validation logic
    const pension = this.pension[i];

    // Check if there are remaining payments
    const isValid =
      pension.meses <= 10 ||
      (pension.matricula !== 1 && pension.paga_mat === 0) ||
      (pension.extrapagos === undefined &&
        pension.idanio_lectivo.extrapagos !== undefined) ||
      JSON.parse(pension.idanio_lectivo.extrapagos || '[]').length !==
        JSON.parse(pension.extrapagos || '[]').length;

    if (isValid) {
      this.setupPensionData(i);
      return true;
    } else {
      this.idpension = false;
      this.disableActionButtons();
      return false;
    }
  }

  /**
   * Set up pension data after validation
   */
  private setupPensionData(i: number): void {
    const pension = this.pension[i];

    // Initialize rubros
    this.arr_rubro_const = JSON.parse(
      pension.idanio_lectivo.extrapagos || '[]'
    );
    this.arr_rubro = JSON.parse(pension.idanio_lectivo.extrapagos || '[]');

    if (pension.extrapagos) {
      const auxrubro = JSON.parse(pension.extrapagos);

      auxrubro.forEach((item: any) => {
        this.arr_rubro = this.arr_rubro.filter(
          (element: any) => element.idrubro != item.idrubro
        );
        this.arr_rubro_const = this.arr_rubro_const.filter(
          (element: any) => element.idrubro != item.idrubro
        );
      });
    }

    // Set pension values
    this.valores_pensiones = this.aux_valor_pension;
    this.idpension = pension._id;
    this.matricula_pago = pension.matricula;
    this.num_pagado = pension.meses;
    this.tok = this.num_pagado;
    this.auxmes = pension.anio_lectivo;
    this.indexpen = i;
    this.anio_lentivo = pension.idanio_lectivo;
    this.config = pension.idanio_lectivo;

    // Load config values from pension
    this.num_pagos = pension.idanio_lectivo.numpension;
    this.valores_pensiones = parseFloat(
      pension.idanio_lectivo.pension.toFixed(2)
    );
    this.aux_valor_pension = parseFloat(
      pension.idanio_lectivo.pension.toFixed(2)
    );
    this.valor_matricula = parseFloat(
      pension.idanio_lectivo.matricula.toFixed(2)
    );
    this.mes = pension.idanio_lectivo.anio_lectivo;
    this.auxmes = pension.idanio_lectivo.anio_lectivo;

    // Apply scholarship if needed
    if (pension.condicion_beca == 'Si') {
      this.valores_pensiones = pension.val_beca;
      this.meses_beca = pension.num_mes_res;
    }

    // Initialize payment date array
    this.fecha2 = [];
    for (let j = 0; j < 10; j++) {
      const baseDate = new Date(pension.anio_lectivo);
      this.fecha2.push({
        date: new Date(baseDate.getFullYear(), baseDate.getMonth() + j, 1),
      });
    }

    // Update payment status
    this.actualizar_valor();
  }

  /**
   * Update available rubros for the selected pension
   */
  updateRubros(i: number): void {
    if (this.pension[i].idanio_lectivo.extrapagos) {
      this.arr_rubro_const = JSON.parse(
        this.pension[i].idanio_lectivo.extrapagos
      );
      this.arr_rubro = JSON.parse(this.pension[i].idanio_lectivo.extrapagos);

      if (this.pension[i].extrapagos) {
        const auxrubro = JSON.parse(this.pension[i].extrapagos);

        auxrubro.forEach((item: any) => {
          this.arr_rubro = this.arr_rubro.filter(
            (element: any) => element.idrubro != item.idrubro
          );
          this.arr_rubro_const = this.arr_rubro_const.filter(
            (element: any) => element.idrubro != item.idrubro
          );
        });
      }
    }
  }

  /**
   * Update pension details after selection
   */
  updatePensionDetails(i: number): void {
    this.valores_pensiones = this.aux_valor_pension;
    this.idpension = this.pension[i]._id;
    this.matricula_pago = this.pension[i].matricula;
    this.num_pagado = this.pension[i].meses;
    this.tok = this.num_pagado;
    this.auxmes = this.pension[i].anio_lectivo;
    this.indexpen = i;
    this.anio_lentivo = this.pension[i].idanio_lectivo;
    this.config = this.pension[i].idanio_lectivo;

    // Update config values from pension
    this.num_pagos = this.pension[i].idanio_lectivo.numpension;
    this.valores_pensiones = parseFloat(
      this.pension[i].idanio_lectivo.pension.toFixed(2)
    );
    this.aux_valor_pension = parseFloat(
      this.pension[i].idanio_lectivo.pension.toFixed(2)
    );
    this.valor_matricula = parseFloat(
      this.pension[i].idanio_lectivo.matricula.toFixed(2)
    );
    this.mes = this.pension[i].idanio_lectivo.anio_lectivo;
    this.auxmes = this.pension[i].idanio_lectivo.anio_lectivo;

    // Apply scholarship if needed
    if (this.pension[i].condicion_beca == 'Si') {
      this.valores_pensiones = this.pension[i].val_beca;
      this.meses_beca = this.pension[i].num_mes_res;
    }

    // Initialize payment date array
    this.fecha2 = [];
    for (let j = 0; j < 10; j++) {
      const baseDate = new Date(this.pension[i].anio_lectivo);
      this.fecha2.push({
        date: new Date(baseDate.getFullYear(), baseDate.getMonth() + j, 1),
      });
    }

    // Update payment status
    this.actualizar_valor();
  }

  /**
   * Update payment values and available dates
   */
  actualizar_valor(): void {
    if (!this.idpension) return;

    this.obtenerDetallesOrdenes().subscribe((response: any) => {
      console.log('Detalles', response);
      this.fecha = [];
      const becas = response?.becas || [];

      // Determine available months based on student status
      let auxmeses = 10;
      if (
        this.selec_est.f_desac &&
        this.selec_est.estado === 'Desactivado' &&
        this.selec_est.anio_desac === this.pension[this.indexpen].anio_lectivo
      ) {
        const desacDate = new Date(this.selec_est.f_desac);
        const pensionDate = new Date(this.pension[this.indexpen].anio_lectivo);

        let mes = (desacDate.getFullYear() - pensionDate.getFullYear()) * 12;
        mes -= pensionDate.getMonth();
        mes += desacDate.getMonth();

        auxmeses = mes > 10 ? 10 : mes + 1;
      }

      // Initialize date array
      const baseDate = new Date(this.pension[this.indexpen].anio_lectivo);
      const baseYear = baseDate.getFullYear();
      const baseMonth = baseDate.getMonth();

      for (let j = 0; j < auxmeses; j++) {
        const targetDate = new Date(baseYear, baseMonth + j, 1);
        this.fecha.push({
          date: targetDate,
          beca: 0,
        });
      }
      // Apply scholarship information
      if (becas && becas.length > 0) {
        becas.forEach((element: any) => {
          const matchingDate = this.fecha.find(
            (elme: any) =>
              new Date(elme.date).getMonth() ==
              new Date(element.titulo).getMonth()
          );

          if (matchingDate) {
            matchingDate.beca = 1;
          }

          const matchingDate2 = this.fecha2.find(
            (elme1) =>
              new Date(elme1.date).getMonth() ==
              new Date(element.titulo).getMonth()
          );

          if (matchingDate2) {
            matchingDate2.beca = 1;
          }
        });
      }

      // Check if current date is within school year
      console.log('Pension', this.pension[this.indexpen]);
      const fechaActual = new Date();
      const inicioAnioLectivo = new Date(
        this.pension[this.indexpen].anio_lectivo
      );
      //inicioAnioLectivo.setMonth(inicioAnioLectivo.getMonth() - 2);
      const finAnioLectivo = new Date(inicioAnioLectivo);
      finAnioLectivo.setMonth(inicioAnioLectivo.getMonth() + 10);

      this.checkfecha = fechaActual <= finAnioLectivo;
      //fechaActual >= inicioAnioLectivo &&
      /*console.log(
          'Fecha actual',
          fechaActual,
          'Inicio del año lectivo',
          inicioAnioLectivo,
          'Fin del año lectivo',
          finAnioLectivo,
          this.checkfecha
        );*/
      // Mark paid months
      if (response.abonos) {
        const data = response.abonos;

        for (const a of data) {
          if (a.abono == 0) {
            if (this.fecha[a.tipo - 1]) {
              this.fecha[a.tipo - 1].date = '';
              //this.fecha.splice(a.tipo - 1, 1);
            }
          }
        }
      }

      // Mark months selected in current session
      for (const y of this.dpago) {
        const aux = y.estado;
        const aux1 = aux.includes('Abono');

        if (!aux1 && this.fecha[y.tipo - 1]) {
          this.fecha[y.tipo - 1].date = '';
          //this.fecha.splice(y.tipo - 1, 1);
        }
      }
    });

    console.log(
      'Fechas Inicial: ',
      this.fecha,
      'Fichas de cobrar: ',
      this.fecha2
    );
  }

  /**
   * Register a new document
   */
  registro(registroForm: NgForm): void {
    if (registroForm.valid) {
      this.load_btn = true;
      this.documentocreate.valor = parseFloat(
        this.documentocreate.valor?.toString() || '0'
      );

      this._adminService
        .registro_documento_admin(this.documentocreate, this.token)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.load_btn = false))
        )
        .subscribe(
          (response) => {
            if (!response.data) {
              this.showErrorToast(response.message || 'Error en el servidor');
              return;
            }

            const auxdocumento = response.data;
            this.showSuccessToast(
              'Se registró correctamente el nuevo documento'
            );

            this.documentocreate = {};

            this.documento_select = auxdocumento;
            this.auxvalordeposito = this.documento_select.valor;
            this.loadDocumentos();

            $('#modalNuevoDocumento').modal('hide');
            $('#input-documento').val(auxdocumento.documento);

            this.enableAllButtons();
          },
          (error) => {
            this.showErrorToast(
              'Hubo un error al intentar registrar el documento'
            );
          }
        );
    } else {
      this.showErrorToast('Los datos del formulario no son válidos');
    }
  }

  /**
   * Select a document for payment
   */
  select_documento(item: Documento): void {
    this.documento_select = item;
    this.auxvalordeposito = this.documento_select.valor;

    $('#modalDocumento').modal('hide');
    $('#input-documento').val(item.documento);

    this.enableAllButtons();
  }

  /**
   * Add document to payment list
   */
  addDocumento(): void {
    this.valor = 0;
    this.valorigualdocumento = 0;

    if (!this.documento_select) {
      this.showErrorToast('Seleccione el documento');
      return;
    }

    this.tipo = parseFloat(this.tipo.toString());

    if (this.tipo === 0) {
      // Matriculation payment
      this.valor = this.valor_matricula;
      this.addDocumento2(this.valor_matricula);
    } else if (this.tipo > 0 && this.tipo <= 10) {
      // Monthly payment
      this.actualizar_valor();

      if (
        this.anio_lentivo.mescompleto &&
        this.fecha[this.tipo - 1]?.date &&
        new Date(this.fecha[this.tipo - 1]?.date).getMonth() ===
          new Date(this.anio_lentivo.mescompleto).getMonth()
      ) {
        this.valor = this.aux_valor_pension;
        this.addDocumento2(this.aux_valor_pension);
      } else if (this.fecha[this.tipo - 1]?.beca === 1) {
        this.valor = this.valores_pensiones;
        this.addDocumento2(this.valores_pensiones);
      } else {
        this.valor = this.aux_valor_pension;
        this.addDocumento2(this.aux_valor_pension);
      }
    } else {
      // Extra payment (rubro)
      this.updateDocumentValues();

      const rubroEncontrado = this.arr_rubro.find(
        (element: any) => element.idrubro === this.tipo
      );

      if (rubroEncontrado) {
        this.valor = rubroEncontrado.valor;
        this.addDocumento2(rubroEncontrado.valor);
      } else {
        this.showWarningToast('Error, no seleccionó un valor');
      }
    }
  }

  /**
   * Update document values based on current selections
   */
  updateDocumentValues(): void {
    this.valorigualdocumento = 0;

    this.dpago.forEach((element: any) => {
      if (
        this.documento_select &&
        this.documento_select.documento === element.titulo_documento
      ) {
        this.valorigualdocumento += parseFloat(element.valor.toString());
      }
    });
  }

  /**
   * Add document to payment with specified amount
   */
  addDocumento2(debe: number): void {
    console.log(
      'Debe:',
      debe,
      'Valor:',
      this.valorigualdocumento,
      'Tipo:',
      this.tipo
    );
    let ab = 0;
    let est = 'NaN';

    if (debe < 0.001) {
      this.showErrorToast('Valor no válido');
      return;
    }

    this.updateDocumentValues();

    // Check if document has enough remaining balance
    const documentoRestante = parseFloat(
      (
        parseFloat(this.documento_select.valor.toString()) -
        this.valorigualdocumento
      ).toFixed(2)
    );

    if (documentoRestante <= 0) {
      this.showWarningToast('Sin fondos');
      return;
    }

    this.obtenerDetallesOrdenes().subscribe((response) => {
      // Determine payment status
      console.log(this.checkfecha);
      if (this.checkfecha) {
        if (this.tipo === 0) {
          est = this.num_pagos > 1 ? 'Pago atrasado' : 'Pago a tiempo';
        } else if (this.tipo >= 1 && this.tipo <= 10) {
          if (this.tipo < this.num_pagos) {
            est = 'Pago atrasado';
          } else if (this.tipo === this.num_pagos) {
            est = 'Pago a tiempo';
          } else {
            est = 'Pago anticipado';
          }
        } else {
          est = '';
        }
      } else {
        est = 'Pago atrasado';
      }

      // Calculate already paid amount for this payment type
      this.auxabono = response.abonos || [];
      let auxb = 0;

      for (const x of this.auxabono) {
        if (x.tipo == this.tipo) {
          auxb += x.valor;
        }
      }

      // Calculate amount already added to current payment
      let auxc = 0;
      for (const y of this.dpago) {
        if (y.tipo == this.tipo) {
          auxc += y.valor;
        }
      }

      // Check if payment can be added
      if (documentoRestante > 0 && debe - (auxb + auxc) > 0) {
        // Calculate payment amount
        if (debe - (auxb + auxc) <= documentoRestante) {
          this.valor = parseFloat((debe - (auxb + auxc)).toFixed(2));

          if (this.valor != debe) {
            this.showInfoToast('Tenía un abono dado');
          }
        } else {
          this.showInfoToast('Se da como abono');
          est = est + ' Abono';
          ab = 1;
          this.valor = documentoRestante;
          this.disableActionButtons();
        }

        $('#btnBuscarEstudiante').attr('disabled', true);
        this.valor = parseFloat(this.valor.toFixed(2));
      } else {
        this.valor = 0;
      }

      // Get rubro description if applicable
      let descripcion = '';
      if (this.tipo >= 11) {
        const rubro = this.arr_rubro.find(
          (element: any) => element.idrubro == this.tipo
        ) || { descripcion: '', idrubro: '' };

        if (rubro.descripcion && rubro.idrubro) {
          descripcion = rubro.descripcion;
          this.arr_rubro = this.arr_rubro.filter(
            (element) => element.idrubro !== rubro.idrubro
          );
        }
      }

      // Add payment to list if valid
      console.log('Valor', this.valor);
      if (this.valor > 0) {
        this.dpago.push({
          idpension: this.idpension,
          documento: this.documento_select._id,
          titulo_documento: this.documento_select.documento,
          descripcion: descripcion,
          valor: this.valor,
          tipo: this.tipo,
          estado: est,
          abono: ab,
        });

        this.actualizar_valor();
        this.valorigualdocumento += this.valor;

        // Update scholarship months if applicable
        if (this.meses_beca > 0 && this.tipo != 0) {
          this.meses_beca = this.meses_beca - 1;
        } else if (this.tipo == 0) {
          this.matricula_pago = 1;
        }

        // Update total amount
        this.total_pagar =
          parseFloat(this.valor.toString()) +
          parseFloat(this.auxtotalpago.toString());
        this.auxtotalpago = this.total_pagar.toFixed(2);

        // Update paid months
        if (this.tipo != 0) {
          this.num_pagado = this.num_pagado + 1;
        }

        // Reset payment type
        this.tipo = -1;
      } else {
        this.showWarningToast('Error inválido');
      }
    });
  }

  /**
   * Remove a payment from the list
   */
  quitar(id: number, valor: number, tipo: number): void {
    this.dpago.splice(id, 1);

    // Restore corresponding pension or rubro status
    if (tipo == 0) {
      this.matricula_pago = 0;
    } else if (tipo > 0 && tipo <= 10) {
      if (this.meses_beca !== -1) {
        this.meses_beca = this.meses_beca + 1;
      }
      this.num_pagado = this.num_pagado - 1;
    } else {
      const aux = this.arr_rubro_const.find(
        (element: any) => element.idrubro == tipo
      );
      if (aux) {
        this.arr_rubro.push(aux);
      }
    }

    this.actualizar_valor();
    this.enableAllButtons();

    if (this.dpago.length === 0) {
      $('#btnBuscarEstudiante').attr('disabled', false);
    }

    this.updateDocumentValues();

    // Update total amount
    this.total_pagar =
      parseFloat(this.auxtotalpago.toString()) - parseFloat(valor.toString());
    this.auxtotalpago = this.total_pagar.toFixed(2);
  }

  /**
   * Complete the payment registration
   */
  registrar_pago(): void {
    // Agregar esta línea antes de finalizar el método para invalidar la caché
    // después de registrar un pago exitosamente
    this.invalidarCache();
    const aux = localStorage.getItem('identity');

    this._adminService
      .obtener_admin(aux, this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          const info = response.data;

          if (
            !info ||
            info.estado == 'Fuera' ||
            info.estado == 'deshabilitado'
          ) {
            this.showErrorToast('No puedes crear pagos');
            return;
          }

          // Validate payment data
          if (!this.pago.estudiante) {
            this.showErrorToast('Debe seleccionar al estudiante');
            return;
          }

          if (this.dpago.length === 0) {
            this.showErrorToast('Debe agregar al menos un documento al pago');
            return;
          }

          // Set payment data
          this.pago.encargado = info;
          this.pago.total_pagar = this.total_pagar;
          this.pago.transaccion = 'PAGOMANUAL';
          this.pago.detalles = this.dpago;
          this.pago.nombres_factura = this.selec_est.nombres_factura;
          this.pago.dni_factura = this.selec_est.dni_factura;
          this.pago.tipo_producto = 'S';
          this.pago.tipo_tarifa = 0;
          this.pago.config = this.config;

          this.load_btn = true;

          // Submit payment
          this._adminService
            .registro_compra_manual_estudiante(this.pago, this.token)
            .pipe(
              takeUntil(this.destroy$),
              finalize(() => (this.load_btn = false))
            )
            .subscribe(
              (response) => {
                if (response && response.pago && response.pago._id) {
                  // Open receipt page in new tab and refresh current page
                  const nuevaPaginaURL = '/pagos/' + response.pago._id;
                  window.open(nuevaPaginaURL, '_blank');
                  location.reload();
                } else {
                  this.showErrorToast('Error al procesar el pago');
                }
              },
              (error) => {
                console.error(error);
                this.showErrorToast(
                  'Error al registrar el pago. Por favor, intenta nuevamente.'
                );
              }
            );
        },
        (error) => {
          console.error(error);
          this.showErrorToast('Error al verificar permisos');
        }
      );
  }

  // Utility methods for button management
  private disableActionButtons(): void {
    $('#btnbuscardocumento, #btnnuevodocumento, #btnAgregar').attr(
      'disabled',
      true
    );
  }

  private enableDocumentButtons(): void {
    $('#btnbuscardocumento, #btnnuevodocumento').attr('disabled', false);
  }

  private enableAllButtons(): void {
    $('#btnbuscardocumento, #btnnuevodocumento, #btnAgregar').attr(
      'disabled',
      false
    );
  }

  // Toast notification utilities
  private showErrorToast(message: string): void {
    iziToast.error({
      title: 'ERROR',
      position: 'topRight',
      message: message,
    });
  }

  private showSuccessToast(message: string): void {
    iziToast.success({
      title: 'ÉXITO',
      position: 'topRight',
      message: message,
    });
  }

  private showInfoToast(message: string): void {
    iziToast.info({
      title: 'INFO',
      position: 'topRight',
      message: message,
    });
  }

  private showWarningToast(message: string): void {
    iziToast.warning({
      title: 'ADVERTENCIA',
      position: 'topRight',
      message: message,
    });
  }

  /**
   * Almacenamiento de datos de la última respuesta del servicio para evitar llamadas duplicadas
   */
  private ordenesCache: {
    response: any;
    idpension: string; // Añadido para guardar el ID de pensión asociado a la caché
    timestamp: number;
  } | null = null;

  /**
   * Tiempo máximo de vigencia de la caché en milisegundos (5 segundos)
   */
  private readonly CACHE_TTL = 5000;

  /**
   * Obtiene los detalles de órdenes y abonos del estudiante
   * Utiliza caché para evitar llamadas redundantes en un período corto de tiempo
   */
  private obtenerDetallesOrdenes(): Observable<any> {
    // Si no hay ID de pensión, retornar un observable vacío
    if (!this.idpension) {
      return EMPTY;
    }

    const ahora = Date.now();

    // Verificar si hay datos en caché válidos:
    // 1. La caché existe
    // 2. No ha expirado
    // 3. El ID de pensión coincide con el actual
    // 4. La respuesta contiene datos
    if (
      this.ordenesCache &&
      ahora - this.ordenesCache.timestamp < this.CACHE_TTL &&
      this.ordenesCache.idpension === this.idpension &&
      this.ordenesCache.response &&
      // Verificar que la respuesta tiene la estructura esperada
      (Array.isArray(this.ordenesCache.response.abonos) ||
        Array.isArray(this.ordenesCache.response.becas))
    ) {
      // Verificación adicional: si hay abonos, comprobar que corresponden a esta pensión
      if (
        this.ordenesCache.response.abonos &&
        this.ordenesCache.response.abonos.length > 0
      ) {
        // Verificar el primer abono para confirmar que corresponde a esta pensión
        const primerAbono = this.ordenesCache.response.abonos[0];
        if (primerAbono && primerAbono.idpension === this.idpension) {
          // La caché es válida y corresponde a la pensión actual
          return of(this.ordenesCache.response);
        }
      } else {
        // Si no hay abonos pero la caché está dentro del TTL y el ID coincide, usarla
        return of(this.ordenesCache.response);
      }
    }

    // Registrar en consola que se hará una llamada al API
    console.log(
      'Realizando llamada al API para obtener detalles de órdenes:',
      this.idpension
    );

    // Si no hay caché válida o no pasa las validaciones, hacer la llamada al servicio
    return this._adminService
      .obtener_detalles_ordenes_estudiante_abono(this.idpension, this.token)
      .pipe(
        takeUntil(this.destroy$),
        tap((response) => {
          // Verificar que la respuesta es válida antes de almacenarla en caché
          if (
            response &&
            (Array.isArray(response.abonos) || Array.isArray(response.becas))
          ) {
            // Almacenar respuesta en caché con timestamp e ID de pensión
            this.ordenesCache = {
              response,
              idpension: this.idpension, // Guardar el ID para validación futura
              timestamp: Date.now(),
            };
            console.log(
              'Datos almacenados en caché para pensión:',
              this.idpension
            );
          } else {
            console.warn(
              'Respuesta no válida del API, no se almacenará en caché'
            );
            this.ordenesCache = null; // Invalidar caché si la respuesta no es válida
          }
        }),
        catchError((error) => {
          console.error('Error al obtener detalles de órdenes:', error);
          this.ordenesCache = null; // Invalidar caché en caso de error

          // Mostrar mensaje de error al usuario
          this.showErrorToast(
            'Error al cargar los datos de pagos. Por favor, intente nuevamente.'
          );

          // Retornar un objeto vacío para evitar errores en la aplicación
          return of({ abonos: [], becas: [] });
        })
      );
  }

  /**
   * Invalidar caché cuando cambie la pensión o el estudiante
   */
  invalidarCache(): void {
    this.ordenesCache = null;
    console.log('Caché de órdenes invalidada');
  }
}
