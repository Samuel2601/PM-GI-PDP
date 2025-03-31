import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/service/admin.service';
import { ConfigService } from 'src/app/service/config.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import iziToast from 'izitoast';
import { map } from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-school-year-config',
  templateUrl: './school-year-config.component.html',
  styleUrls: ['./school-year-config.component.scss'],
})
export class SchoolYearConfigComponent implements OnInit {
  public config: any = {};
  public config_const: any = [];
  public load_btn = true;
  public token = localStorage.getItem('token');
  public load_data = true;
  public rol = '';
  public auxdate = '';
  public auxmescompleto: string = 'ninguno';

  public bol: any = undefined;
  public arr_meses: Array<any> = [];
  public tip_conf = 1;
  public institucion: any = [];
  public rubro = {
    idrubro: '',
    descripcion: '',
    valor: '',
  };
  public arr_rubro: Array<any> = [];
  public arr_rubro_const: Array<any> = [];

  public uniqueArray = true;

  configForm: FormGroup;

  constructor(
    private _adminService: AdminService,
    private _configService: ConfigService,
    private fb: FormBuilder
  ) {
    // Inicializar el formulario con validaciones si es necesario
    this.configForm = this.fb.group({
      tipo: true,
      cursos: this.fb.array([]),
      modulosUnicos: this.fb.array([]),
      conexionSistemas: this.fb.group({
        url: ['', Validators.required],
        // Otros campos de conexionSistemasSchema según sea necesario
      }),
      configSMTP: this.fb.group({
        correo: ['', [Validators.required, Validators.email]],
        token: ['', Validators.required],
        // Otros campos de configSMTPSchema según sea necesario
      }),
      configEncabezadoPie: this.fb.group({
        encabezado: ['', Validators.required],
        piePagina: [''],
        // Otros campos de configEncabezadoPieSchema según sea necesario
      }),
    });
  }
  modalidadCursosParalelos: boolean = false;
  modalidadModulos: boolean = true; // Puedes establecer el valor inicial según tus necesidades
  activarModalidadCursosParalelos() {
    this.modalidadCursosParalelos = true;
    this.modalidadModulos = false;
    this.configForm.get('tipo')?.setValue(true);
  }

  activarModalidadModulos() {
    this.modalidadCursosParalelos = false;
    this.modalidadModulos = true;
    this.configForm.get('tipo')?.setValue(false);
  }

  ngOnInit(): void {
    let aux = this._configService.getConfig() as {
      imagen: string;
      identity: string;
      token: string;
      rol: string;
    };
    this.rol = aux.rol || '';
    this.init_data();
  }
  init_data() {
    this.load_data = true;
    this.select_nav(1);
  }
  select_nav(val: any) {
    if (val != this.tip_conf) {
      this.tip_conf = val;
      if (this.tip_conf == 1) {
        this.call_lectivo();
      } else if (this.tip_conf == 2) {
        this.call_insti();
      } else {
        this.call_config();
      }
    } else {
      this.call_lectivo();
    }
  }
  guardarCambios() {
    // Lógica para guardar los cambios, por ejemplo, enviar a un servicio o API
    console.log('Cambios guardados:', this.institucion);
    // Puedes implementar aquí la lógica de llamada a tu servicio o API para guardar los cambios
  }
  call_lectivo() {
    console.log('Llamado config');
    this.load_btn = true;
    this.load_data = true;
    this._adminService
      .obtener_config_admin(this.token)
      .subscribe((response) => {
        console.log(response);
        if (response.message) {
          this.bol = response.message;
          this.load_btn = false;
          this.load_data = false;
        } else {
          // Ordenar los datos por año lectivo (del más reciente al más antiguo)
          this.config_const = response.data.sort((a: any, b: any) => {
            const fechaA = new Date(a.anio_lectivo);
            const fechaB = new Date(b.anio_lectivo);
            return fechaB.getTime() - fechaA.getTime(); // Orden descendente (más reciente primero)
          });

          console.log('Datos ordenados por año lectivo:', this.config_const);

          this.select_config(0);
          if (this.config) {
            this._adminService
              .actualizar_config_admin(this.config, this.token)
              .subscribe(
                (response) => {
                  iziToast.success({
                    title: 'ÉXITOSO',
                    position: 'topRight',
                    message:
                      'Se encuentra actualiza correctamente las configuraciones.',
                  });
                },
                (error) => {
                  this.load_btn = false;
                }
              );
          }
        }

        if (this.config.numpension >= 9) {
          this.load_btn = false;
        }
      });
  }
  call_config() {}
  call_insti() {
    this._adminService.obtener_info_admin(this.token).subscribe((response) => {
      console.log(response);
      this.institucion = response.data;
    });
  }
  index_selecte = -1;
  select_config(val: any) {
    this.index_selecte = val;

    // Crear una copia REAL del objeto, no una referencia
    this.config = JSON.parse(
      JSON.stringify(this.config_const[this.index_selecte])
    );

    if (this.config.extrapagos) {
      // También crear copias reales para estos arrays
      this.arr_rubro_const = JSON.parse(this.config.extrapagos);
      this.arr_rubro = JSON.parse(this.config.extrapagos);
    } else {
      this.arr_rubro_const = [];
      this.arr_rubro = [];
    }

    this.auxdate = this.config.anio_lectivo;
    this.auxmescompleto = this.config.mescompleto;
    this.config.mescompleto = '';
    this.load_data = false;
    this.fechas(1);
  }

  cerrar_add_rubro() {
    $('#modalNuevoRubro').modal('hide');
  }
  fechas(id: any) {
    this.arr_meses = [];
    for (var i = 0; i < 10; i++) {
      this.arr_meses.push({
        date: new Date(this.config.anio_lectivo).setMonth(
          new Date(this.config.anio_lectivo).getMonth() + i
        ),
      });
    }
  }
  addarr_rubro(addrubroForm: any) {
    if (addrubroForm.valid) {
      if (
        this.arr_rubro.find(
          (element) => element.idrubro == this.rubro.idrubro
        ) == undefined
      ) {
        this.arr_rubro.push(this.rubro);
        this.uniqueArray =
          JSON.stringify(this.arr_rubro) ===
          JSON.stringify(this.arr_rubro_const);

        this.rubro = { idrubro: '', descripcion: '', valor: '' };
        $('#modalNuevoRubro').modal('hide');
      } else {
        iziToast.error({
          title: 'DANGER',
          position: 'topRight',
          message: 'Ya existe ese código de rubro',
        });
      }
    }
  }
  eliminarrubro(val: any) {
    this._adminService
      .obtener_detalles_ordenes_rubro(this.arr_rubro[val].idrubro, this.token)
      .subscribe((response) => {
        console.log('Eliminando rubro:', response);
        // Reemplaza la línea actual con este código:
        const rubro = response.pagos.filter(
          (pago: any) =>
            pago.idpension.idanio_lectivo ===
            this.config_const[this.index_selecte]._id
        );
        console.log('Rubro eliminado:', rubro);
        if (rubro.length == 0) {
          this.arr_rubro.splice(val, 1);
          this.uniqueArray =
            JSON.stringify(this.arr_rubro) ===
            JSON.stringify(this.arr_rubro_const);
        } else {
          iziToast.error({
            title: 'DANGER',
            position: 'topRight',
            message: 'Hay pagos bajo este rubro',
          });
        }
      });
  }

  addrubro() {
    if (this.arr_rubro.length >= 0) {
      this.config = this.config_const[this.index_selecte];
      this.config.extrapagos = JSON.stringify(this.arr_rubro);
      this._adminService
        .actualizar_config_admin(this.config, this.token)
        .subscribe(
          (response) => {
            $('#modalRubro').modal('hide');
            iziToast.success({
              title: 'ÉXITOSO',
              position: 'topRight',
              message:
                'Se encuentra actualiza correctamente las configuraciones.',
            });
            location.reload();
          },
          (error) => {
            this.load_btn = false;
          }
        );
    }
  }
  load_enviar = true;
  // Método actualizar corregido
  actualizar(actualizarForm: any) {
    // Log para depuración
    console.log('Config original:', this.config_const[0]);
    console.log('Config actual:', this.config);

    this.load_enviar = false;
    if (actualizarForm.valid) {
      this.load_btn = true;

      // Crear una copia del objeto para no modificar el original directamente
      let configToUpdate = JSON.parse(JSON.stringify(this.config));

      // Verificar si es un año nuevo comparando con el último año registrado
      let esNuevoAnio = false;
      let ultimoAnioRegistrado = null;

      if (this.config_const.length > 0) {
        // Encuentra el último año registrado (asumiendo que el arreglo está ordenado)
        ultimoAnioRegistrado = new Date(
          this.config_const[0].anio_lectivo
        ).getFullYear();
        const anioActual = new Date(configToUpdate.anio_lectivo).getFullYear();

        // Es un nuevo año si es posterior al último registrado
        esNuevoAnio = anioActual > ultimoAnioRegistrado;
      } else {
        // Si no hay años registrados, este sería el primero
        esNuevoAnio = true;
      }

      // Si es un nuevo año, configurar el campo nuevo = 1
      if (esNuevoAnio) {
        configToUpdate.nuevo = 1;
        console.log('Enviando como NUEVO año lectivo:', configToUpdate);
      } else {
        // Si no es nuevo, limpiar los campos que no deben actualizarse
        delete configToUpdate.createdAt;
        delete configToUpdate.extrapagos;
        delete configToUpdate.facturacion;
        delete configToUpdate._id;
        delete configToUpdate.numpension;
        console.log(
          'Enviando como actualización de año existente:',
          configToUpdate
        );
      }

      // Descomentar para enviar la solicitud

      this._adminService
        .actualizar_config_admin(configToUpdate, this.token)
        .subscribe(
          (response) => {
            if (response.message == undefined) {
              iziToast.success({
                title: 'ÉXITOSO',
                position: 'topRight',
                message: esNuevoAnio
                  ? 'Se ha creado correctamente el nuevo año lectivo.'
                  : 'Se han actualizado correctamente las configuraciones.',
              });
            } else {
              iziToast.error({
                title: 'PELIGRO',
                position: 'topRight',
                message: response.message,
              });
            }

            this.load_btn = false;
            $('#modalConfirmar').modal('hide');
            this.load_enviar = true;

            // Recargar los datos para reflejar los cambios
            location.reload();
          },
          (error) => {
            console.error('Error al actualizar/crear año lectivo:', error);
            iziToast.error({
              title: 'ERROR',
              position: 'topRight',
              message: 'Ocurrió un error al procesar la solicitud.',
            });
            this.load_btn = false;
            this.load_enviar = true;
          }
        );

      // Log final para verificar los cambios
      console.log('Config final a enviar:', JSON.stringify(this.config));
    } else {
      iziToast.error({
        title: 'ERROR',
        position: 'topRight',
        message: 'Los datos del formulario no son válidos',
        message: 'Los datos del formulario no son válidos',
      });
      this.load_enviar = true;
    }
  }

  get cursos(): FormArray {
    return this.configForm.get('cursos') as FormArray;
  }
  get modulosUnicos(): FormArray {
    return this.configForm.get('modulosUnicos') as FormArray;
  }

  paralelosArray(cursoIndex: number): FormArray {
    const curso = this.cursos.controls[cursoIndex] as FormGroup;
    return curso.get('paralelos') as FormArray;
  }

  getParalelosArray(curso: AbstractControl): FormArray {
    return curso.get('paralelos') as FormArray;
  }
  listacurso = [
    '1er',
    '2do',
    '3ro',
    '4to',
    '5to',
    '6to',
    '7mo',
    '8vo',
    '9no',
    '10mo',
    '11vo',
  ];

  // Función para agregar un nuevo curso al formulario
  agregarCurso(): void {
    this.cursos.push(
      this.fb.group({
        nombre: [
          this.listacurso.find(
            (element, index) => index == this.cursos.length
          ) || (this.cursos.length + 1).toString() + 'vo',
        ],
        paralelos: this.fb.array([]),
        // Otros campos de CursoSchema según sea necesario
      })
    );
  }
  quitarCurso(cursoIndex: number): void {
    const cursos = this.cursos;

    if (cursos.length > cursoIndex) {
      cursos.removeAt(cursoIndex);
      console.log('Curso eliminado:', cursos.value);
    } else {
      console.error('Índice de curso fuera de rango:', cursoIndex);
    }
  }

  // Función para agregar un nuevo módulo único al formulario
  agregarModuloUnico(): void {
    this.modulosUnicos.push(
      this.fb.group({
        nombre: [''],
        // Otros campos de ModuloUnicoSchema según sea necesario
      })
    );
  }
  quitarModuloUnico(moduloIndex: number): void {
    const modulosUnicos = this.modulosUnicos;

    if (modulosUnicos.length > moduloIndex) {
      modulosUnicos.removeAt(moduloIndex);
      console.log('Módulo único eliminado:', modulosUnicos.value);
    } else {
      console.error('Índice de módulo único fuera de rango:', moduloIndex);
    }
  }

  agregarParalelo(cursoIndex: number): void {
    const paralelos = this.cursos.controls[cursoIndex].get(
      'paralelos'
    ) as FormArray;

    // Obtén la letra siguiente en la secuencia
    const siguienteLetra = String.fromCharCode(65 + paralelos.length); // 65 es el código ASCII para 'A'

    paralelos.push(
      this.fb.group({
        nombre: [siguienteLetra],
        // Otros campos de ModuloUnicoSchema según sea necesario
      })
    );
    console.log('Nuevo paralelo añadido:', paralelos.value);
  }

  quitarParalelo(cursoIndex: number, paraleloIndex: number): void {
    const paralelos = this.cursos.controls[cursoIndex].get(
      'paralelos'
    ) as FormArray;

    if (paralelos.length > paraleloIndex) {
      paralelos.removeAt(paraleloIndex);
      console.log('Paralelo eliminado:', paralelos.value);
    } else {
      console.error('Índice de paralelo fuera de rango:', paraleloIndex);
    }
  }

  // Función para enviar el formulario al backend (simulado)
  guardarConfiguracion() {
    if (this.configForm.valid) {
      const configuracion = this.configForm.value;
      console.log('Enviando configuración al backend:', configuracion);
      // Aquí podrías llamar a tu servicio o API para enviar la configuración al backend
    } else {
      console.error(
        'El formulario no es válido. Por favor, completa los campos obligatorios.',
        this.configForm,
        this.configForm.valid
      );
    }
  }

  // Propiedades para nuevo año lectivo
  public nuevoConfig: any = {
    matricula: '',
    pension: '',
    anio_lectivo: '',
    nuevo: 1,
    numpension: 0,
    extrapagos: '[]',
  };
  public loadingNuevoAnio = false;
  public mesesNuevoAnio: Array<any> = [];

  // Método para manejar las fechas en el nuevo formulario
  fechasNuevoAnio(event: any) {
    this.mesesNuevoAnio = [];
    if (this.nuevoConfig.anio_lectivo) {
      for (var i = 0; i < 10; i++) {
        this.mesesNuevoAnio.push({
          date: new Date(this.nuevoConfig.anio_lectivo).setMonth(
            new Date(this.nuevoConfig.anio_lectivo).getMonth() + i
          ),
        });
      }
    }
  }

  // Método para crear un nuevo año lectivo
  crearNuevoAnioLectivo(nuevoAnioForm: any) {
    if (nuevoAnioForm.valid) {
      this.loadingNuevoAnio = true;

      // Asegurarse de que se envía como nuevo
      this.nuevoConfig.nuevo = 1;

      // Verificar que el año sea posterior al último registrado
      let puedeCrear = true;
      let mensajeError = '';

      if (this.config_const.length > 0) {
        const ultimoAnio = new Date(
          this.config_const[0].anio_lectivo
        ).getFullYear();
        const nuevoAnio = new Date(this.nuevoConfig.anio_lectivo).getFullYear();

        if (nuevoAnio <= ultimoAnio) {
          puedeCrear = false;
          mensajeError = `El año lectivo debe ser posterior al último registrado (${ultimoAnio})`;
        }
      }

      if (puedeCrear) {
        // Enviar solicitud para crear nuevo año lectivo
        this._adminService
          .actualizar_config_admin(this.nuevoConfig, this.token)
          .subscribe(
            (response) => {
              if (response.message == undefined) {
                iziToast.success({
                  title: 'ÉXITOSO',
                  position: 'topRight',
                  message: 'Se ha creado correctamente el nuevo año lectivo.',
                });

                // Cerrar modal y reiniciar formulario
                $('#modalNuevoAnioLectivo').modal('hide');
                this.nuevoConfig = {
                  matricula: '',
                  pension: '',
                  anio_lectivo: '',
                  nuevo: 1,
                  numpension: 0,
                  extrapagos: '[]',
                };

                // Recargar datos
                this.call_lectivo();
              } else {
                iziToast.error({
                  title: 'ERROR',
                  position: 'topRight',
                  message: response.message,
                });
              }
              this.loadingNuevoAnio = false;
            },
            (error) => {
              console.error('Error al crear nuevo año lectivo:', error);
              iziToast.error({
                title: 'ERROR',
                position: 'topRight',
                message: 'Ocurrió un error al crear el nuevo año lectivo',
              });
              this.loadingNuevoAnio = false;
            }
          );
      } else {
        iziToast.warning({
          title: 'ADVERTENCIA',
          position: 'topRight',
          message: mensajeError,
        });
        this.loadingNuevoAnio = false;
      }
    } else {
      iziToast.error({
        title: 'ERROR',
        position: 'topRight',
        message: 'Por favor, complete todos los campos requeridos',
      });
    }
  }
}
