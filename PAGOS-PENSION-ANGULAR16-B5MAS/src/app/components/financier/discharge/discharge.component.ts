import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/service/admin.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

declare var $: any;
import iziToast from 'izitoast';
export interface CuentaContable {
  codigo: string;
  nombre: string;
  subcuentas?: CuentaContable[];
}  
export interface Proveedor {
  id: number;
  direccion: string;
  nombre: string;
  apellido: string;
  estado: string;
  ruc: string;
  telefono: string;
  email: string;
}
@Component({
  selector: 'app-discharge',
  templateUrl: './discharge.component.html',
  styleUrls: ['./discharge.component.scss']
})

export class DischargeComponent implements OnInit {
  
  public egreso:any={}
  public egresos:any={}
  public proveedores: Proveedor[] = [];
  public arregreso:any=[];
  public newitemeg:any={};
  public opcion=false;
  public auxnomc='';
  public linea:any={
    codigo: '',
    nombre: ''
  };
  public page = 1;
	public pageSize:number = 15;
  public selectedPageSize=10;
  public collectionSize=0;
  public token = localStorage.getItem('token');


  public searchTerm: string = 'nombre';
  selectedOption: any;
  myControl = new FormControl<string | CuentaContable>('');
  filteredOptions: Observable<CuentaContable[]> | undefined;

  constructor(private _adminService: AdminService) { }

  planContable: CuentaContable[] = [
    {
      codigo: '1',
      nombre: 'Activos',
      subcuentas: [
        {
          codigo: '1.1',
          nombre: 'Activos Corrientes',
          subcuentas: [
            { codigo: '1.1.1', nombre: 'Caja' },
            { codigo: '1.1.2', nombre: 'Bancos' },
            { codigo: '1.1.3', nombre: 'Cuentas por Cobrar' }
          ]
        },
        {
          codigo: '1.2',
          nombre: 'Activos No Corrientes',
          subcuentas: [
            { codigo: '1.2.1', nombre: 'Propiedades' },
            { codigo: '1.2.2', nombre: 'Equipos' },
            { codigo: '1.2.3', nombre: 'Inversiones' }
          ]
        }
      ]
    },
    {
      codigo: '2',
      nombre: 'Pasivos',
      subcuentas: [
        {
          codigo: '2.1',
          nombre: 'Pasivos Corrientes',
          subcuentas: [
            { codigo: '2.1.1', nombre: 'Cuentas por Pagar' },
            { codigo: '2.1.2', nombre: 'Préstamos' }
          ]
        },
        {
          codigo: '2.2',
          nombre: 'Pasivos No Corrientes',
          subcuentas: [
            { codigo: '2.2.1', nombre: 'Deudas a Largo Plazo' },
            { codigo: '2.2.2', nombre: 'Obligaciones Financieras' }
          ]
        }
      ]
    },
    {
      codigo: '3',
      nombre: 'Patrimonio',
      subcuentas: [
        { codigo: '3.1', nombre: 'Capital' },
        { codigo: '3.2', nombre: 'Reservas' }
      ]
    },
    {
      codigo: '4',
      nombre: 'Ingresos',
      subcuentas: [
        { codigo: '4.1', nombre: 'Ventas' },
        { codigo: '4.2', nombre: 'Intereses' }
      ]
    },
    {
      codigo: '5',
      nombre: 'Gastos',
      subcuentas: [
        { codigo: '5.1', nombre: 'Gastos Operativos' },
        { codigo: '5.2', nombre: 'Gastos Financieros' }
      ]
    }
  ];
  public planccon_arr=[];
  nuevaCuenta: CuentaContable = {
    codigo: '',
    nombre: ''
  };


  keyword = ['codigo','nombre'];
  data = [
     {
       id: 1,
       name: 'Usa'
     },
     {
       id: 2,
       name: 'England'
     },
     {
       id: 3,
       name: 'India'
     },
     {
       id: 4,
       name: 'africa'
     },
     {
       id: 5,
       name: 'nigeria'
     },
     {
       id: 6,
       name: 'albania'
     },
     {
       id: 7,
       name: 'madagascar'
     }
  ];
  public filtro='nombre';
  getSearchKeyword(val:any) {
    this.filtro = 'nombre';
    if(!Number.isNaN(parseInt(val))){
      this.filtro = 'codigo';
    }
  }
  selectEvent(item: any) {
    this.newitemeg.plan={codigo:item.codigo.replace(/\./g, ''), nombre:item.nombre};
    console.log('selected item '+ this.newitemeg);

  }
  onChangeSearch(val: any) {
    this.getSearchKeyword(val);

    console.log('selected val '+this.filtro);
  }
  onFocused(e: any){
   // console.log(e);
  }
  agregariteme(){
    console.log(this.newitemeg);
      this.arregreso.push(this.newitemeg);
      this.newitemeg={};

    console.log(this.arregreso);
  }
  sumaitems(val:any){
    let sum=0;
    if(val){
      
      this.arregreso.forEach((element:any) => {
          if(element.seccion==val){
            sum=sum+element.monto
          }
      });
      
    }
    return sum
  }

  guardarPlanContable(){
    this._adminService.agregar_ctacontable(this.token,this.planContable).subscribe(response=>{
      if(response.message){        
        iziToast.info({
          title: 'Respuesta',
          position: 'topRight',
          message: response.message,
        });
      }
    });
  }
  agregarCuenta(registroForm: { valid: any }) {
    if (registroForm.valid) {
      console.log(this.nuevaCuenta);
      if (this.linea.codigo === '') {
        if (this.nuevaCuenta.codigo && this.nuevaCuenta.nombre && this.planContable.find((element:any)=>element.codigo==this.nuevaCuenta.codigo)==undefined) {
          this.planContable.push(this.nuevaCuenta);
          this.nuevaCuenta = { codigo: '', nombre: '', subcuentas: [] };
          $('#modaladdPlanContable').modal('hide');
        }else{
          iziToast.error({
            title: 'ERROR',
            position: 'topRight',
            message: 'Ya existe',
          });
          this.nuevaCuenta.codigo='';
        }
      } else {
        const cuentaPadre = this.buscarCuentaPorCodigo(this.linea.codigo, this.planContable);
        if (cuentaPadre ) {
          if(!cuentaPadre.subcuentas || !cuentaPadre.subcuentas.length ){
            cuentaPadre.subcuentas=[];
          }
          console.log(cuentaPadre.subcuentas);
          this.nuevaCuenta.codigo=cuentaPadre.codigo+'.'+(cuentaPadre.subcuentas.length +1).toString()
          cuentaPadre.subcuentas.push(this.nuevaCuenta);
          this.nuevaCuenta = { codigo: '', nombre: '', subcuentas: [] };
          $('#modaladdPlanContable').modal('hide');
        }
      }
    }
   
  }
  opciones(){
    if(this.opcion){
      this.opcion=false
    }else{
      this.opcion=true;
    }
  }

  buscarCuentaPorCodigo(codigo: string, cuentas: any[]): any {
    for (const cuenta of cuentas) {
      if (cuenta.codigo === codigo) {
        return cuenta;
      } else if (cuenta.subcuentas && cuenta.subcuentas.length > 0) {
        const subcuentaEncontrada = this.buscarCuentaPorCodigo(codigo, cuenta.subcuentas);
        if (subcuentaEncontrada) {
          return subcuentaEncontrada;
        }
      }
    }
    return null;
  }

  pasar(cuenta?:CuentaContable,subcuenta?:CuentaContable){
    this.linea= { codigo: '', nombre: ''};
    if(subcuenta){
      this.linea=subcuenta;
    }else if(cuenta){
      this.linea=cuenta;
    }
    console.log(this.linea);
  }
  mostrareditarCuenta(cuenta: CuentaContable){
    this.auxnomc=cuenta.nombre;
    this.opciones();
    let i=document.getElementById((cuenta.codigo).toString()+'-i'),b= document.getElementById((cuenta.codigo).toString()+'-b') ,l=document.getElementById((cuenta.codigo).toString()+'-l');
    if(i&&b&&l){
      i.style.display = '';
      l.style.display = 'none';
      b.style.display = 'none';
    }
  }
  editarCuenta(cuenta: CuentaContable) {
    this.editarCuentaRecursiva(this.planContable, cuenta);
  }
  editarCuentaRecursiva(arr: any, cuenta: CuentaContable) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === cuenta) {
        cuenta.nombre=this.auxnomc;
        arr[i] = cuenta; // Actualizar cuenta actual
        this.opciones();
        let i2=document.getElementById((cuenta.codigo).toString()+'-i'),b= document.getElementById((cuenta.codigo).toString()+'-b') ,l=document.getElementById((cuenta.codigo).toString()+'-l');
        if(i2&&b&&l){
          i2.style.display = 'none';
          l.style.display = '';
          b.style.display = '';
        }
        return;
      }
      if (arr[i].subcuentas) {
        this.editarCuentaRecursiva(arr[i].subcuentas, cuenta); // Llamada recursiva para subcuentas
      }
    }
  }
  descareditarCuenta(cuenta: CuentaContable){
    this.auxnomc='';
    this.opciones();
    let i=document.getElementById((cuenta.codigo).toString()+'-i'),b= document.getElementById((cuenta.codigo).toString()+'-b') ,l=document.getElementById((cuenta.codigo).toString()+'-l');
        if(i&&b&&l){
          i.style.display = 'none';
          l.style.display = '';
          b.style.display = '';
        }
  }
  eliminarCuenta(cuenta: CuentaContable) {
    this.planContable = this.eliminarCuentaRecursiva(this.planContable, cuenta);
  }  
  eliminarCuentaRecursiva(arr: any, cuenta: CuentaContable): CuentaContable[] {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === cuenta) {
        arr.splice(i, 1); // Eliminar cuenta actual
        return arr;
      }
      if (arr[i].subcuentas) {
        arr[i].subcuentas = this.eliminarCuentaRecursiva(arr[i].subcuentas, cuenta); // Llamada recursiva para subcuentas
        if (arr[i].subcuentas.length === 0) {
          delete arr[i].subcuentas; // Eliminar propiedad subcuentas si no quedan subcuentas
        }
      }
    }
    return arr;
  }
  private _filter(value:any): CuentaContable[] {
    const filterValue = value.toLowerCase();
    console.log(value);
    const cuentasContables: CuentaContable[] = Object.assign(this.planContable);
    return this.buscar_pl(filterValue, cuentasContables);
  }
  
  buscar_pl(codigo: string, cuentas: CuentaContable[]): CuentaContable[] {
    const cuentasEncontradas: CuentaContable[] = [];
  
    for (const cuenta of cuentas) {
      if (cuenta.nombre.toLowerCase().includes(codigo) || cuenta.codigo.toLowerCase().includes(codigo)) {
        cuentasEncontradas.push(cuenta);
      }
      if (cuenta.subcuentas && cuenta.subcuentas.length > 0) {
        const subcuentasEncontradas = this.buscar_pl(codigo, cuenta.subcuentas);
        if (subcuentasEncontradas.length > 0) {
          //console.log(subcuentasEncontradas);
          subcuentasEncontradas
          cuentasEncontradas.push(...subcuentasEncontradas);
        }
      }
    }
  
    return cuentasEncontradas;
  }

  displayFn(user:any): string {
    console.log(this.filteredOptions);
    return user && user ? user : '';
  }
  ngOnInit(): void {
    
    //('#modalPlanContable').modal('show');
    this._adminService.listar_ctacontable(this.token).subscribe(response=>{
      console.log(response.ctacontable);
      if(response.ctacontable.length!=0){
        this.planContable=response.ctacontable;
      }
      
      
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value))
      );
      this.filteredOptions.subscribe(options => {
        this.planccon_arr=Object.assign(options);       
      });
      /*
      this.planccon_arr.forEach(element => {
        //element.codigo=element.codigo.replace(/\./g, '');
      });*/
    });

    this._adminService.listar_proveedor(this.token).subscribe(response=>{
      if(response.proveedores){
        
        this.proveedores=response.proveedores;
        //console.log(this.proveedores);
        this.collectionSize=this.proveedores.length;

        
      }
    });
  }
  onOptionSelected(option: any) {
    this.linea = option;
  }

  onItemSelected(item: any) {
    // Lógica para manejar la opción seleccionada
  }

  filtarprove(event:any){

  }

  guardarEgreso(){
    
  }

}
