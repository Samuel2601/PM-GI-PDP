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
  total: number;
  adicional1?: string;
  adicional2?: string;
  detalles: Detalle[];
  cobros?: Cobro[];
  electronico: true;
  servicio: number | 0.0;
}

export interface Cliente {
  ruc: string | null;
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
  porcentaje_iva: number | 0.0;
  porcentaje_descuento: number | 0.0;
  base_cero: number;
  base_gravable: number;
  base_no_gravable: number;
  porcentaje_ice: number | 0.0;
  valor_ice: number | 0.0;
}

export interface Cobro {
  forma_cobro: 'EF' | 'CQ' | 'TC' | 'TRA';
  monto: number;
  numero_comprobante?: string | null;
  tipo_ping?: string;
}
