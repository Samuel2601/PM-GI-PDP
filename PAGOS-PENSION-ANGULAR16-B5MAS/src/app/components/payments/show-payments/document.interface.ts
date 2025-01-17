export interface Documento {
  //pos: string;
  fecha_emision: string;
  tipo_documento: string;
  //documento: string;
  estado?: string;
  //autorizacion: string;
  caja_id?: string | null;
  cliente: Cliente;
  vendedor?: Vendedor;
  descripcion?: string;
  subtotal_0: number;
  subtotal_12: number;
  iva: number;
  ice: number;
  servicio?: number;
  total: number;
  adicional1?: string;
  adicional2?: string;
  detalles: Detalle[];
  cobros?: Cobro[];
  electronico:true;
}

export interface Cliente {
  ruc?: string;
  cedula: string;
  razon_social: string;
  telefonos?: string;
  direccion?: string;
  tipo: string;
  email?: string;
  es_extranjero?: boolean;
}

export interface Vendedor {
  ruc?: string;
  cedula: string;
  razon_social: string;
  telefonos?: string;
  direccion?: string;
  tipo: string;
  email?: string;
  es_extranjero?: boolean;
}

export interface Detalle {
  producto_id: string;
  cantidad: number;
  precio: number;
  porcentaje_iva?: number;
  porcentaje_descuento?: number;
  base_cero: number;
  base_gravable: number;
  base_no_gravable?: number;
  porcentaje_ice?: number;
  valor_ice?: number;
}

export interface Cobro {
  forma_cobro: 'EF' | 'CQ' | 'TC' | 'TRA';
  monto: number;
  numero_comprobante?: string | null;
  tipo_ping?: string;
}
