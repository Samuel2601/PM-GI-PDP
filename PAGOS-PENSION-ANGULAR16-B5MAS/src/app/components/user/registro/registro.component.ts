import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import iziToast from 'izitoast';
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent implements OnInit {
  public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';
  public file: any = undefined;
  public token: any = '';
  public config: any;
  public geo = localStorage.getItem('geo');
  public inicio = 1;
  public registrationForm: FormGroup;
  public admin: any = {};
  /* = {
		email: "",
		password: ""
	};*/
  showPassword = false;
  showConfirmPassword = false;
  constructor(
    private _adminService: AdminService,
    private _router: Router,
    private fb: FormBuilder
  ) {
    this.token = localStorage.getItem('token');
    this.registrationForm = this.fb.group(
      {
        // Datos Personales
        nombres: [
          '',
          [Validators.required, Validators.pattern(/^[A-ZÁÉÍÓÚa-záéíóú ]+$/)],
        ],
        apellidos: [
          '',
          [Validators.required, Validators.pattern(/^[A-ZÁÉÍÓÚa-záéíóú ]+$/)],
        ],
        dni: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        telefono: [
          '',
          [Validators.required, Validators.pattern(/^[0-9]{8,10}$/)],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],

        // Datos de la Institución
        titulo: ['', [Validators.required]],
        telefonocon: [
          '',
          [Validators.required, Validators.pattern(/^[0-9]{8,10}$/)],
        ],
        pais: ['', Validators.required],
        provincia: ['', Validators.required],
        canton: ['', Validators.required],
        base: ['', Validators.required],
        telefonoinsti: ['', Validators.required],
        codigopostal: ['', Validators.required],
        calle1: ['', Validators.required],
        calle2: ['', Validators.required],
        referencia: ['', Validators.required],
        type_school: [''],
        portada: [],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }
  public URLactual: any;
  ngOnInit(): void {
    this.URLactual = window.location;

    $('body').addClass('align-items-center');
    if (this.token) {
      this._router.navigate(['/estudiantes']);
    } else {
      //MANTENER EN EL COMPONENTE
    }
  }
  FormRegistro(valor: any) {
    this._router.navigate(['/login']);
  }
  Recuperar() {
    this._router.navigate(['/forgot-password']);
  }

  login(loginForm: any) {
    this.geo = localStorage.getItem('geo');
    //console.log(this.geo);
    if (loginForm.valid) {
      let email = loginForm.value.email;
      let password = loginForm.value.password;

      if (email == '' && password == '') {
        iziToast.show({
          title: 'ERROR DATA',
          class: 'iziToast-danger',
          position: 'topRight',
          message: 'Todos los campos son requeridos, vuelva a intentar.',
        });
      } else {
        this._adminService.login_admin({ email, password }).subscribe(
          (response) => {
            //console.log(response);

            if (response.data != null) {
              if (
                response.data.estado == 'Fuera' ||
                response.data.estado == 'deshabilitado'
              ) {
                iziToast.show({
                  title: 'ERROR USER',
                  class: 'iziToast-danger',
                  position: 'topRight',
                  message: 'Cuenta Suspendida',
                });
              } else {
                this.token = response.token;
                //console.log(this.token);
                localStorage.setItem('token', response.token);
                localStorage.setItem('identity', response.data._id);
                localStorage.setItem(
                  'user_data',
                  JSON.stringify(response.data)
                );
                if (email == 'samuel.arevalo@espoch.edu.ec') {
                  this._router.navigate(['/control']);
                } else {
                  this._adminService
                    .obtener_config_admin(this.token)
                    .subscribe((response) => {
                      if (response.data != undefined) {
                        this.config = response.data[0];
                        //console.log(this.config);
                        var toke = localStorage.getItem('token');
                        this._adminService
                          .actualizar_config_admin(this.config, this.token)
                          .subscribe(
                            (response) => {
                              //console.log(response);
                              this._router.navigate(['/estudiantes']);
                            },
                            (error) => {
                              console.log(error);
                            }
                          );
                      } else {
                        this._router.navigate(['/configuraciones']);
                      }
                    });
                }
              }
            } else {
              iziToast.show({
                title: 'ERROR USER',
                class: 'iziToast-danger',
                position: 'topRight',
                message: response.message,
              });
            }
          },
          (error) => {
            iziToast.show({
              title: 'ERROR SERVER',
              class: 'iziToast-danger',
              position: 'topRight',
              message:
                'Ocurrió un error en el servidor, intente mas nuevamente.',
            });
          }
        );
      }
    } else {
      iziToast.show({
        title: 'ERROR DATA',
        class: 'iziToast-danger',
        position: 'topRight',
        message: 'Complete correctamente el formulario.',
      });
      if (!this.geo) {
        iziToast.show({
          title: 'ERROR DATA',
          class: 'iziToast-danger',
          position: 'topRight',
          message: 'No se te puede ubicar',
        });
      }
    }
  }

  fileChangeEvent(event: any): void {
    var file: any;
    if (event.target.files && event.target.files[0]) {
      file = <File>event.target.files[0];
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'No hay un imagen de envio',
      });
    }

    if (file.size <= 4000000) {
      if (file.type == 'image/png') {
        const reader = new FileReader();
        reader.onload = (e) => (this.imgSelect = reader.result);
        // console.log(this.imgSelect);

        reader.readAsDataURL(file);

        $('#input-portada').text(file.name);
        this.file = file;
      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'El archivo debe ser una imagen png',
        });
        $('#input-portada').text('Seleccionar imagen');
        this.imgSelect = 'assets/img/01.jpg';
        this.file = undefined;
      }
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'La imagen no puede superar los 4MB',
      });
      $('#input-portada').text('Seleccionar imagen');
      this.imgSelect = 'assets/img/01.jpg';
      this.file = undefined;
    }

    // console.log(this.file);
  }

  // Validador personalizado para comparar contraseñas
  passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const passwordControl = form.get('password');
    const confirmPasswordControl = form.get('confirmPassword');

    if (!passwordControl || !confirmPasswordControl) {
      // Si alguno de los controles no existe, no se establece un error.
      return null;
    }

    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
    } else {
      // Asegúrate de no sobrescribir otros errores preexistentes
      if (confirmPasswordControl.hasError('passwordMismatch')) {
        confirmPasswordControl.setErrors(null);
      }
    }

    return null;
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
  onSubmit() {
    console.log(this.registrationForm.value);
    if (this.registrationForm.valid) {
      if (this.file) {
        this.registrationForm.value.portada = this.file;
        if (
          this.registrationForm.value.password !==
          this.registrationForm.value.confirmPassword
        ) {
          let aux = document.getElementById('auxiliar');
          if (aux) {
            aux.style.borderColor = 'Red';
          }

          iziToast.show({
            title: 'ERROR',
            class: 'iziToast-danger',
            position: 'topRight',
            message: 'No coincide las contraseñas',
          });
        } else {
          this._adminService
            .create_institucion(this.registrationForm.value, this.file)
            .subscribe((response) => {
              console.log(response);
              if (response.message === 'Registrado con éxito') {
                iziToast.show({
                  title: 'APROBADO',
                  class: 'iziToast-success',
                  position: 'topRight',
                  message: response.message,
                });
                window.location.reload();
              } else {
                iziToast.show({
                  title: 'ERROR USER',
                  class: 'iziToast-danger',
                  position: 'topRight',
                  message: response.message,
                });
              }
            });
        }
      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Debe subir una portada para registrar',
        });
        $('#input-portada').text('Seleccionar imagen');
        this.imgSelect = 'assets/img/01.jpg';
        this.file = undefined;
      }
    } else {
      console.error('Debe seleccionar una opción', this.registrationForm);
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe seleccionar una opción',
      });
    }
  }
  view_password() {
    let type = $('#password').attr('type');

    if (type == 'text') {
      $('#password').attr('type', 'password');
    } else if (type == 'password') {
      $('#password').attr('type', 'text');
    }
  }
  view_passworda() {
    let type = $('#confirmPassword').attr('type');

    if (type == 'text') {
      $('#confirmPassword').attr('type', 'password');
    } else if (type == 'password') {
      $('#confirmPassword').attr('type', 'text');
    }
  }

  // Getter para acceso fácil a los controles del formulario
  submitted = false;
  mostrarPassword = false;
  get f() {
    return this.registrationForm.controls;
  } // Validador personalizado para comparar contraseñas
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return null;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
      return null;
    };
  }
}
