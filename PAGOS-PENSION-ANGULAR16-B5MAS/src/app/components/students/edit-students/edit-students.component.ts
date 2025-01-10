import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import { EstudianteService } from 'src/app/service/student.service';
import { GLOBAL } from 'src/app/service/GLOBAL';
import iziToast from 'izitoast';
import { InstitucionServiceService } from 'src/app/service/institucion.service.service';
declare var $: any;

@Component({
  selector: 'app-edit-students',
  templateUrl: './edit-students.component.html',
  styleUrls: ['./edit-students.component.scss'],
})
export class EditStudentsComponent implements OnInit {
  public arr_etiquetas: Array<any> = [];
  public etiquetas: Array<any> = [];
  public new_etiqueta = '';
  public pagos: Array<any> = [];

  public estudiante: any = {};
  public id: any;
  public config: any = {};
  public valores_pensiones = 0;
  public load_btn = false;
  public load_data = true;
  public token = localStorage.getItem('token');
  public url = GLOBAL.url;
  public pmat = false;
  public mbeca = 0;
  public rol: any;
  public yo = 0;
  public pension: any = {};
  public ch_r = 'repre';
  public ch_c = 'dni';
  public ch_co = 'dni';
  constructor(
    private _route: ActivatedRoute,

    private _adminService: AdminService,
    private _estudianteService: EstudianteService,
    private _router: Router,
    private _institucionService: InstitucionServiceService
  ) {}
  public especialidades: any = [
    { name: 'Inicial', seleccionado: false, view: true, code: 'INICIAL', cursos:[1,2] },
    { name: 'EGB', seleccionado: false, view: true, code: 'EGB', cursos:[1,2,3,4,5,6,7,8,9,10] },
    { name: 'BGU', seleccionado: false, view: true, code: 'BGU', cursos:[1,2,3] },
  ];
  async valildationEspecialidad() {
    const user_data = JSON.parse(localStorage.getItem('user_data') || '');

    await this._institucionService
      .getTypeInstitucion(user_data.base)
      .subscribe((response: any) => {
        if (response.type_school === 'EGB') {
          this.especialidades.map((item: any) => {
            if (item.name === 'EGB') {
              item.view = true;
            } else {
              item.view = false;
            }
          });
        }
      });
  }
  ngOnInit(): void {
    this.valildationEspecialidad();
    let aux = localStorage.getItem('identity');
    this._adminService.obtener_admin(aux, this.token).subscribe((response) => {
      if (response.data) {
        this.rol = response.data.rol;
        if (response.data.email == 'samuel.arevalo@espoch.edu.ec') {
          this.yo = 1;
        }
        ////console.log(this.rol);
      } else {
        let user = JSON.parse(localStorage.getItem('user_data')!);
        if (user.email == 'samuel.arevalo@espoch.edu.ec') {
          this.yo = 1;
        }
        if (!this.rol) {
          this.rol = user.rol;
        }
      }
    });
    (function () {
      'use strict';

      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.querySelectorAll('.needs-validation');

      // Loop over them and prevent submission
      Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener(
          'submit',
          function (event: {
            preventDefault: () => void;
            stopPropagation: () => void;
          }) {
            if (!form.checkValidity()) {
              event.preventDefault();
              event.stopPropagation();
            }

            form.classList.add('was-validated');
          },
          false
        );
      });
    })();
    this._route.params.subscribe((params) => {
      this.id = params['id'];

      this._estudianteService
        .obtener_estudiante_guest(this.id, this.token)
        .subscribe(
          (response) => {
            ////console.log(response.data);
            if (response.data == undefined) {
              this.estudiante = undefined;
              this.load_data = false;
            } else {
              this.estudiante = response.data;
              this.estudiante.password = '';
              if (this.estudiante.dni_factura?.length > 10) {
                this.ch_co = 'ruc';
              }
              if (this.estudiante.dni_padre?.length > 10) {
                this.ch_c = 'ruc';
              }
              this._adminService
                .obtener_config_admin(this.token)
                .subscribe((response) => {
                  //////console.log(response);
                  if (response.data) {
                    this.config = response.data[0];
                    this.valores_pensiones = this.config.pension;
                    //console.log(this.valores_pensiones);

                    this._estudianteService
                      .obtener_pension_estudiante_guest(this.id, this.token)
                      .subscribe((response) => {
                        //console.log(response.data);
                        if (response.data) {
                          var pen = response.data;
                          console.log(response.data);
                          /*
											for (const iterator of pen) {
												console.log(iterator.idanio_lectivo._id==this.config._id);
												if(iterator.idanio_lectivo._id==this.config._id){
													this.pension = Object.assign(iterator);
													break;
												}
											}*/
                          this.pension = Object.assign(pen[pen.length - 1]);
                          //console.log(this.pension);
                          //this.estudiante.pension=Object.assign(pen[0]);
                          Object.assign(this.estudiante, this.pension);
                          //console.log(this.estudiante);

                          //console.log(this.estudiante);
                          console.log(this.pension);
                          for (var i = 0; i < 10; i++) {
                            ////console.log(new Date (new Date (this.pension.anio_lectivo).setMonth(new Date (this.pension.anio_lectivo).getMonth()+i)).getMonth() );
                            ////console.log( new Date (this.pension.anio_lectivo).setMonth(new Date (this.pension.anio_lectivo).getMonth()+i) );
                            /*console.log(i > this.estudiante.meses - 1 &&
													new Date(this.estudiante.idanio_lectivo?.mescompleto).getMonth() !=
														new Date(this.pension.anio_lectivo).getMonth() + i);

													console.log(new Date(this.pension.anio_lectivo).getMonth() + i);*/
                            if (i > this.estudiante.meses - 1) {
                              if (
                                this.estudiante.idanio_lectivo.mescompleto !=
                                  null &&
                                new Date(
                                  this.estudiante.idanio_lectivo.mescompleto
                                ).getMonth() !=
                                  new Date(
                                    this.pension.anio_lectivo
                                  ).getMonth() +
                                    i
                              ) {
                                this.etiquetas.push({
                                  etiqueta: i + 1,
                                  titulo: new Date(
                                    new Date(
                                      this.pension.anio_lectivo
                                    ).setMonth(
                                      new Date(
                                        this.pension.anio_lectivo
                                      ).getMonth() + i
                                    )
                                  ),
                                  idpension: this.pension._id,
                                  usado: 0,
                                });
                              } else {
                                this.etiquetas.push({
                                  etiqueta: i + 1,
                                  titulo: new Date(
                                    new Date(
                                      this.pension.anio_lectivo
                                    ).setMonth(
                                      new Date(
                                        this.pension.anio_lectivo
                                      ).getMonth() + i
                                    )
                                  ),
                                  idpension: this.pension._id,
                                  usado: 0,
                                });
                              }
                            }
                          }
                          //console.log(this.etiquetas);
                          //this.estudiante.condicion_beca = this.pension.condicion_beca;
                          this._adminService
                            .obtener_detalles_ordenes_estudiante_abono(
                              this.pension._id,
                              this.token
                            )
                            .subscribe((response) => {
                              //console.log(response.abonos);
                              //console.log(response.becas);
                              if (response.abonos) {
                                this.pagos = Object.assign(response.abonos);
                                this.pagos.forEach((element) => {
                                  if (
                                    element.idpension == this.pension._id &&
                                    element.tipo == 0
                                  ) {
                                    this.pmat = true;
                                  }
                                  if (
                                    element.idpension == this.pension._id &&
                                    element.tipo > this.mbeca
                                  ) {
                                    this.mbeca = element.tipo;
                                  }
                                  if (
                                    element.idpension == this.pension._id &&
                                    element.abono == 0 &&
                                    element.tipo != 0
                                  ) {
                                    this.etiquetas.forEach((element: any) => {
                                      if (element.etiqueta == element.tipo) {
                                        element.usado = 1;
                                      }
                                    });
                                  }
                                });
                              }
                              if (response.becas) {
                                this.arr_etiquetas = Object.assign(
                                  response.becas
                                );
                              }
                              ////console.log(this.arr_etiquetas);
                            });
                        } else {
                          this.load_data = false;
                        }
                      });
                  }
                });
            }
          },
          (error) => {}
        );
    });
  }
  buscar_usado() {
    let val = true;
    val = this.arr_etiquetas.some((element: any) => {
      return element.usado !== 0;
    });
    return val;
  }
  agregar_etiqueta() {
    let arr_label = this.new_etiqueta.split('_');
    var ir: any = arr_label[3];
    if (
      this.arr_etiquetas.find(({ etiqueta }) => etiqueta === arr_label[0]) ==
      undefined
    ) {
      this.arr_etiquetas.push({
        etiqueta: arr_label[0],
        titulo: arr_label[1],
        idpension: arr_label[2],
        usado: 0,
      });
      //this.etiquetas.splice(ir,1)
      this.new_etiqueta = '';
    }
  }
  eliminar_etiqueta(idx: any) {
    this.arr_etiquetas.splice(idx, 1);
  }

  descuento_valor(id: any) {
    //this.estudiante.desc_beca = (parseFloat(this.pension.desc_beca)).toFixed(2);
    if (
      this.estudiante.desc_beca != undefined &&
      this.estudiante.desc_beca > 0 &&
      this.estudiante.desc_beca <= 100
    ) {
      this.estudiante.val_beca = parseFloat(
        (
          this.valores_pensiones -
          (this.valores_pensiones * this.estudiante.desc_beca) / 100
        ).toFixed(2)
      ).toFixed(2);
      this.pension.val_beca = this.estudiante.val_beca;
    } else {
      iziToast.warning({
        title: 'PELIGRO',
        position: 'topRight',
        message: 'Descuento Invalido',
      });

      this.estudiante.desc_beca = '';
      this.estudiante.val_beca = '';
    }
  }
  valor_descuento(id: any) {
    //this.estudiante.val_beca = (parseFloat(this.pension.val_beca)).toFixed(2);
    if (
      this.estudiante.val_beca != undefined &&
      this.estudiante.val_beca <= this.valores_pensiones &&
      this.estudiante.val_beca >= 0
    ) {
      this.estudiante.desc_beca = (
        100 -
        (this.estudiante.val_beca * 100) / this.valores_pensiones
      ).toFixed(2);
      this.pension.desc_beca = this.estudiante.desc_beca;
    } else {
      iziToast.warning({
        title: 'PELIGRO',
        position: 'topRight',
        message: 'Valor Invalido',
      });

      this.estudiante.val_beca = '';
      this.estudiante.desc_beca = '';
    }
  }
  actualizar(updateForm: { valid: any }) {
    /*if (this.estudiante.password != '' && this.estudiante.password != this.estudiante.auxiliar) {
			iziToast.show({
				title: 'DANGER',
				class: 'text-danger',
				titleColor: 'red',
				color: 'red',
				position: 'topRight',
				message: 'Las contraseñas no coinciden',
			});
		} else {*/

    if (updateForm.valid) {
      let conf = 0;

      this.load_btn = true;
      if (this.ch_r == 'repre') {
        this.estudiante.nombres_factura = this.estudiante.nombres_padre;
        this.estudiante.dni_factura = this.estudiante.dni_padre;
      }
      if (this.estudiante.condicion_beca == 'Si') {
        if (this.estudiante.matricula == undefined) {
          this.estudiante.matricula = this.pension.matricula;
        } else {
          this.estudiante.paga_mat = this.estudiante.matricula;
        }
        if (this.estudiante.num_mes_beca == undefined) {
          this.estudiante.num_mes_beca = this.arr_etiquetas.length;
        }
        if (this.estudiante.desc_beca == undefined) {
          iziToast.error({
            title: 'ERROR',
            position: 'topRight',
            message: 'Debe el descuento de la Beca',
          });
        }
        if (this.estudiante.val_beca == undefined) {
          iziToast.error({
            title: 'ERROR',
            position: 'topRight',
            message: 'Debe valor de la beca Beca',
          });
        }

        if (this.arr_etiquetas.length == 0) {
          iziToast.error({
            title: 'DANGER',
            position: 'topRight',
            message: 'Debe seleccionar los meses con Beca',
          });
          conf = 1;
          this.load_btn = false;
        } else {
          this.estudiante.num_mes_beca = this.arr_etiquetas.length;
          this.estudiante.pension_beca = this.arr_etiquetas;
        }
      }
      if (conf == 0) {
        //console.log(this.estudiante);
        this._estudianteService
          .actualizar_estudiante_admin(this.id, this.estudiante, this.token)
          .subscribe(
            (response) => {
              if (response.message == 'Actualizado con exito') {
                iziToast.success({
                  title: 'SUCCESS',
                  position: 'topRight',
                  message: response.message,
                });

                this.load_btn = false;

                this._router.navigate(['/estudiantes']);
              } else {
                iziToast.error({
                  title: 'ERROR',
                  position: 'topRight',
                  message: response.message,
                });
                this.estudiante.num_mes_beca = '';
                location.reload();
              }
            },
            (error) => {
              //////console.log(error);
            }
          );
      }
    } else {
      iziToast.error({
        title: 'ERROR',
        position: 'topRight',
        message: 'Los datos del formulario no son validos',
      });
      //location.reload();
    }
    //}
  }
}
