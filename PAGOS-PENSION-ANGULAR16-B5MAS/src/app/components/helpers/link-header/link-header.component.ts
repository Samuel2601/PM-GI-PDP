

import { Component,OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;
import iziToast from 'izitoast';

@Component({
  selector: 'app-link-header',
  templateUrl: './link-header.component.html',
  styleUrls: ['./link-header.component.scss']
})

export class LinkHeaderComponent implements OnInit {
  public proveedores:any={}
  public encabezados:any={}

  constructor(public activeModal: NgbActiveModal) { }
  ngOnInit(): void {
   // console.log(this.proveedores);
   // console.log(this.encabezados);
  }
  cerrarVentana(){
    //console.log('CERRAR');
    this.activeModal.close()
    
  }
  guardar(){
    let con=false;
    
    this.proveedores.forEach((element:any) => {
      if(!element.encabezado){
        con=true;
      }
    });
    if(con){
      iziToast.error({
        title: 'ERROR',
        position: 'topRight',
        message: 'Debes vincular todos los campos',
      });
    }else{
      this.activeModal.close(this.proveedores)
      console.log('GUARDAR');
    }    
  }
}
