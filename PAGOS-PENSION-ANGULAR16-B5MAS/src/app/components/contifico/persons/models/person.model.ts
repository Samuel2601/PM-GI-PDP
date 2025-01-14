export interface Person {
  id: string;
  tipo: 'N' | 'J' | 'I' | 'P';
  razon_social: string;
  nombre_comercial?: string;
  cedula: string;
  ruc?: string;
  placa?: string;
  direccion?: string;
  telefonos?: string;
  email?: string;
  es_cliente: boolean;
  es_proveedor: boolean;
  es_vendedor?: boolean;
  es_empleado?: boolean;
  es_extranjero?: boolean;
  es_corporativo?: boolean;
  porcentaje_descuento?: number;
  aplicar_cupo?: boolean;
  personaasociada_id?: string;
}
