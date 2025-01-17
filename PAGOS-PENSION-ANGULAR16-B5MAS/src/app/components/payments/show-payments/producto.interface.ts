export interface Product {
  id: string;
  codigo: string;
  tipo_producto: string;
  para_pos: boolean;
  nombre: string;
  codigo_barra: string;
  categoria_id: string;
  marca_id: string | null;
  marca_nombre: string | null;
  porcentaje_iva: number;
  pvp1: number | null;
  pvp2: number | null;
  pvp3: number | null;
  pvp4: number | null;
  minimo: string;
  cantidad_stock: number;
  estado: string;
  pvp_manual: boolean;
  imagen: string;
  descripcion: string;
  personalizado1: string;
  personalizado2: string;
  tipo: string;
  producto_base_id: string | null;
  nombre_producto_base: string | null;
  variantes: any[] | null;
  pvp_peso: number | null;
  peso_desde: number | null;
  peso_hasta: number | null;
  cuenta_venta_id: string;
  cuenta_compra_id: string | null;
  cuenta_costo_id: string | null;
  costo_maximo: string;
  fecha_creacion: string;
  codigo_proveedor: string | null;
  lead_time: number;
  generacion_automatica: boolean;
  id_integracion_proveedor: string | null;
  detalle_variantes: any[];
}

export interface CreateProduct {
  codigo: string; // Código único del producto (Obligatorio)
  nombre: string; // Nombre del producto (Obligatorio)
  estado: 'A'; // Estado del producto: Activo o Inactivo (Obligatorio)
  minimo: number; // Valor mínimo de stock (Obligatorio)
  pvp1: number; // Precio de venta 1 (Obligatorio)
  porcentaje_iva?: number | null; // Porcentaje de IVA (Opcional, valores: 0, 12, null)
  descripcion_departamento?: string; // Descripción del departamento (Opcional)
  imagen?: object; // Objeto Foto relacionado al producto (Opcional)
  para_comisariato?: boolean; // Indicador para comisariato (Opcional)
  indicador_peso?: '0' | '1' | '2'; // Indicador de balanza (Opcional)
  generacion_automatica?: boolean; // Variable de control para órdenes de compra (Opcional)
  cuenta_costo_id?: string; // ID de la cuenta de costo (Opcional)
  pvp2?: number; // Precio de venta 2 (Opcional)
  pvp3?: number; // Precio de venta 3 (Opcional)
  pvp4?: number; // Precio de venta 4 (Opcional)
  tipo?: 'PRO' | 'SER'; // Tipo de producto, por defecto "PRO" (Opcional)
  fecha_creacion?: string; // Fecha de creación (Opcional)
  id_integracion_proveedor?: string; // ID del proveedor (Opcional)
  para_supereasy?: boolean; // Indicador para Super Easy (Opcional)
  codigo_barra?: string; // Código de barras (Opcional)
  cuenta_venta_id?: string; // ID de la cuenta de ventas (Opcional)
  categoria_id?: string; // ID de la categoría (Opcional)
  marca_id?: string; // ID de la marca (Opcional)
  marca_nombre?: string; // Nombre de la marca (Opcional)
  personalizado1?: string; // Campo personalizado 1 (Opcional)
  personalizado2?: string; // Campo personalizado 2 (Opcional)
  producto_base_id?: string; // ID del producto base (Opcional)
  detalle_variantes?: object; // Detalles de variantes (Opcional)
}
